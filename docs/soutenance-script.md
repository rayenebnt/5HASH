# Soutenance — ce qu'on dit, diapo par diapo

Ce texte accompagne `docs/soutenance-5hash.pptx`. Il est **aussi dans les notes
de présentateur** de chaque diapositive : en mode Présentateur, vous avez la
diapo au mur et le texte sur votre écran.

**Ne l'apprenez pas par cœur.** Lisez-le deux fois à voix haute, retenez les
phrases en gras, et dites le reste avec vos mots. Une soutenance où on récite
s'entend tout de suite.

**Durée : 12 min de présentation + 4 min de démo + questions.**

| # | Diapo | Qui parle | Temps |
|---|---|---|---|
| 1 | Titre | 1 | 40 s |
| 2 | Trois questions | 1 | 50 s |
| 3 | L'architecture | 1 | 1 min 30 |
| 4 | Nos choix | 1 | 1 min 20 |
| 5 | Terraform | 2 | 1 min 20 |
| 6 | Ansible | 2 | 1 min 30 |
| 7 | Le jour de l'ouverture | 2 | 1 min 10 |
| 8 | Quand ça casse | 2 | 1 min 10 |
| 9 | Ce qu'on a appris | 3 | 1 min 30 |
| 10 | Ce qu'on n'a pas fait | 3 | 1 min 10 |
| 11 | Démonstration | 3 | 4 min |
| 12 | Questions | tous | — |

---

## 1 — Titre

Bonjour à tous. On est l'agence 5HASH, et Taylor Shift nous a confié sa boutique
de billets.

Le site, il existe déjà : c'est PrestaShop. Nous, on ne touche pas au site.
**Notre travail, c'est de lui construire une maison** — et surtout une maison qui
tient debout le jour où des milliers de fans se connectent en même temps.

Tout est écrit en code : Terraform pour construire, Ansible pour installer. Et ce
n'est pas une maquette : **ça tourne en ce moment sur un vrai compte AWS.** On
vous le montrera à la fin.

---

## 2 — On s'est posé trois questions

Avant de choisir la moindre technologie, on s'est posé trois questions toutes
bêtes.

**Un : comment un client arrive jusqu'à la boutique ?** Autrement dit, par où ça
rentre, et qu'est-ce qu'on laisse ouvert.

**Deux : et si dix fois plus de monde arrive d'un coup ?** Parce qu'une ouverture
de billetterie, ce n'est pas un trafic régulier. C'est un mur.

**Trois : et si une machine tombe ?** Parce qu'une machine finit toujours par
tomber.

Tout ce qu'on va vous montrer répond à l'une de ces trois questions.

---

## 3 — L'architecture

*(Prenez votre temps sur cette diapo, c'est la plus importante. Montrez avec la
main, de haut en bas.)*

Pour expliquer l'architecture, on va prendre **l'image d'une salle de concert**.
Ça se lit de haut en bas, comme le trajet d'un client.

En haut, côté rue, il y a **une seule porte : le répartiteur**. C'est l'hôte
d'accueil. Il envoie chaque visiteur vers une caisse libre, et il vérifie toutes
les quinze secondes que chaque caisse va bien. Si une caisse ne répond plus, il
arrête d'y envoyer du monde.

À côté, **l'entrée de service**. Elle, elle est réservée à l'équipe : c'est par
là qu'on passe pour installer et dépanner. Elle est ouverte à une seule adresse,
la nôtre. Aucun client ne passe par là.

Au milieu, **les caisses** : les serveurs qui font tourner la boutique. Elles
sont toutes identiques. Et surtout, **elles ne sont pas joignables depuis
Internet** — on ne peut y arriver qu'en passant par la porte d'accueil.

En bas, les réserves. **Le coffre**, c'est la base de données : les billets, les
paniers, les commandes. **Le vestiaire**, c'est un disque partagé : les images du
site, le thème, et les paniers en cours.

*(Pause. C'est la phrase à faire entendre.)*

Et voilà le point important : **les caisses ne gardent rien.** Tout est dans le
coffre et dans le vestiaire. C'est exactement ce qui va nous permettre d'en
ajouter, ou d'en perdre, sans que personne ne s'en aperçoive.

---

## 4 — Nos choix

Le sujet nous laissait libres : ce qui tourne sur nos serveurs, et ce qu'on
confie à AWS. Voilà comment on a tranché.

**La boutique** tourne dans un conteneur Docker, sur un serveur EC2. C'est ce que
demande le sujet, et ça nous arrange : changer de version de PrestaShop, c'est
une seule ligne à modifier.

**La base de données, par contre, on ne veut pas la gérer.** AWS s'occupe des
sauvegardes, des mises à jour, et garde une machine de secours prête à prendre le
relais. Franchement, personne n'a envie de découvrir un problème de base de
données le soir de l'ouverture des ventes.

**Pour les fichiers**, il nous fallait un disque que plusieurs serveurs voient en
même temps. Un disque classique ne se partage pas. EFS, si.

**Et les mots de passe** : celui de la base n'est écrit nulle part dans notre
code. Terraform le génère, le dépose dans le coffre d'AWS, et chaque serveur va
le chercher tout seul avec sa propre autorisation. Dans le dépôt, il n'y a que le
mot de passe de l'administration du site, et il est chiffré.

---

## 5 — Terraform

Terraform, c'est **l'outil qui construit**. On lui décrit ce qu'on veut, il se
débrouille pour le créer.

On a découpé en **six briques**, une par couche : le réseau, les droits, le
disque, la base, les serveurs, et l'entrée. Chaque brique se relit toute seule,
et si on veut en changer une, on ne casse pas les autres.

Le truc dont on est contents : **les trois environnements**. Test,
pré-production, production. C'est exactement le même code. On change un mot, et
on passe d'un serveur à trois serveurs répartis sur trois zones, avec une base
qui a une machine de secours et deux semaines de sauvegardes.

La description de l'infrastructure est **stockée sur AWS, pas sur nos
ordinateurs**, et elle est verrouillée : à trois, on ne peut pas se marcher
dessus.

Et **rien n'est écrit en dur**. Terraform va même chercher notre adresse IP du
moment, et c'est la seule qui aura le droit de se connecter aux serveurs.

---

## 6 — Ansible

Ansible, c'est **l'outil qui installe**. Une fois que Terraform a construit les
machines, Ansible les configure.

Le problème classique, c'est de faire le lien entre les deux : Terraform crée un
serveur, et il faut donner son adresse à Ansible. Beaucoup de gens recopient à la
main. **Nous, non.**

Terraform écrit la liste des serveurs dans sa propre description, et **Ansible va
la lire directement chez lui**. Résultat : il n'y a pas une seule adresse IP
écrite à la main dans tout le projet. On crée un serveur avec Terraform, il
apparaît tout seul dans la liste d'Ansible.

On a écrit **trois rôles réutilisables**. Le serveur d'entrée et les caisses
partagent le même rôle de base, juste avec des réglages différents. Et pour
Docker, on a pris un rôle public, installé depuis Ansible Galaxy, plutôt que de
le réécrire.

*(Montrez l'encadré vert.)*

Et le point le plus important : **on peut relancer l'installation autant de fois
qu'on veut.** La deuxième fois, Ansible affiche « changed égale zéro ». Il ne
touche à rien, parce que tout est déjà comme demandé. Ce n'est pas de la chance :
on a conçu l'installation pour ça.

---

## 7 — Le jour de l'ouverture

On arrive à la question qui compte vraiment.

Nos serveurs ne gardent rien. Une commande va dans la base, une image sur le
disque partagé, un panier aussi. Résultat : **ajouter de la capacité, c'est
littéralement changer un chiffre.**

Deux commandes. La première crée les serveurs et les répartit sur les zones. La
deuxième les installe — et seulement eux, parce qu'Ansible ne touche pas à ceux
qui travaillent déjà. **Trois minutes, sans couper la boutique.**

Et on ne décide pas au hasard. AWS surveille trois choses pour nous et nous
envoie un mail : si le site devient lent, si un serveur ne répond plus, ou si la
boutique renvoie des erreurs. C'est ça qui nous dit quand ajouter des machines.

---

## 8 — Quand ça casse

On a regardé chaque panne possible, et **on a chronométré**.

**Un serveur tombe.** Le répartiteur l'interroge toutes les quinze secondes ; au
bout de deux échecs, donc trente secondes, il arrête de lui envoyer des clients.
Et les achats déjà en cours ont trente secondes de plus pour se terminer. Le
client ne voit rien : il est servi par les autres.

**Une zone AWS entière tombe** — ça arrive, c'est un bâtiment entier. Les
serveurs des autres zones prennent le relais. Automatique.

**La base tombe.** En production, AWS garde une machine de secours dans une autre
zone. La bascule prend une à deux minutes. Il y a quelques secondes d'erreurs, on
ne va pas vous mentir, puis ça repart.

**Notre serveur d'entrée tombe** : aucun impact client, personne ne passe par là.

*(Pause, puis l'encadré orange.)*

Et le point qu'on veut vraiment que vous reteniez : **le panier du client est
conservé.** Les paniers sont sur le disque partagé, pas sur la machine qui tombe.
Pour une billetterie, c'est toute la différence.

---

## 9 — Ce qu'on a appris

On tenait à vous montrer cette diapo, parce que c'est **la partie honnête du
projet**.

Le code était écrit, relu, vérifié. Et puis on l'a déployé pour de vrai sur AWS,
et on s'est pris **quatre murs qu'aucune relecture n'aurait montrés**.

**Le premier** : AWS n'accepte que certains caractères dans les descriptions. On
avait écrit une petite flèche, avec un chevron. Refusé.

**Le deuxième** : l'outil en ligne de commande d'AWS n'existe plus dans les
dépôts d'Ubuntu 24.04. On aurait pu installer la version officielle — soixante
mégaoctets par serveur, pour un seul appel. On est passés à une bibliothèque
Python déjà présente.

**Le troisième, c'est notre préféré.** Le mot de passe de la base est généré au
hasard, et il contenait une esperluette, le « et commercial ». Notre script
chargeait le fichier avec une commande du shell — et **le shell a pris le mot de
passe pour une commande, et a essayé de l'exécuter.** Maintenant on lit le
fichier sans jamais l'interpréter, et on a limité les caractères du mot de passe.

**Le quatrième** : PrestaShop vide son cache après l'installation. Sur un disque
partagé en réseau, supprimer un fichier encore ouvert laisse une trace invisible,
donc la suppression échouait — et ça tuait le conteneur juste après une
installation réussie. On a compris que ce cache n'avait rien à faire sur le
disque partagé : c'est un fichier temporaire, propre à chaque serveur. On l'a
remis en local.

Les quatre sont corrigés dans le dépôt. **Un déploiement depuis zéro ne les
rencontre plus.**

---

## 10 — Ce qu'on n'a pas fait

Une infrastructure dont on ne connaît pas les limites, c'est une infrastructure
qu'on n'a pas comprise. Voilà les nôtres, en toute transparence.

**La première, la plus importante : ajouter des serveurs, ça demande quelqu'un.**
Ce n'est pas automatique. Un pic soudain, il faut un opérateur et deux commandes
— trois minutes. Pour l'automatiser vraiment, il faudrait préparer à l'avance une
image toute faite du serveur, avec tout déjà installé. Et bonne nouvelle : notre
installation est déjà écrite pour ça. C'est une évolution, pas une réécriture.

**La deuxième** : on a mis tout le site sur le disque partagé. C'est ce qui rend
les serveurs interchangeables, mais un disque réseau est plus lent qu'un disque
local. Au-delà de quelques milliers de visiteurs par minute, il faudrait mettre
le site dans l'image et ne garder que les photos sur le disque partagé.

**La troisième** : une seule base pour écrire. On peut ajouter des copies pour la
lecture, mais une billetterie, ça écrit surtout.

**Et la quatrième** : une seule région. Si toute la région Paris tombe, on tombe.
Doubler ailleurs coûterait plus cher que la panne qu'on évite. C'est assumé.

---

## 11 — Démonstration

> **À faire avant de passer** : lancez `terraform apply` puis le playbook, et
> vérifiez que la boutique répond. Gardez deux onglets ouverts : la boutique et
> l'administration. **Ne déployez pas en direct** — douze minutes de création de
> base de données devant un jury, c'est très long.

Voilà tout ce qu'il y a à taper. **Six commandes.**

La première, on ne la lance qu'une fois par compte : elle prépare l'endroit où
Terraform range sa description de l'infrastructure.

Ensuite Terraform construit. Une douzaine de minutes, et c'est la base de données
qui prend tout le temps.

Puis Ansible installe. **Regardez bien la commande du milieu** : c'est celle qui
affiche la liste des serveurs. Aucune adresse n'y est écrite, elle est lue chez
Terraform.

### Les quatre choses à montrer

**1. La boutique.** Ouvrez le catalogue, cliquez sur un produit, puis connectez-
vous à l'administration.
> « Les billets viennent de la base de données, les images du disque partagé. »

**2. On relance l'installation.**
`ansible-playbook -i ansible/inventory.yml ansible/site.yml --ask-vault-pass`
> « changed égale zéro. Rien à faire : la machine est déjà comme on l'a
> demandé. »

**3. On ajoute un serveur.**
`terraform -chdir=terraform apply -var app_instance_count=2`, puis le playbook.
Montrez `ansible-inventory --graph` : le nouveau serveur est apparu tout seul.
Puis la console AWS : deux serveurs en bonne santé derrière le répartiteur.

**4. On en casse un.** Sur un serveur : `sudo docker stop prestashop`.
Rafraîchissez la boutique — **elle répond toujours**, servie par l'autre. Dans la
console AWS, le premier passe « unhealthy » en une trentaine de secondes.

---

## 12 — Questions

Pour conclure. La boutique est **en ligne** sur un vrai compte AWS. Elle est
**documentée** : le README explique comment l'installer, la faire grandir, la
dépanner et la supprimer. Et **on sait la refaire** : on l'a détruite et
redéployée pour en être sûrs.

Merci de votre attention, on est prêts pour vos questions.

### Les réponses à avoir en tête

**« Pourquoi pas d'ajout automatique de serveurs ? »**
Parce qu'on installe nos serveurs avec Ansible après leur création. Pour que ce
soit automatique, il faudrait une image toute prête, construite à l'avance. On a
préféré livrer quelque chose qui marche et dont on connaît la limite, plutôt
qu'un système automatique qui lancerait des machines vides.

**« Pourquoi EFS et pas S3 ? »**
Parce que PrestaShop écrit sur un disque, tout simplement. Passer par S3
demanderait d'installer un module en plus dans PrestaShop. EFS, l'application ne
voit même pas la différence.

**« Où est le mot de passe de la base ? »**
Nulle part chez nous. Terraform le génère, AWS le garde dans son coffre, et
chaque serveur va le chercher avec sa propre autorisation. Il n'est même pas dans
la liste d'Ansible.

**« Et si votre serveur d'entrée tombe pendant une vente ? »**
Aucun impact : il ne sert qu'à nous. Et les serveurs acceptent aussi une
connexion par un service d'AWS, qui ne passe pas par lui.

**« Combien ça coûte ? »**
Deux à trois dollars par jour pour l'environnement de test. Et ce ne sont pas les
serveurs qui coûtent le plus : c'est la passerelle réseau et le répartiteur.

**« Comment vous changez de version de PrestaShop ? »**
Une ligne dans un fichier Ansible : on change le numéro de version, on relance.
On prend une sauvegarde de la base avant, évidemment.

**« Pourquoi trois niveaux de réseau ? »**
Pour que la base de données n'ait aucun chemin vers Internet, et que les serveurs
n'aient aucune adresse publique. Seul le premier niveau est exposé, et il ne
contient que le répartiteur et notre entrée de service.

**« Vous avez testé sur Floci ? »**
Oui, et c'est écrit dans le README. Les serveurs et la base y fonctionnent
vraiment, mais le disque partagé n'y est qu'une façade, le répartiteur ne fait
passer aucun trafic, et on ne peut pas y lancer Docker. Comme le sujet demande
l'image PrestaShop sur un serveur EC2, on a visé le vrai AWS. Le profil Floci
reste dans le dépôt pour répéter la partie Terraform sans payer.
