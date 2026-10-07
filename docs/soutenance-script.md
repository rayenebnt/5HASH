# Soutenance — texte à lire

Accompagne `docs/soutenance-5hash.pptx` (6 diapositives). Le texte est aussi
dans les **notes de présentateur** de chaque diapositive.

Lisez-le deux fois à voix haute, retenez les phrases en gras, dites le reste
avec vos mots.

---

## Le partage du temps, et pourquoi

Le barème donne 3 points à la présentation : explication claire (1),
démonstration opérationnelle (1), justification des choix (1).

Mais surtout : **la démonstration est la seule preuve des 10 points de
« Solution fonctionnelle » et des 4 points d'inventaire dynamique et
d'idempotence.** Un jury qui n'a pas vu la boutique répondre ne peut pas
attribuer ces points. C'est pourquoi les diapositives tiennent en 6 écrans.

| # | Diapositive | Qui parle | Temps |
|---|---|---|---|
| 1 | Titre | P1 | 30 s |
| 2 | Architecture | P1 | 1 min 30 |
| 3 | Les deux outils | P2 | 1 min 15 |
| 4 | Justification des choix | P2 | 1 min 30 |
| 5 | Démonstration (annonce) | P3 | 30 s |
| — | **Démonstration en direct** | P3 pilote, P2 commente | **7 min** |
| 6 | Bilan | P3 | 45 s |

Total : environ 6 minutes de diapositives, 7 minutes de démonstration, puis
les questions.

**Si vous n'avez que 10 minutes :** diapositive 4 réduite à trois lignes (base
de données, disque partagé, secrets) et étape 5 de la démonstration
supprimée. Ne coupez jamais les étapes 1 à 4 : ce sont elles qui portent les
points.

---

# PRÉPARATION — à faire avant d'entrer

À lire la veille. Une démonstration ratée coûte plus cher qu'une diapositive
en moins.

1. **Déployez l'infrastructure avant la soutenance.** `terraform apply` prend
   douze minutes : jamais devant le jury.
2. **Faites l'`apply` depuis le réseau de la salle**, ou relancez-le une fois
   sur place. Le pare-feu du bastion est verrouillé sur l'adresse IP publique
   du poste au moment de l'`apply` : depuis un autre réseau, l'étape 4 de la
   démonstration échouera. Relancer sur place ne change que cette règle et
   prend moins d'une minute.
3. **Lancez le playbook une première fois** après l'`apply`, pour que
   l'installation de la boutique soit déjà faite. Pendant la démonstration,
   vous le relancez — il doit afficher `changed=0`.
4. **Ouvrez les onglets à l'avance** : la boutique, et le back-office avec la
   session déjà ouverte.
5. **Agrandissez la police du terminal** et placez-vous dans le dépôt
   (`cd ~/5HASH`), écran vidé.
6. **Ayez le mot de passe du vault sous la main**, vous allez le taper.
7. **Préparez un recours** : une capture d'écran ou un enregistrement de
   l'étape 4 montrant `changed=0`. Si le réseau de la salle tombe, vous
   montrez l'enregistrement et vous le dites franchement. Un recours annoncé
   vaut mieux qu'un écran noir.
8. **Vérifiez que les sorties répondent** : `terraform -chdir=terraform output`.

---

## 1 — Titre · 30 s · P1

Bonjour. Nous sommes l'agence 5HASH. Taylor Shift nous a confié
l'infrastructure de sa boutique de billets.

L'application existe déjà : c'est PrestaShop, l'image publiée sur Docker Hub.
**Nous ne touchons pas au code du site.** Notre travail, c'est de l'héberger,
de le configurer, et de faire en sorte qu'il tienne le jour de l'ouverture des
ventes.

Deux outils : **Terraform crée l'infrastructure, Ansible configure les
serveurs.** Tout est déployé sur un compte AWS réel, en région Paris.

**Nous avons fait court sur les diapositives : quatre écrans, cinq minutes.
L'essentiel est dans la démonstration, parce que c'est elle qui prouve que la
solution fonctionne.**

---

## 2 — Architecture · 1 min 30 · P1

Voici l'architecture. Elle se lit de haut en bas, dans le sens d'une requête.

**Premier niveau, le réseau public.** Deux choses. Le load balancer, seul point
d'entrée des clients : il répartit les requêtes entre les serveurs et vérifie
leur état toutes les quinze secondes. Et le bastion, qui sert uniquement à
notre accès SSH : il est ouvert à une seule adresse IP, la nôtre. Aucun client
ne passe par le bastion.

**Deuxième niveau, le réseau privé applicatif.** Les serveurs EC2, avec le
conteneur PrestaShop. Ils sont identiques entre eux, répartis sur les deux
zones de disponibilité, et **ils n'ont aucune adresse IP publique** : on ne
peut les joindre qu'à travers le load balancer.

**Troisième niveau, le réseau privé des données.** La base MySQL d'un côté, le
disque partagé de l'autre. Ce niveau n'a aucune route vers Internet.

Le point à retenir, c'est la phrase du bas : **les serveurs ne stockent aucune
donnée.** Le catalogue et les commandes sont dans la base, les images et les
sessions sur le disque partagé. C'est ce qui permet d'ajouter ou de perdre un
serveur sans conséquence — et c'est la raison de presque tous nos choix.

---

## 3 — Les deux outils · 1 min 15 · P2

Nos deux outils, et la frontière entre eux.

**Terraform crée ce qui existe** : le réseau, les serveurs, la base, le load
balancer. Le code est découpé en six modules, un par couche, chacun avec ses
variables et ses sorties. Les trois environnements — dev, staging, production —
utilisent les mêmes modules : seul le dimensionnement change. L'état est dans
un bucket S3 chiffré et versionné, avec un verrouillage : nous sommes trois, et
sans ça deux personnes peuvent modifier l'infrastructure en même temps.

**Ansible configure ce qu'il y a dedans** : les paquets, Docker, le conteneur
PrestaShop, le montage du disque partagé. Trois rôles sont les nôtres, et nous
avons pris le rôle Docker sur Ansible Galaxy plutôt que de le réécrire. Chaque
fichier de configuration est un template généré depuis des variables, et les
redémarrages passent par des handlers : ils n'ont lieu que si un fichier a
vraiment changé.

Et voici le point important. **Terraform ne se connecte jamais en SSH, Ansible
ne crée jamais de ressource AWS. Leur seul point de rencontre, c'est l'état
Terraform.** Terraform y écrit l'adresse de chaque serveur et les coordonnées
de la base ; l'inventaire Ansible les relit. Cet inventaire ne contient que
deux lignes utiles — nous vous le montrerons dans un instant.

---

## 4 — Justification des choix · 1 min 30 · P2

Le sujet nous laissait libres de répartir. Voici nos choix, et à chaque fois
l'option qu'on a écartée — **parce qu'un choix ne se justifie que par rapport à
son alternative.**

**La base de données est managée, c'est RDS.** L'alternative était MySQL sur
l'instance : la base disparaîtrait avec le serveur, et il faudrait écrire
nous-mêmes les sauvegardes et le basculement.

**Les images et les sessions sont sur EFS.** Un disque EBS ne se partage pas
entre instances : un visiteur qui téléverse une image sur le premier serveur ne
la verrait pas depuis le second.

**Le point d'entrée est un load balancer.** Une répartition par DNS n'a aucun
contrôle de santé : les clients continueraient d'arriver sur un serveur en
panne.

**La montée en charge se fait en changeant une variable.** L'alternative serait
l'auto-scaling, mais nos serveurs sont configurés par Ansible après leur
création : une machine qui naîtrait automatiquement à trois heures du matin
naîtrait sans configuration. Il faudrait d'abord construire une image
préconfigurée. **C'est un choix assumé, pas un oubli.**

**Le mot de passe de la base est dans Secrets Manager**, lu par chaque serveur
avec son propre rôle IAM. Une variable chiffrée dans le dépôt finirait dans
l'historique Git, et un historique ne s'efface pas.

Et **l'accès administration passe par un bastion** ouvert à une seule adresse,
plutôt qu'une adresse publique sur chaque serveur.

Le fil conducteur est toujours le même : un serveur ne contient rien d'unique.

---

## 5 — Annonce de la démonstration · 30 s · P3

Nous passons à la démonstration. Cinq étapes, et à chaque fois nous disons ce
qu'elle prouve.

Une précision d'abord : **l'infrastructure a été créée avant la soutenance.**
La création complète prend douze minutes, dont l'essentiel pour la base de
données. Nous l'avons détruite et redéployée pour vérifier que c'est
reproductible.

---

# LA DÉMONSTRATION — 7 minutes

Suivez l'ordre. Il est classé par valeur : si le temps manque, on coupe par la
fin, jamais par le début.

## Étape 1 — La boutique répond · 45 s

**Ce que ça prouve : l'application est déployée et accessible.**

```bash
terraform -chdir=terraform output -raw shop_url
```

Ouvrez l'onglet déjà chargé.

> « Voici la boutique. L'adresse est celle du load balancer, pas celle d'un
> serveur : les serveurs n'ont pas d'adresse publique. La page que vous voyez
> est servie par un conteneur Docker PrestaShop sur une instance EC2, dans un
> sous-réseau privé. »

## Étape 2 — Une commande passe · 1 min 30

**Ce que ça prouve : la base de données est bien connectée et fonctionnelle.**

Affichez d'abord où est la base :

```bash
terraform -chdir=terraform output database_endpoint
```

> « La base n'est pas sur le serveur. C'est une instance RDS, dans le
> sous-réseau privé des données, joignable uniquement depuis les serveurs
> applicatifs. »

Passez au back-office (onglet déjà connecté), **Catalogue → Produits**, ouvrez
un billet, changez son prix, enregistrez. Revenez sur l'onglet de la boutique
et rechargez.

> « Le nouveau prix du billet s'affiche. L'écriture est partie du back-office,
> elle est passée par la base, et elle revient côté client. **Une page qui
> s'affiche ne prouverait pas que la base fonctionne ; un aller-retour comme
> celui-ci, oui.** »

## Étape 3 — Les serveurs viennent de Terraform · 1 min

**Ce que ça prouve : l'inventaire est dynamique, aucune adresse n'est écrite à
la main.**

```bash
cat ansible/inventory.yml
terraform -chdir=terraform output app_instance_ids
ansible-inventory -i ansible/inventory.yml --graph
```

> « Le fichier d'inventaire ne contient que deux lignes utiles : le nom du
> plugin, et le chemin du code Terraform. Aucune adresse IP.
>
> La deuxième commande affiche les identifiants d'instances côté Terraform. La
> troisième affiche l'inventaire vu par Ansible : **ce sont les mêmes
> machines, et Ansible les a lues dans l'état Terraform.**
>
> Concrètement : quand on ajoute un serveur, on ne modifie aucun fichier
> Ansible. »

## Étape 4 — Le playbook est idempotent · 2 min 30

**Ce que ça prouve : le déploiement est rejouable, et la configuration est
décrite, pas scriptée.**

```bash
ansible-playbook -i ansible/inventory.yml ansible/site.yml --ask-vault-pass
```

Tapez le mot de passe du vault. **Pendant que ça tourne (deux à trois
minutes), P2 commente** — c'est le moment d'expliquer Ansible en détail, sans
coûter de temps de diapositive :

> « Pendant que ça tourne, un mot sur ce qu'il fait.
>
> Il demande un mot de passe parce que les identifiants du back-office sont
> chiffrés avec Ansible Vault, dans le dépôt. Le mot de passe de la base, lui,
> n'est nulle part dans le dépôt : chaque serveur va le chercher dans Secrets
> Manager avec son propre rôle IAM.
>
> Trois rôles s'enchaînent : un rôle de base commun à toutes les machines, le
> montage du disque partagé, et le rôle PrestaShop. Le rôle Docker vient
> d'Ansible Galaxy.
>
> Ce qu'il faut regarder, c'est la ligne de résumé à la fin. »

À la fin, montrez le récapitulatif.

> « **`changed=0`. Rien n'a été modifié.** L'infrastructure était déjà dans
> l'état décrit, donc Ansible n'a rien eu à faire. C'est ce qu'on appelle
> l'idempotence, et c'est ce qui permet de relancer un déploiement en
> confiance.
>
> On ne l'a pas eu du premier coup : la deuxième exécution affichait deux
> modifications. La cause était une condition qui vérifiait si le mot
> « changed » apparaissait dans la sortie d'un script — et « changed » est
> contenu dans « unchanged ». Le test disait l'inverse de ce qu'on croyait.
> Corrigé en comparaison exacte. »

## Étape 5 — Un serveur de plus · 1 min

**Ce que ça prouve : la solution se redéploie et monte en charge.**

Ouvrez `terraform/environments/dev.tfvars`, passez `app_instance_count` de 1 à
2, puis :

```bash
terraform -chdir=terraform plan
```

> « Terraform annonce ce qu'il créerait : une instance supplémentaire, son
> enregistrement dans le load balancer, et son entrée d'inventaire. **Les
> trois restent cohérents parce qu'ils viennent du même code.**
>
> Nous ne l'appliquons pas, ça prendrait trois minutes de plus. Mais c'est
> exactement l'opération que nous ferions la veille de l'ouverture des
> ventes : une variable, un `apply`, le playbook, et le load balancer envoie du
> trafic au nouveau serveur dès qu'il répond au contrôle de santé. »

Remettez la variable à 1 avant de fermer.

---

## 6 — Bilan · 45 s · P3

Pour conclure.

La boutique est déployée sur un compte AWS réel. Elle est documentée : le
README explique comment la déployer, l'exploiter, la mettre à l'échelle, la
dépanner et la supprimer. Et elle est reproductible : nous l'avons détruite et
redéployée pour le vérifier.

**La colonne du milieu, ce sont les quatre erreurs rencontrées au déploiement
réel et corrigées.** Nous les affichons volontairement : c'est la différence
entre une infrastructure écrite et une infrastructure qui a tourné.

**La colonne de droite, ce sont nos limites.** Nous préférons les annoncer que
les laisser découvrir.

Merci de votre attention, nous répondons à vos questions.

---

# RÉPONSES PRÉPARÉES

Laissez la diapositive 6 affichée : les trois colonnes servent de menu de
questions.

**Pourquoi pas d'auto-scaling ?**
Nos serveurs sont configurés par Ansible après leur création. Un groupe
d'auto-scaling lancerait des machines non configurées. Il faudrait d'abord
construire une image préconfigurée avec Packer. C'est un choix, pas un oubli.

**Pourquoi EFS et pas S3 ?**
PrestaShop écrit sur un système de fichiers. Passer par S3 demanderait un
module PrestaShop supplémentaire, donc une modification de l'application — et
le sujet nous demande de ne pas la modifier.

**Pourquoi RDS et pas MySQL sur l'instance ?**
Parce que nos serveurs sont jetables. Une base sur un serveur jetable, c'est
une base qu'on perd. RDS apporte en plus les sauvegardes et le basculement
sans code de notre part.

**Où est le mot de passe de la base ?**
Dans AWS Secrets Manager. Terraform le génère, chaque serveur le lit avec son
rôle IAM. Il n'est ni dans le dépôt, ni dans l'inventaire Ansible, et aucun de
nous ne le connaît.

**Il est dans l'état Terraform, alors ?**
Oui. C'est exactement pour ça que l'état est dans un bucket S3 chiffré,
versionné, accès publics bloqués, avec une politique qui refuse les requêtes
non chiffrées. Et jamais dans Git.

**Comment séparez-vous les environnements ?**
Une table dans `locals.tf` : mêmes modules, dimensionnement différent. Dev,
c'est un serveur et une base minimale ; production, trois serveurs, base
répliquée dans une seconde zone, quatorze jours de sauvegardes et protection
contre la suppression. Chaque environnement a aussi sa propre clé d'état, donc
un `apply` sur dev ne peut pas toucher la production.

**Que se passe-t-il si un serveur tombe ?**
Le load balancer le détecte en une trentaine de secondes et cesse de lui
envoyer du trafic. Les visiteurs ne perdent pas leur panier : leur session est
sur le disque partagé, pas sur le serveur.

**Et si la base tombe ?**
En production, elle est répliquée dans une autre zone et bascule
automatiquement, en une à deux minutes. Il y a des erreurs pendant ce temps,
nous ne le cachons pas. En dev, on restaure depuis la sauvegarde.

**Combien ça coûte ?**
Environ deux à trois dollars par jour pour l'environnement dev. Les deux
postes principaux sont la passerelle NAT et le load balancer.

**Comment changer de version de PrestaShop ?**
C'est une variable dans les `group_vars` Ansible. On modifie le tag de
l'image et on relance le playbook, après une sauvegarde de la base.

**Vous avez utilisé du code de la communauté ?**
Oui, le rôle `geerlingguy.docker` depuis Ansible Galaxy, pour installer Docker.
C'est du code maintenu que nous n'avons pas à suivre nous-mêmes. Les trois
autres rôles sont les nôtres.
