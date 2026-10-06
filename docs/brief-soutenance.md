# Brief de soutenance — Taylor Shift's Ticket Shop

Document de révision. Il explique le projet, pas ce qu'il faut dire :
le texte à lire est dans `docs/soutenance-script.md`.

---

## 1. Le projet en trois phrases

Taylor Shift vend ses billets sur une boutique PrestaShop. Le jour de
l'ouverture des ventes, le trafic est cent fois supérieur à la normale, et une
boutique en panne ce jour-là, c'est la vente perdue.

On a donc construit l'infrastructure de cette boutique sur AWS, entièrement
décrite dans du code : Terraform crée les ressources, Ansible les configure et
déploie l'application. Aucune action manuelle dans la console.

Résultat : la boutique se reconstruit à l'identique en une trentaine de
minutes, et passer de 1 à 3 serveurs se fait en changeant un chiffre.

---

## 2. La frontière Terraform / Ansible

C'est la question la plus probable du jury. La réponse doit être nette.

| | Terraform | Ansible |
|---|---|---|
| Rôle | crée ce qui **existe** | configure ce qu'il y a **dedans** |
| Exemples | VPC, sous-réseaux, EC2, RDS, EFS, load balancer, règles de pare-feu, rôles IAM | paquets, Docker, conteneur PrestaShop, montage NFS, fichiers de configuration |
| Se connecte en SSH ? | jamais | toujours |
| Crée une ressource AWS ? | toujours | jamais |

**La jonction entre les deux, c'est l'état Terraform.** Terraform y écrit les
faits (adresse de chaque serveur, point d'entrée de la base, identifiant de
l'EFS, nom du load balancer) ; Ansible les relit par l'inventaire dynamique.
Rien n'est recopié à la main entre les deux outils.

Phrase à retenir : *« Terraform décrit l'infrastructure, Ansible décrit la
configuration, et l'état Terraform est le seul passage entre les deux. »*

---

## 3. L'architecture, couche par couche

Un VPC `10.20.0.0/16`, découpé en sous-réseaux /20, répartis sur 2 zones de
disponibilité en dev et 3 en production. Trois niveaux :

### Niveau public — ce qui est joignable depuis Internet

| Composant | Ce qu'il fait | Qui peut lui parler |
|---|---|---|
| Load balancer (ALB) | reçoit toutes les requêtes des visiteurs et les répartit | Internet, port 80 (443 si un certificat est fourni) |
| Bastion | serveur de rebond ; Ansible passe par lui pour atteindre les serveurs privés | port 22, uniquement depuis l'IP de l'administrateur |
| Passerelle NAT | permet aux serveurs privés de **sortir** (téléchargement de l'image Docker, mises à jour) sans être joignables de l'extérieur | — |

### Niveau application privé — là où tourne la boutique

Les serveurs EC2 Ubuntu, chacun avec un conteneur Docker
`prestashop/prestashop:8.2.8-apache`.

Ils n'ont **aucune adresse publique**. Deux portes seulement :
- port 80, ouvert uniquement depuis le groupe de sécurité du load balancer ;
- port 22, ouvert uniquement depuis le groupe de sécurité du bastion.

Les règles ne citent pas des adresses IP mais d'autres groupes de sécurité.
C'est important : quand on ajoute un serveur, il hérite de la règle sans qu'on
ait à la modifier.

### Niveau données privé — ce qui doit survivre

| Composant | Ce qu'il contient | Qui peut lui parler |
|---|---|---|
| Base RDS MySQL 8.0 | commandes, produits, clients, configuration de la boutique | port 3306, uniquement depuis les serveurs applicatifs |
| Disque partagé EFS | images produits, factures, sessions PHP | port 2049 (NFS), uniquement depuis les serveurs applicatifs |

### Surveillance

Trois alarmes CloudWatch, reliées à un sujet SNS qui envoie un mail :
- au moins un serveur hors rotation du load balancer ;
- temps de réponse moyen au-dessus du seuil (la flotte sature, il faut ajouter
  un serveur) ;
- erreurs 5xx au-dessus de 10.

---

## 4. Le chemin d'une requête

1. Le visiteur ouvre l'URL de la boutique.
2. Le load balancer reçoit la requête sur le port 80.
3. Il la transmet à un des serveurs EC2 marqués « sain », sur le port 80.
4. Le conteneur Apache/PHP de ce serveur traite la requête.
5. PrestaShop lit et écrit les données dans la base RDS.
6. Il lit les images et écrit la session PHP sur le disque partagé EFS.
7. La réponse repart par le load balancer.

En parallèle, toutes les 15 secondes, le load balancer interroge
`/health.php` sur chaque serveur. Deux échecs consécutifs et le serveur est
retiré de la rotation ; les requêtes en cours ont 30 secondes pour se terminer
avant la coupure (drainage de connexions).

---

## 5. Le principe central : un serveur ne contient rien d'unique

C'est le cœur du projet. Si tu ne retiens qu'une chose, c'est celle-là.

| Donnée | Où elle vit |
|---|---|
| Commandes, produits, clients | base RDS |
| Images produits, factures, sessions PHP | disque partagé EFS |
| Cache compilé par PHP | disque local du serveur — reconstructible |

Conséquence directe : un serveur est **jetable**. On peut en ajouter un, en
perdre un, en remplacer un, sans perdre une commande et sans qu'un visiteur
soit déconnecté de son panier (sa session est sur le disque partagé, pas sur le
serveur qui l'a servi).

C'est ce qui rend la montée en charge possible. Sans ça, ajouter un serveur
voudrait dire répliquer des données, et ce ne serait plus un changement de
variable.

---

## 6. Comment on encaisse le trafic

Quatre leviers, du plus simple au plus structurel.

**a) La répartition.** Le load balancer distribue les requêtes entre tous les
serveurs sains. C'est acquis par construction.

**b) L'ajout de serveurs (horizontal).** `app_instance_count` passe de 1 à 3,
`terraform apply`, puis le playbook Ansible. Terraform crée les instances et
les inscrit dans le groupe cible ; Ansible les configure ; le load balancer
commence à leur envoyer du trafic dès qu'elles répondent au contrôle de santé.
Aucun fichier d'inventaire à modifier : il est généré depuis l'état Terraform.

**c) L'agrandissement (vertical).** `app_instance_type` et `db_instance_class`
pour passer à des machines plus grosses. Utile pour la base, qui ne se
multiplie pas horizontalement dans ce projet.

**d) Les protections.** Contrôle de santé toutes les 15 s, drainage de
connexions de 30 s, et un cookie d'affinité qui garde un visiteur sur le même
serveur pendant sa visite — ce n'est pas obligatoire ici (les sessions sont
partagées) mais ça améliore le cache.

**La décision d'ajouter un serveur vient des alarmes**, pas d'une intuition :
si le temps de réponse moyen dépasse le seuil, la flotte sature.

---

## 7. Les secrets — la chaîne complète

Deux secrets, deux mécanismes différents. C'est volontaire.

### Le mot de passe de la base de données

Personne ne le connaît, et c'est voulu.

1. Terraform le génère aléatoirement (40 caractères) ;
2. Terraform l'écrit dans AWS Secrets Manager ;
3. chaque serveur EC2 a un rôle IAM qui l'autorise à lire **ce secret
   précis** et rien d'autre ;
4. un script sur le serveur le récupère et l'écrit dans
   `/etc/prestashop/db.env`, lisible par root seulement, droits 0600 ;
5. Docker injecte ce fichier dans le conteneur.

Il ne passe jamais par ton poste, jamais par Ansible, jamais par Git.

### Le mot de passe administrateur de la boutique

Celui-là, il faut bien le choisir. Il est donc dans
`ansible/group_vars/all/vault.yml`, chiffré en AES256 par Ansible Vault, et
déchiffré au moment de l'exécution grâce à `--ask-vault-pass`.

Convention du dépôt : le coffre ne définit que des noms `vault_*`, et les
variables du rôle s'appellent `prestashop_*`. Si quelqu'un écrivait un mot de
passe en clair, ça se verrait immédiatement dans le diff.

### La clé SSH

Générée par Terraform, écrite en dehors du dépôt, et le `.gitignore` interdit
`*.pem`. Rien à copier, rien à partager.

### Si on te demande « et l'état Terraform, il contient le mot de passe ? »

Oui. C'est exactement pour ça qu'il est dans un bucket S3 chiffré, versionné,
avec les accès publics bloqués et une politique qui refuse toute requête non
chiffrée — et jamais dans Git.

---

## 8. L'inventaire dynamique

C'est l'exigence la plus pointue du sujet, et elle vaut des points.

Le fichier `ansible/inventory.yml` ne contient que deux lignes utiles :

```yaml
plugin: cloud.terraform.terraform_provider
project_path: ./terraform
```

Pas une seule adresse IP. Le mécanisme :

1. dans `terraform/ansible.tf`, le provider `ansible` écrit dans l'état un
   `ansible_host` par serveur et des `ansible_group` (`prestashop`, `bastion`,
   `env_dev`), avec les faits utiles en variables : point d'entrée de la base,
   identifiant de l'EFS, nom du load balancer, URL de la boutique ;
2. le plugin `cloud.terraform.terraform_provider` appelle `terraform show
   -json` et reconstruit l'inventaire à partir de ça.

Deux conséquences concrètes :
- passer de 1 à 3 serveurs ne demande **aucune** modification de fichier
  Ansible ;
- la commande SSH qui passe par le bastion (`ProxyCommand`) est elle aussi
  générée par Terraform, avec l'adresse réelle du bastion.

---

## 9. L'idempotence

**Définition :** relancer le playbook sur une infrastructure déjà configurée ne
doit rien changer. Dans le résumé Ansible : `changed=0`.

**Pourquoi c'est noté :** c'est la preuve que le code décrit un *état* et non
une suite d'actions. Un script qui n'est pas idempotent ne peut pas être relancé
en confiance, donc il n'est pas utilisable en exploitation.

**Comment on l'obtient ici :**
- les templates ne contiennent aucun horodatage — une date dans un fichier
  généré, et il change à chaque exécution ;
- le script qui récupère le mot de passe compare avant d'écrire, et annonce
  `changed` ou `uptodate` ;
- l'installation de la boutique se fait dans un conteneur jetable, séparé du
  conteneur de service ; le conteneur qui sert la boutique est toujours créé
  avec l'installateur désactivé, donc une seconde exécution n'a rien à faire ;
- l'installation est protégée par `run_once` : avec trois serveurs, un seul
  installe la base, les autres attendent au lieu de se faire la course ;
- les redémarrages passent par des handlers, donc ils n'ont lieu que si un
  fichier a réellement changé.

À raconter si on te demande comment tu l'as vérifié : on a lancé le playbook
une deuxième fois et on avait `changed=2`. La cause : une condition écrite
`'changed' in stdout`, et `changed` est contenu dans `unchanged`. Le test
disait l'inverse de ce qu'on croyait. Corrigé en comparaison exacte, la
troisième exécution a donné `changed=0`.

---

## 10. La séparation des environnements

Un seul jeu de code, trois dimensionnements. Tout est dans
`terraform/locals.tf`, dans une table `env_defaults` :

| | dev | staging | prod |
|---|---|---|---|
| Serveurs applicatifs | 1 | 2 | 3 |
| Type d'instance | t3.small | t3.small | t3.medium |
| Base | db.t3.micro | db.t3.small | db.t3.medium |
| Base répliquée (multi-AZ) | non | non | oui |
| Rétention des sauvegardes | 1 jour | 3 jours | 14 jours |
| Protection contre la suppression | non | non | oui |
| Passerelles NAT | 1 partagée | 1 partagée | 1 par zone |
| Journaux de flux réseau | non | non | oui |

Les mêmes modules, les mêmes ressources, seules les valeurs changent. Chaque
environnement a son fichier `environments/<env>.tfvars` et sa propre clé dans
le bucket d'état, donc un `apply` sur dev ne peut pas toucher prod.

Et toute valeur peut être forcée une par une : une variable explicite gagne
sur la valeur par défaut de l'environnement (`coalesce`).

---

## 11. Les problèmes réellement rencontrés

Ne les cache pas : ils montrent que le projet a tourné pour de vrai. Un jury
distingue tout de suite un projet déployé d'un projet écrit.

**1. AWS a refusé une description de groupe de sécurité.** On avait écrit
« internet -> load balancer ». AWS n'accepte pas le caractère `>` dans ce
champ. Correction : la flèche supprimée, et un script qui vérifie les 15
descriptions.

**2. `awscli` n'existe pas dans les dépôts d'Ubuntu 24.04.** La tâche
d'installation échouait. On a vérifié dans l'index des paquets : absent.
Correction : le paquet `python3-boto3`, et le script de récupération du secret
réécrit en Python.

**3. Le mot de passe a été exécuté par le shell.** Le script faisait `source
db.env` pour lire le mot de passe. Celui-ci contenait un `&`, que le shell a
interprété comme un opérateur : « commande introuvable ». Deux corrections,
parce qu'une seule n'aurait traité que le symptôme : le fichier est maintenant
lu avec `sed` et jamais évalué, et le jeu de caractères du mot de passe est
restreint.

**4. Le cache de PrestaShop ne supporte pas NFS.** L'installation réussissait
puis le conteneur mourait : « répertoire non vide » sur une suppression. Le
cache de Symfony fait des opérations que NFS ne garantit pas. Correction : le
cache est monté sur le disque local de chaque serveur, par-dessus le disque
partagé. C'est cohérent avec l'architecture — le cache est reconstructible,
donc il n'a aucune raison d'être partagé.

---

## 12. Les limites — à annoncer avant que le jury les trouve

- **Pas d'auto-scaling.** L'ajout de serveurs est volontaire : on change une
  variable. Automatiser demanderait un groupe d'auto-scaling et une image
  préconstruite, donc un autre modèle de déploiement — Ansible ne peut pas
  configurer une machine qui naît à 3 h du matin.
- **HTTPS prêt mais non activé en dev.** Il suffit de fournir un
  `certificate_arn` : l'écouteur 443 et la redirection existent déjà dans le
  code.
- **Base en une seule zone en dev.** La réplication multi-zone est activée en
  production.
- **Le bastion est verrouillé sur l'adresse IP du poste au moment du
  `apply`.** Si on change de réseau, il faut relancer `apply`. C'est un choix :
  l'alternative serait d'ouvrir le port 22 à tout Internet.
- **L'image Docker officielle n'est pas durcie.** Le sujet imposait l'image
  générique ; on ne l'a pas remplacée par une image maison.
- **Pas de chaîne d'intégration continue.** Le déploiement se lance à la main.

---

## 13. Le vocabulaire à employer correctement

| Mot | Ce que ça veut dire ici |
|---|---|
| Idempotence | relancer ne change rien |
| État (state) | le fichier où Terraform note ce qu'il a créé |
| Module | un bloc Terraform réutilisable (réseau, base, calcul...) |
| Rôle | un bloc Ansible réutilisable (common, efs, prestashop) |
| Handler | une action déclenchée seulement si un fichier a changé |
| Template | un fichier de configuration généré depuis des variables |
| Inventaire dynamique | la liste des serveurs, calculée au lieu d'être écrite |
| Groupe de sécurité | le pare-feu d'une ressource AWS |
| Bastion | le serveur de rebond pour atteindre le réseau privé |
| Contrôle de santé | la requête que le load balancer envoie pour savoir si un serveur répond |
| Drainage de connexions | laisser finir les requêtes en cours avant de retirer un serveur |
| Multi-AZ | la base répliquée dans une seconde zone de disponibilité |

---

## 14. Quel fichier ouvrir selon la question

| Si on te demande... | Ouvre |
|---|---|
| l'architecture globale | `terraform/main.tf` |
| la différence entre les environnements | `terraform/locals.tf` |
| qui peut parler à qui | `terraform/modules/security/main.tf` |
| le lien Terraform → Ansible | `terraform/ansible.tf` |
| l'inventaire dynamique | `ansible/inventory.yml` |
| l'ordre du déploiement | `ansible/site.yml` |
| la gestion des secrets | `ansible/roles/prestashop/tasks/config.yml` |
| l'installation unique de la boutique | `ansible/roles/prestashop/tasks/install.yml` |
| le conteneur et ses volumes | `ansible/roles/prestashop/tasks/deploy.yml` |
| les handlers | `ansible/roles/prestashop/handlers/main.yml` |
| le contrôle de santé et les alarmes | `terraform/modules/loadbalancer/main.tf` |

---

## 15. Questions probables et réponses courtes

**Pourquoi RDS et pas MySQL sur le serveur ?**
Parce que les serveurs applicatifs sont jetables. Une base sur un serveur
jetable, c'est une base qu'on perd. RDS apporte en plus les sauvegardes
automatiques et la réplication multi-zone sans code de notre part.

**Pourquoi un EFS, alors que le disque de l'instance suffirait ?**
Avec un seul serveur, oui. Avec trois, un visiteur qui téléverse une image sur
le serveur 1 ne la verrait pas depuis le serveur 2. Le disque partagé est ce
qui permet d'avoir plusieurs serveurs.

**Pourquoi un bastion plutôt qu'une IP publique sur les serveurs ?**
Pour qu'il n'y ait qu'une seule porte d'entrée SSH, verrouillée sur une
adresse, au lieu d'une par serveur.

**Où est le mot de passe de la base ?**
Dans Secrets Manager. Généré par Terraform, lu par chaque serveur avec son rôle
IAM. Personne ne l'a jamais vu.

**Comment savez-vous que le playbook est idempotent ?**
On l'a lancé deux fois. La première fois la deuxième exécution donnait
`changed=2` ; on a trouvé la cause et corrigé ; maintenant c'est `changed=0`.

**Comment passez-vous à 3 serveurs ?**
`app_instance_count = 3`, `terraform apply`, puis le playbook. L'inventaire
suit automatiquement puisqu'il est lu dans l'état Terraform.

**Que se passe-t-il si un serveur tombe ?**
Le contrôle de santé le détecte en 30 secondes environ et le load balancer
arrête de lui envoyer du trafic. Les visiteurs ne perdent pas leur panier :
leur session est sur le disque partagé.

**Et si la base tombe ?**
En production, elle est répliquée dans une seconde zone et bascule
automatiquement. En dev, elle est restaurée depuis la sauvegarde.

**Pourquoi l'état Terraform dans S3 ?**
Pour qu'on soit trois à travailler dessus sans s'écraser. Le bucket est
chiffré, versionné, et le verrouillage empêche deux `apply` simultanés.

**Vous avez utilisé du code de la communauté ?**
Oui, le rôle `geerlingguy.docker` depuis Ansible Galaxy, pour installer Docker.
C'est 40 lignes qu'on n'a pas à maintenir nous-mêmes. Le reste des rôles est le
nôtre.
