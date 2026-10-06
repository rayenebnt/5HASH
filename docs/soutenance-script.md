# Soutenance — texte à lire

Ce texte accompagne `docs/soutenance-5hash.pptx`. Il est **aussi dans les notes
de présentateur** de chaque diapositive : en mode Présentateur, la diapositive
s'affiche au mur et le texte sur votre écran.

Lisez-le deux fois à voix haute, retenez les phrases en gras, dites le reste avec
vos mots.

**Durée : 12 minutes de présentation, 4 minutes de démonstration, puis
questions.**

| # | Diapositive | Qui parle | Temps |
|---|---|---|---|
| 1 | Titre | 1 | 40 s |
| 2 | Trois questions | 1 | 50 s |
| 3 | Architecture | 1 | 1 min 30 |
| 4 | Nos choix | 1 | 1 min 20 |
| 5 | Terraform | 2 | 1 min 20 |
| 6 | Ansible | 2 | 1 min 30 |
| 7 | Montée en charge | 2 | 1 min 10 |
| 8 | Pannes | 2 | 1 min 10 |
| 9 | Problèmes rencontrés | 3 | 1 min 30 |
| 10 | Limites | 3 | 1 min 10 |
| 11 | Démonstration | 3 | 4 min |
| 12 | Conclusion et questions | tous | — |

---

## 1 — Titre

Bonjour. Nous sommes l'agence 5HASH. Taylor Shift nous a confié l'infrastructure
de sa boutique de billets.

L'application existe déjà : c'est PrestaShop, l'image publiée sur Docker Hub.
**Nous ne touchons pas au code du site.** Notre travail, c'est de l'héberger, de
le configurer, et de faire en sorte qu'il tienne le jour de l'ouverture des
ventes.

Nous avons utilisé deux outils : **Terraform pour créer l'infrastructure, Ansible
pour configurer les serveurs.** Tout est déployé sur un compte AWS réel, en
région Paris. Nous ferons une démonstration à la fin.

---

## 2 — Trois questions au départ

Avant de choisir les technologies, nous avons posé trois questions.

**Première question : par où passent les requêtes ?** C'est la question du réseau
et de la sécurité. Notre réponse : un seul point d'entrée public, et tout le
reste dans des réseaux privés.

**Deuxième question : comment absorber un pic de trafic ?** Une ouverture de
billetterie, c'est un pic, pas une charge régulière. Notre réponse : les serveurs
ne stockent aucune donnée, donc on peut en ajouter à la demande.

**Troisième question : que se passe-t-il en cas de panne ?** Notre réponse : le
load balancer retire automatiquement le serveur en panne, et les autres
continuent de répondre.

Chaque choix que nous présentons ensuite répond à l'une de ces trois questions.

---

## 3 — Architecture

*(Diapositive importante. Montrez les trois niveaux avec la main, de haut en
bas.)*

Voici l'architecture. Elle se lit de haut en bas, dans le sens d'une requête.

**Premier niveau : le réseau public.** Il contient deux éléments. Le load
balancer, qui est le seul point d'entrée des clients : il répartit les requêtes
entre les serveurs et vérifie leur état toutes les quinze secondes. Et le
bastion, qui sert uniquement à notre accès SSH : il est ouvert à une seule
adresse IP, la nôtre. Aucun client ne passe par le bastion.

**Deuxième niveau : le réseau privé applicatif.** Il contient les serveurs EC2
avec le conteneur PrestaShop. Ils sont identiques entre eux, répartis sur les
deux zones de disponibilité, et ils n'ont aucune adresse IP publique : on ne peut
les joindre qu'à travers le load balancer.

**Troisième niveau : le réseau privé des données.** La base MySQL d'un côté, le
disque partagé de l'autre. Ce niveau n'a aucune route vers Internet.

*(Pause avant la phrase suivante.)*

Le point à retenir : **les serveurs ne stockent aucune donnée.** Le catalogue et
les commandes sont dans la base, les images et les sessions sur le disque
partagé. C'est ce qui permet d'ajouter ou de perdre un serveur sans conséquence
— et c'est la base des deux diapositives suivantes.

---

## 4 — Nos choix

Le sujet nous laissait libres de choisir ce qui tourne sur EC2 et ce qu'on confie
à un service managé. Voici nos choix.

**L'application** tourne dans un conteneur Docker sur une instance EC2. C'est ce
que demande le sujet. Le conteneur donne un environnement identique partout, et
changer de version de PrestaShop revient à modifier une ligne.

**La base de données est managée**, c'est RDS. AWS gère les sauvegardes
automatiques, les mises à jour de sécurité et le basculement vers une instance de
secours. Nous n'avons pas voulu réécrire ça nous-mêmes.

**Pour les fichiers**, il fallait un stockage que plusieurs serveurs lisent et
écrivent en même temps. Un disque EBS ne se partage pas entre instances, EFS si.

**Pour les secrets**, le mot de passe de la base est généré par Terraform et
déposé dans Secrets Manager. Il n'est pas dans le dépôt. Chaque serveur va le
chercher avec son propre rôle IAM. Seuls les identifiants du back-office sont
dans le dépôt, chiffrés avec Ansible Vault.

**Enfin**, les serveurs n'ont pas d'adresse publique. L'accès administration
passe par un bastion, ouvert à notre seule adresse IP.

---

## 5 — Terraform

Terraform crée l'infrastructure. On décrit les ressources voulues, Terraform les
crée et retient ce qu'il a créé.

Nous avons découpé le code en **six modules**, un par couche : le réseau, les
groupes de sécurité, le stockage, la base, les instances et le load balancer.
Chaque module a ses variables documentées et ses sorties. On peut en relire un
sans lire les autres.

**Pour les environnements**, nous avons dev, staging et prod. C'est le même code.
Une table de variables définit les tailles : en dev, un serveur et une base
simple ; en prod, trois serveurs sur trois zones, une base avec instance de
secours, et quatorze jours de sauvegardes. On change une variable, pas le code.

**L'état Terraform**, c'est-à-dire la liste de ce qui a été créé, est stocké dans
un bucket S3 versionné et chiffré, avec un verrou. C'est nécessaire à trois :
sans ça, deux personnes peuvent modifier l'infrastructure en même temps.

**Enfin, trois valeurs sont lues automatiquement** à l'exécution : l'identifiant
de l'image Ubuntu, la liste des zones disponibles, et notre adresse IP publique.
Cette dernière sert à autoriser l'accès SSH au bastion.

---

## 6 — Ansible

Ansible configure les serveurs créés par Terraform : il installe Docker, monte le
disque partagé, récupère le mot de passe de la base et démarre le conteneur
PrestaShop.

**Le point d'intégration entre les deux outils est ici.** Terraform connaît les
adresses des serveurs. Plutôt que de les recopier dans un fichier d'inventaire,
Terraform les déclare dans son état, et Ansible les lit depuis cet état avec un
plugin d'inventaire dynamique.

Conséquence : **il n'y a aucune adresse IP écrite à la main dans le projet.**
Quand on ajoute un serveur avec Terraform, il apparaît automatiquement dans
l'inventaire Ansible.

Nous avons écrit **trois rôles réutilisables** : `common`, `efs` et
`prestashop`. Le bastion et les serveurs applicatifs utilisent le même rôle
`common`, avec des variables différentes. Pour Docker, nous avons utilisé un rôle
existant d'Ansible Galaxy plutôt que de le réécrire.

Les identifiants du back-office sont chiffrés avec Ansible Vault. Le mot de passe
de la base n'est pas dans le dépôt du tout.

*(Montrez l'encadré vert.)*

Enfin, **le playbook est idempotent** : il décrit l'état voulu, pas une suite
d'étapes. À la deuxième exécution, il affiche `changed=0` : il ne modifie rien,
parce que tout est déjà en place.

---

## 7 — Montée en charge

Voici comment nous répondons à un pic de trafic.

Les serveurs ne stockent aucune donnée : les commandes sont dans la base, les
images et les sessions sur le disque partagé. **Ajouter de la capacité revient
donc à modifier une variable.**

Deux commandes. La première, Terraform, crée les serveurs, les répartit sur les
zones et les enregistre auprès du load balancer. La deuxième, Ansible, les
configure. Comme le playbook est idempotent, **il ne touche pas aux serveurs déjà
en service**. L'opération prend environ trois minutes, sans interruption.

Pour savoir quand le faire, **trois alarmes CloudWatch** sont créées avec le load
balancer. La première surveille le temps de réponse : au-delà de deux secondes en
moyenne sur trois minutes, les serveurs saturent. La deuxième compte les serveurs
retirés de la rotation. La troisième compte les erreurs serveur. Les trois
notifient une adresse mail.

---

## 8 — Pannes

Nous avons mesuré le comportement dans chaque cas de panne.

**Un serveur tombe.** Le load balancer le vérifie toutes les quinze secondes.
Après deux échecs, soit environ trente secondes, il le retire de la rotation. Les
requêtes déjà en cours ont trente secondes supplémentaires pour se terminer. Le
client ne voit rien : il est servi par les autres serveurs.

**Une zone de disponibilité tombe.** Le load balancer a un nœud par zone, il
cesse d'utiliser celui de la zone en panne. Les serveurs des autres zones
prennent le relais. Aucune action de notre part.

**La base de données tombe.** En production, elle a une instance de secours dans
une autre zone. Le basculement prend entre une et deux minutes. Il y a des
erreurs pendant ce temps, nous ne le cachons pas, puis le service revient.

**Le bastion tombe.** Aucune conséquence pour les clients : il ne sert qu'à
l'administration. Il faut le recréer, ce qui prend deux minutes.

*(Pause, puis l'encadré orange.)*

Un point important : **le panier du client est conservé.** Les sessions PHP sont
stockées sur le disque partagé, pas sur le serveur. Si un serveur tombe, le
client continue son achat sur un autre.

---

## 9 — Problèmes rencontrés

Nous présentons cette diapositive parce qu'elle montre ce que le déploiement réel
apporte.

Le code était écrit, relu et vérifié. **En le déployant sur un compte AWS, nous
avons rencontré quatre erreurs** qu'une relecture n'aurait pas montrées.

**Première erreur** : AWS n'accepte qu'un jeu de caractères limité dans les
descriptions de groupes de sécurité. Nous avions écrit une flèche avec un
chevron. La création du groupe a échoué.

**Deuxième erreur** : le paquet `awscli` n'existe plus dans les dépôts d'Ubuntu
24.04. Installer la version officielle représentait soixante mégaoctets par
serveur pour un seul appel. Nous l'avons remplacé par la bibliothèque Python
boto3, déjà disponible dans les dépôts de base.

**Troisième erreur** : notre script chargeait le fichier de configuration avec la
commande `source` du shell. Le mot de passe de la base, généré aléatoirement,
contenait une esperluette. Le shell l'a interprétée comme un séparateur de
commande. Nous lisons maintenant ce fichier sans l'interpréter, et nous avons
restreint les caractères du mot de passe généré.

**Quatrième erreur** : sur un disque réseau, supprimer un fichier encore ouvert
laisse une entrée temporaire. Le vidage de cache de PrestaShop échouait donc
après l'installation, et arrêtait le conteneur. Nous avons déplacé ce cache sur
le disque local de chaque serveur, puisqu'il est propre à chaque serveur et
régénérable.

**Les quatre corrections sont dans le dépôt.** Un déploiement depuis zéro ne les
rencontre plus.

---

## 10 — Limites

Voici les limites de notre solution.

**Première limite, la principale : la montée en charge n'est pas automatique.**
Elle demande un opérateur et deux commandes, environ trois minutes. Pour
l'automatiser, il faudrait construire à l'avance une image serveur préconfigurée,
avec Packer, puis utiliser un groupe d'autoscaling derrière le même load
balancer. Notre rôle Ansible et notre page de santé sont déjà compatibles avec
cette évolution.

**Deuxième limite** : le site entier est sur le disque partagé. Cela rend les
serveurs interchangeables, mais un disque réseau est plus lent qu'un disque local
pour lire des fichiers PHP. Au-delà de quelques milliers de requêtes par minute,
il faudrait mettre le code dans l'image Docker et ne partager que les images
produits.

**Troisième limite** : une seule base en écriture. On peut répartir les lectures
sur des réplicas, pas les écritures. Une billetterie écrit beaucoup, donc la
taille de l'instance principale est notre plafond.

**Quatrième limite** : une seule région. Une panne régionale interrompt le
service. À cette échelle, le multi-région coûterait plus cher que la panne qu'il
évite. C'est un choix, pas un oubli.

---

## 11 — Démonstration

> **À faire avant de passer** : lancez `terraform apply` puis le playbook, et
> vérifiez que la boutique répond. Gardez deux onglets ouverts : la boutique et
> le back-office. **Ne déployez pas en direct** : la création de la base prend
> douze minutes.

Voici l'ensemble des commandes nécessaires. **Six commandes.**

La première ne se lance qu'une fois par compte AWS : elle crée le bucket S3 qui
stocke l'état Terraform.

Ensuite, Terraform : `init` puis `apply`. L'opération prend une douzaine de
minutes, dont la majorité pour la création de la base de données.

Puis Ansible : on installe les dépendances depuis Galaxy, on vérifie
l'inventaire, et on lance le playbook. **La commande du milieu affiche la liste
des serveurs** : aucune adresse n'y est écrite, elle vient de l'état Terraform.

### Les quatre points à montrer

**1. La boutique et le back-office.** Ouvrez le catalogue, cliquez sur un
produit, puis connectez-vous au back-office.
> « Le catalogue vient de RDS, les images du disque partagé. »

**2. Le playbook relancé.**
`ansible-playbook -i ansible/inventory.yml ansible/site.yml --ask-vault-pass`
> « changed=0 : aucune modification, les serveurs sont déjà dans l'état décrit. »

**3. L'ajout d'un serveur.**
`terraform -chdir=terraform apply -var app_instance_count=2`, puis le playbook.
Montrez `ansible-inventory --graph` : le nouveau serveur y est apparu seul. Puis
la console AWS : deux serveurs sains dans le groupe de cibles.

**4. L'arrêt d'un serveur.** Sur une instance : `sudo docker stop prestashop`.
Rafraîchissez la boutique : **elle répond toujours**, servie par l'autre serveur.
Dans la console AWS, le premier passe en `unhealthy` après une trentaine de
secondes.

---

## 12 — Conclusion et questions

La boutique est **déployée** sur un compte AWS réel. Elle est **documentée** : le
README explique comment la déployer, l'exploiter, la mettre à l'échelle, la
dépanner et la supprimer. Et elle est **reproductible** : nous l'avons détruite
et redéployée pour le vérifier.

Merci de votre attention, nous répondons à vos questions.

### Réponses préparées

**« Pourquoi pas d'autoscaling ? »**
Parce que nos serveurs sont configurés par Ansible après leur création. Un groupe
d'autoscaling lancerait des machines non configurées. Pour le faire correctement,
il faudrait d'abord construire une image préconfigurée avec Packer. Nous avons
préféré livrer une solution qui fonctionne et dont nous connaissons la limite.

**« Pourquoi EFS et pas S3 ? »**
Parce que PrestaShop écrit sur un système de fichiers. Utiliser S3 demanderait
d'installer un module PrestaShop supplémentaire. Avec EFS, l'application ne voit
pas de différence.

**« Où est le mot de passe de la base ? »**
Dans AWS Secrets Manager. Terraform le génère et l'y dépose ; chaque serveur le
lit avec son rôle IAM. Il n'est ni dans le dépôt, ni dans l'inventaire Ansible.

**« Et si le bastion tombe pendant une vente ? »**
Aucune conséquence : il ne sert qu'à l'administration. Les instances acceptent
aussi SSM Session Manager, qui ne passe pas par le bastion.

**« Combien ça coûte ? »**
Environ deux à trois dollars par jour pour l'environnement dev. Les postes
principaux sont la passerelle NAT et le load balancer, pas les instances.

**« Comment changez-vous de version de PrestaShop ? »**
C'est une variable dans les `group_vars` Ansible. On modifie le tag de l'image et
on relance le playbook, après une sauvegarde de la base.

**« Pourquoi trois niveaux de réseau ? »**
Pour que la base n'ait aucune route vers Internet, et que les serveurs n'aient
aucune adresse publique. Seul le niveau public est exposé, et il ne contient que
le load balancer et le bastion.

**« Avez-vous testé sur Floci ? »**
Oui, et c'est documenté dans le README. EC2 et RDS y sont de vrais conteneurs,
mais EFS n'a pas de plan de données NFS, le load balancer ne transmet aucun
paquet, et les instances ne peuvent pas exécuter Docker. Comme le sujet impose
l'image PrestaShop sur EC2, nous avons visé AWS réel. Un profil Floci reste dans
le dépôt pour tester la partie Terraform sans frais.
