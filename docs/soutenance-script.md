# Soutenance — texte à lire

Accompagne `docs/soutenance-5hash.pptx`. Le même texte est dans les **notes de
présentateur** de chaque diapositive (mode Présentateur de PowerPoint : la
diapositive sur le vidéoprojecteur, les notes sur votre écran).

**Durée visée : 12 min de présentation + 4 min de démonstration + questions.**
Ne lisez pas mot à mot : les phrases sont écrites pour être dites, pas récitées.
Ce qui compte, ce sont les enchaînements en gras.

| # | Diapositive | Temps |
|---|---|---|
| 1 | Titre | 40 s |
| 2 | Les trois questions | 60 s |
| 3 | Architecture | 90 s |
| 4 | Placement des composants | 90 s |
| 5 | Terraform | 80 s |
| 6 | Ansible | 90 s |
| 7 | Gérer l'affluence | 80 s |
| 8 | Quand ça casse | 80 s |
| 9 | Les quatre bugs | 90 s |
| 10 | Limites assumées | 70 s |
| 11 | Démonstration | 4 min |
| 12 | Questions | — |

---

## 1 — Titre

Bonjour. Nous sommes l'agence 5HASH, et Taylor Shift nous a confié
l'infrastructure de sa boutique de billetterie.

L'application existe déjà : c'est PrestaShop, l'image générique publiée sur
Docker Hub. Notre travail, ce n'est pas le code du site : **c'est de lui donner
une maison qui tienne debout le jour où les billets partent en vente.**

Tout ce que vous allez voir est décrit en code — Terraform pour
l'infrastructure, Ansible pour la configuration — et tourne en ce moment sur un
vrai compte AWS, en région Paris. Nous ferons la démonstration à la fin.

---

## 2 — Les trois questions

Le sujet nous demande trois choses : déployer, configurer, documenter. Mais
derrière, il y a trois questions concrètes auxquelles une infrastructure doit
savoir répondre.

Première question : **comment une requête arrive jusqu'à la boutique ?** C'est
la question du chemin réseau et de la sécurité.

Deuxième : **que se passe-t-il quand le trafic est multiplié par dix ?** C'est
le cœur du sujet — une ouverture de billetterie, c'est un pic, pas une charge
régulière.

Troisième : **que se passe-t-il quand quelque chose casse ?** Parce que quelque
chose casse toujours.

Chaque décision que nous allons présenter répond à l'une de ces trois questions.
Si une décision ne répond à aucune, c'est qu'elle n'a pas sa place.

---

## 3 — Architecture

Voici l'architecture. Elle se lit de haut en bas, dans le sens d'une requête.

En haut, le seul point d'entrée public : **le load balancer applicatif**. Il est
présent dans chaque zone de disponibilité, il interroge chaque instance toutes
les quinze secondes sur une page de santé, et il sait retirer une instance de la
rotation.

À côté, **le bastion**. Il ne sert jamais aux clients : c'est uniquement la
porte par laquelle Ansible entre pour configurer la flotte. Il n'est ouvert qu'à
l'adresse IP de l'opérateur.

Au milieu, **les instances EC2** qui font tourner le conteneur PrestaShop. Elles
n'ont aucune adresse publique : on ne peut pas les joindre depuis Internet,
seulement à travers le load balancer.

En bas, **les données**. La base MySQL managée d'un côté, le système de fichiers
partagé de l'autre. Les sous-réseaux de ce niveau n'ont aucune route vers
Internet.

Le point important, et c'est celui qui rend tout le reste possible : **les
instances du milieu ne gardent rien.** Le catalogue est dans la base, les images
et les sessions sont sur le stockage partagé.

---

## 4 — Placement des composants

Le sujet nous laissait libres de choisir ce qui tourne sur EC2 et ce qu'on
confie à un service managé. Voici nos arbitrages, et le raisonnement derrière.

**PrestaShop tourne dans un conteneur Docker sur EC2.** Le sujet impose l'image
de Docker Hub et l'instance configurée par Ansible. Le conteneur nous donne un
environnement identique partout, et changer de version devient une ligne de
variable.

**La base, en revanche, nous ne voulons pas la gérer.** RDS nous donne les
sauvegardes automatiques, les correctifs, et surtout la bascule automatique vers
une instance de secours dans une autre zone. Écrire tout ça nous-mêmes, c'est du
travail que personne ne veut découvrir le soir de l'ouverture des ventes.

**Pour les fichiers, il fallait un stockage partagé** : plusieurs instances
doivent servir les mêmes photos de produits et les mêmes sessions PHP. Un disque
EBS ne se partage pas entre instances. EFS, si.

**Enfin, les secrets.** Le mot de passe de la base est généré par Terraform et ne
quitte jamais AWS : chaque instance va le chercher elle-même avec son propre rôle
IAM. Dans le dépôt, il n'y a que les identifiants du back-office, chiffrés avec
Ansible Vault.

---

## 5 — Terraform

Le module racine ne fait qu'assembler **six modules**, un par couche. Chacun a
ses variables documentées et ses sorties, et peut être relu ou remplacé seul.

**La séparation des environnements tient dans un seul endroit** : une table de
dimensionnement dans `locals.tf`. Le même code donne un environnement de
développement à une instance, et une production à trois instances réparties sur
trois zones, avec une base Multi-AZ et quatorze jours de sauvegardes. On change
une variable, pas du code.

**L'état est distant** : un bucket S3 versionné et chiffré, avec verrouillage,
créé par un module d'amorçage qu'on lance une fois par compte. C'est important
parce que l'état contient des secrets générés, et parce qu'à trois, on ne peut
pas travailler sur un fichier d'état local.

**Enfin, rien n'est écrit en dur.** L'AMI Ubuntu, la liste des zones, et même
l'adresse IP publique de la machine qui lance Terraform — c'est celle-là, et elle
seule, qui a le droit d'ouvrir une session SSH sur le bastion.

---

## 6 — Ansible

C'est le point d'intégration du projet, et celui dont nous sommes le plus
contents.

**Terraform sait déjà tout ce qu'Ansible a besoin de savoir** : les adresses des
machines, le point de terminaison de la base, l'identifiant du système de
fichiers. Plutôt que de recopier ces valeurs dans un inventaire, Terraform les
publie dans son propre état, avec le provider `ansible`. Et Ansible relit cet
état grâce au plugin d'inventaire dynamique.

Résultat : **il n'y a pas une seule adresse IP écrite à la main dans le projet.**
On ajoute une instance avec Terraform, elle apparaît toute seule dans
l'inventaire.

Côté organisation, trois rôles à nous, plus un rôle installé depuis Ansible
Galaxy pour Docker. Le bastion et les serveurs applicatifs partagent le même rôle
de base, avec des variables différentes — c'est ça, un rôle réutilisable.

Et **l'idempotence**, qui est le critère le plus concret : la deuxième exécution
du playbook ne change rien. Zéro modification. Ce n'est pas un hasard, c'est une
contrainte de conception : l'installeur de PrestaShop tourne une fois, dans un
conteneur jetable, et le conteneur qui sert réellement la boutique est toujours
créé avec l'installeur désactivé.

---

## 7 — Gérer l'affluence

Venons-en à la question qui compte vraiment.

Notre couche applicative ne garde rien. Une commande part dans la base, une photo
de produit sur le stockage partagé, une session PHP aussi. Conséquence directe :
**ajouter de la capacité, c'est changer un nombre.**

Deux commandes. Terraform crée les instances, les répartit sur les zones et les
enregistre auprès du load balancer. Puis le playbook les configure — et seulement
elles, parce qu'il est idempotent : il ne touche pas à celles qui servent déjà.
Il faut environ trois minutes.

Et **savoir quand le faire n'est pas au doigt mouillé**. Trois alarmes CloudWatch
sont créées avec le load balancer : le temps de réponse au-delà de deux secondes
en moyenne sur trois minutes, le nombre d'instances sorties de la rotation, et le
nombre d'erreurs serveur. Elles notifient un sujet SNS, donc une adresse
d'astreinte.

---

## 8 — Quand ça casse

Nous avons regardé chaque panne, et mesuré.

**Un conteneur ou une instance tombe** : le load balancer l'interroge toutes les
quinze secondes ; après deux échecs, soit une trentaine de secondes, il la sort
de la rotation. Les requêtes en cours ont trente secondes pour se terminer. Les
clients ne voient rien.

**Une zone de disponibilité entière tombe** : le load balancer a un nœud par
zone, il cesse d'utiliser celui-là. Les autres absorbent. C'est automatique.

**La base tombe** : en production elle est en Multi-AZ, la bascule prend entre
une et deux minutes. Il y a une courte fenêtre d'erreurs — nous ne le cachons pas
— puis le service reprend.

**Le bastion tombe** : rien du tout côté client. Il ne porte aucun trafic de
clients.

Et le point que je veux souligner : **les paniers survivent.** Les sessions PHP
sont sur le stockage partagé, pas sur la machine. Perdre une instance, ce n'est
pas perdre le panier d'un client en train de payer ses billets.

---

## 9 — Les quatre bugs

Nous voulions vous montrer cette diapositive, parce qu'elle raconte la partie
honnête du projet.

Le code était écrit, relu, validé statiquement. Puis nous l'avons déployé sur un
vrai compte AWS, et nous avons rencontré **quatre problèmes que ni une relecture
ni un émulateur n'auraient montrés.**

Le premier : AWS valide les descriptions de groupes de sécurité contre une liste
de caractères autorisés, et le chevron n'en fait pas partie. Nous avions écrit
une flèche dans une description.

Le deuxième : le paquet `awscli` n'existe plus dans les dépôts d'Ubuntu 24.04.
Nous aurions pu installer l'outil officiel, soixante mégaoctets par instance,
pour un seul appel. Nous sommes passés à la bibliothèque Python boto3, qui est
dans les dépôts de base.

Le troisième est notre préféré : le script de configuration chargeait le fichier
d'environnement avec `source`, et le mot de passe généré contenait une
esperluette. **Le shell a essayé de l'exécuter.** Nous lisons maintenant ce
fichier sans jamais l'évaluer, et nous avons restreint les caractères du mot de
passe généré.

Le quatrième : sur NFS, supprimer un fichier encore ouvert laisse une entrée
fantôme. Le vidage de cache de PrestaShop échouait donc, et tuait le conteneur
juste après une installation réussie. Le cache compilé est de la donnée dérivée :
il n'avait rien à faire sur un stockage partagé. Il est passé sur le disque local
de chaque instance.

Les quatre correctifs sont dans le dépôt. **Un déploiement depuis zéro ne les
rencontre plus.**

---

## 10 — Limites assumées

Une architecture sans limite connue, c'est une architecture qu'on n'a pas
comprise. Voici les nôtres.

**La montée en charge est déclarative, pas automatique.** Un pic soudain demande
un opérateur et deux commandes, environ trois minutes. La suite logique, nous
savons la décrire : figer le résultat d'Ansible dans une image machine avec
Packer, puis placer un groupe d'autoscaling derrière le même groupe de cibles.
Notre sonde de santé et notre rôle sont déjà écrits pour ça — c'est une
évolution, pas une réécriture.

**Toute la racine web est sur EFS.** Cela rend les instances interchangeables,
mais cela coûte de la latence sur chaque inclusion PHP. Au-delà de quelques
milliers de requêtes par minute, il faudrait mettre le code dans l'image, ne
garder que les images produits sur EFS, et placer un CDN devant.

**Une seule base en écriture.** On peut déporter les lectures sur un réplica, pas
les écritures. Et une billetterie, ça écrit beaucoup.

**Une seule région.** Une panne régionale serait une interruption. À cette
échelle, le multi-région coûterait plus cher que la panne qu'il évite. C'est un
arbitrage assumé.

---

## 11 — Démonstration

> **Avant la soutenance** : `terraform -chdir=terraform apply` puis le playbook,
> et vérifiez que la boutique répond. Gardez deux onglets ouverts : la boutique
> et le back-office. Ne comptez pas sur un déploiement complet en direct — douze
> minutes de création RDS devant un jury, c'est long.

Voici la totalité de ce qu'il faut taper.

Une fois par compte, on crée le backend d'état : un bucket S3 versionné, chiffré,
avec verrouillage. C'est le seul prérequis, et il est documenté dans le README.

Ensuite Terraform : `init`, `apply`. Une douzaine de minutes, c'est la base qui
est lente.

Puis Ansible : on installe les dépendances depuis Galaxy, on vérifie l'inventaire
dynamique — **et je vous invite à regarder cette commande, parce qu'aucune
adresse n'y est écrite** — et on lance le playbook.

### Les quatre choses à montrer

1. **La boutique et son back-office.** Ouvrez le catalogue, puis connectez-vous
   au back-office. « Les données viennent de RDS, le thème et les images d'EFS. »

2. **Le playbook relancé.**
   `ansible-playbook -i ansible/inventory.yml ansible/site.yml --ask-vault-pass`
   → « `changed=0`. Rien à faire : la machine est déjà dans l'état décrit. »

3. **Une instance de plus.**
   `terraform -chdir=terraform apply -var app_instance_count=2` puis le playbook.
   Montrez `ansible-inventory --graph` : le nouvel hôte est apparu tout seul.
   Puis la console AWS, groupe de cibles : deux instances saines.

4. **Une panne.** Sur une instance : `sudo docker stop prestashop`. Rafraîchissez
   la boutique — elle répond toujours, servie par l'autre instance. Dans la
   console, la première passe `unhealthy` en une trentaine de secondes.

---

## 12 — Questions

Pour conclure : la solution est déployée sur un vrai compte, documentée dans un
README qui sert de manuel d'exploitation — déployer, exploiter, mettre à
l'échelle, dépanner, détruire — et reproductible : nous l'avons détruite et
redéployée pour en être sûrs.

Nous sommes prêts pour vos questions.

### Réponses préparées

**Pourquoi pas d'autoscaling ?**
Parce que notre unité de déploiement est une instance configurée par Ansible, pas
une image figée. Le faire proprement demande Packer et une image préconstruite.
Nous avons préféré livrer quelque chose qui marche et dont nous connaissons la
limite, plutôt qu'un groupe d'autoscaling qui lancerait des machines non
configurées.

**Pourquoi EFS et pas S3 ?**
Parce que PrestaShop écrit sur un système de fichiers. Passer par S3 demanderait
un module PrestaShop supplémentaire ; EFS est transparent pour l'application.

**Où est le mot de passe de la base ?**
Nulle part dans le dépôt. Terraform le génère, le dépose dans Secrets Manager, et
chaque instance va le chercher avec son propre rôle IAM. Il n'est même pas dans
l'inventaire Ansible.

**Et si le bastion tombe pendant une vente ?**
Aucun impact client : il ne porte que les sessions d'administration. Les
instances acceptent aussi SSM Session Manager, qui ne passe pas par lui.

**Combien ça coûte ?**
Environ deux à trois dollars par jour pour l'environnement de développement. Les
postes principaux sont la passerelle NAT et le load balancer, pas les instances.

**Comment montez-vous PrestaShop de version ?**
C'est une variable dans les variables de groupe Ansible : on change le tag de
l'image, on relance le playbook. On prend un instantané de la base avant.

**Pourquoi trois niveaux de sous-réseaux ?**
Pour que la base n'ait aucune route vers Internet, et que les instances
applicatives n'aient aucune adresse publique. Seul le niveau public est exposé,
et il ne contient que le load balancer et le bastion.

**Avez-vous testé sur Floci ?**
Oui, et c'est documenté dans le README. EC2 et RDS y sont de vrais conteneurs,
mais EFS n'a pas de plan de données NFS, le load balancer ne transmet aucun
paquet, et les instances ne peuvent pas faire tourner Docker. Comme le sujet
impose l'image PrestaShop sur EC2, nous avons visé AWS réel — le profil Floci
reste dans le dépôt pour répéter la partie Terraform sans frais.
