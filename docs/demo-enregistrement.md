# Enregistrer la démonstration — marche à suivre

Objectif : une vidéo de secours, prête à être projetée si le réseau de la salle
tombe, si AWS répond mal, ou si le temps manque le jour de la soutenance.

Elle sert aussi de répétition : vous découvrirez en l'enregistrant les endroits
où vous hésitez.

**Comptez une heure en tout** : vingt minutes de déploiement, cinq minutes de
préparation, une vingtaine de minutes de prises (en vous y reprenant à deux
fois), et le reste pour relire.

---

## 1. Déployer l'infrastructure (20 min, à faire en premier)

On n'enregistre jamais le déploiement : il dure douze minutes, dont l'essentiel
d'attente sur la base de données.

```sh
cd ~/5HASH
terraform -chdir=terraform init
terraform -chdir=terraform apply                      # ~12 min
ansible-galaxy install -r ansible/requirements.yml
ansible-playbook -i ansible/inventory.yml ansible/site.yml --ask-vault-pass
```

Mot de passe du vault pour ce dépôt : `taylorshift`.

Cette première exécution du playbook **installe** la boutique : elle affiche des
modifications, c'est normal. C'est la deuxième qui doit afficher `changed=0`, et
c'est celle-là que vous filmerez.

> **Important.** Faites cet `apply` depuis le réseau d'où vous enregistrerez. Le
> pare-feu du bastion se verrouille sur l'adresse IP publique du poste au moment
> de l'`apply`. Depuis un autre réseau, la prise 4 échouera.

---

## 2. Vérifier que tout est prêt (2 min)

```sh
./scripts/demo-check.sh
```

Le script ne modifie rien. Il vérifie quatre choses : l'état Terraform est
lisible, la boutique et le back-office répondent, l'inventaire dynamique
renvoie bien des hôtes, et le bastion est joignable en SSH. Chaque échec
affiche quoi faire.

**N'enregistrez pas tant que tout n'est pas vert.**

---

## 3. Préparer l'écran (5 min)

- **Police du terminal à 16–18 pt.** Ce qui est lisible sur votre écran est
  illisible une fois projeté. Agrandissez plus que de raison.
- **Terminal maximisé**, fenêtre propre, historique vidé (`clear`).
- **Zoom du navigateur à 110 %**, barre de favoris masquée, un seul profil,
  pas d'onglets personnels ouverts.
- **Deux onglets préparés** : la boutique, et le back-office avec la session
  déjà ouverte. Ouvrez-les avant d'enregistrer, pour ne pas filmer une
  connexion.
- **Notifications coupées** : mode « Ne pas déranger » sur le système, Slack,
  Discord et la messagerie fermés.
- **Placez-vous dans le dépôt** : `cd ~/5HASH`.

### Ce qu'il ne faut pas filmer

- `aws configure`, le contenu de `~/.aws/credentials`, une clé d'accès ;
- `ansible-vault view …` : le vault déchiffré affiche le mot de passe du
  back-office en clair ;
- `cat terraform/terraform.tfstate` : l'état contient le mot de passe de la
  base ;
- votre messagerie, vos autres onglets, votre bureau.

Le mot de passe du vault que vous tapez pendant la prise 4 n'apparaît pas à
l'écran, Ansible ne l'affiche jamais. Pas d'inquiétude là-dessus.

---

## 4. Choisir l'outil d'enregistrement

| Système | Le plus simple | Avec la voix |
|---|---|---|
| macOS | `Cmd + Maj + 5` → « Enregistrer l'écran entier » | même outil, menu *Options* → choisir le micro |
| Windows | OBS Studio | OBS Studio |
| Linux | OBS Studio | OBS Studio |

Sous Windows, la barre de jeu (`Win + G`) ne filme qu'une fenêtre d'application
et refuse l'explorateur : elle vous lâchera au mauvais moment. Prenez OBS.

**Réglages OBS, une fois pour toutes :** source « Capture d'écran », sortie en
MP4, 1920×1080, 30 images par seconde. Vérifiez le niveau du micro avant de
commencer : parlez, la barre doit bouger sans saturer.

**Enregistrez avec votre voix.** Une vidéo muette oblige à commenter en direct
pendant la projection, donc à faire deux choses à la fois. Une vidéo commentée
se suffit à elle-même.

---

## 5. Les cinq prises

**Faites cinq prises séparées, pas une seule longue.** Si vous vous trompez à la
prise 4, vous refaites la prise 4, pas les douze minutes. Et le jour J, vous
pouvez n'en projeter qu'une si le jury vous demande un point précis.

Nommez les fichiers `demo-1-boutique.mp4`, `demo-2-base.mp4`, etc. : ils se
joueront dans l'ordre.

Avant chaque prise : `clear`, puis vous lancez l'enregistrement, vous comptez
deux secondes en silence, et vous commencez à parler.

---

### Prise 1 — La boutique répond · 45 s

**Ce que ça prouve : l'application est déployée et accessible (3 points).**

À l'écran : le terminal, puis le navigateur.

```sh
terraform -chdir=terraform output -raw shop_url
```

Basculez sur l'onglet de la boutique et rechargez.

> « Voici la boutique de Taylor Shift, déployée sur un compte AWS en région
> Paris. L'adresse que vous voyez est celle du load balancer, pas celle d'un
> serveur : les serveurs n'ont aucune adresse publique. La page est servie par
> un conteneur Docker PrestaShop, sur une instance EC2, dans un sous-réseau
> privé. »

Faites défiler la page d'accueil quelques secondes. Fin de la prise.

---

### Prise 2 — La base de données fonctionne · 1 min 30

**Ce que ça prouve : l'application est connectée à une base de données
fonctionnelle (3 points).**

```sh
terraform -chdir=terraform output database_endpoint
```

> « La base n'est pas sur le serveur. C'est une instance RDS MySQL, dans le
> sous-réseau privé des données, joignable uniquement depuis les serveurs
> applicatifs. »

Passez au back-office. **Catalogue → Produits**, ouvrez un produit, changez son
prix, enregistrez.

Revenez sur l'onglet de la boutique, ouvrez la fiche du produit et rechargez
avec `Ctrl + Maj + R`.

> « Le nouveau prix s'affiche. L'écriture est partie du back-office, elle est
> passée par la base, et elle revient côté client. Une page qui s'affiche ne
> prouverait pas que la base fonctionne ; un aller-retour comme celui-ci,
> oui. »

> **Si l'ancien prix s'affiche encore** : c'est le cache de PrestaShop. Dans le
> back-office, *Paramètres avancés → Performances → Vider le cache*, puis
> rechargez. Testez-le une fois avant d'enregistrer, pour savoir si vous aurez
> besoin de cette étape.

Remettez le prix d'origine après la prise.

---

### Prise 3 — L'inventaire est dynamique · 1 min

**Ce que ça prouve : inventaire dynamique généré par Terraform (2 points).**

```sh
cat ansible/inventory.yml
terraform -chdir=terraform output app_instance_ids
ansible-inventory -i ansible/inventory.yml --graph
```

> « Le fichier d'inventaire Ansible ne contient que deux lignes utiles : le nom
> du plugin, et le chemin du code Terraform. Aucune adresse IP, aucun nom de
> machine.
>
> La deuxième commande affiche les identifiants d'instances côté Terraform. La
> troisième affiche l'inventaire vu par Ansible. Ce sont les mêmes machines :
> Ansible les a lues dans l'état Terraform.
>
> Concrètement, quand on ajoute un serveur, on ne modifie aucun fichier
> Ansible. »

Laissez le graphe affiché deux secondes avant de couper.

---

### Prise 4 — Le playbook est idempotent · 3 min

**Ce que ça prouve : playbooks idempotents (2 points), et la solution est
rejouable (2 points).** C'est la prise la plus importante.

```sh
ansible-playbook -i ansible/inventory.yml ansible/site.yml --ask-vault-pass
```

Tapez le mot de passe du vault. **Ne coupez pas pendant l'exécution : parlez.**
Vous avez deux à trois minutes à meubler, et de quoi dire :

> « Pendant que ça tourne, un mot sur ce qu'il fait.
>
> Il m'a demandé un mot de passe parce que les identifiants du back-office sont
> chiffrés avec Ansible Vault, dans le dépôt. Le mot de passe de la base, lui,
> n'est nulle part dans le dépôt : chaque serveur va le chercher dans AWS
> Secrets Manager avec son propre rôle IAM.
>
> Trois rôles s'enchaînent : un rôle de base commun à toutes les machines, le
> montage du disque partagé, et le rôle PrestaShop. Le rôle Docker vient
> d'Ansible Galaxy, nous ne l'avons pas réécrit.
>
> Chaque fichier de configuration est un template généré depuis des variables,
> et les redémarrages passent par des handlers : ils n'ont lieu que si un
> fichier a réellement changé. C'est ce qui permet la ligne qu'on attend à la
> fin. »

Quand le récapitulatif s'affiche, **restez dessus trois bonnes secondes** —
c'est l'image que le jury doit voir.

> « `changed=0`. Rien n'a été modifié : l'infrastructure était déjà dans l'état
> décrit par le code, donc Ansible n'a rien eu à faire. C'est l'idempotence, et
> c'est ce qui permet de relancer un déploiement en confiance.
>
> Nous ne l'avons pas eu du premier coup. La deuxième exécution affichait deux
> modifications. La cause était une condition qui vérifiait si le mot
> « changed » apparaissait dans la sortie d'un script — et « changed » est
> contenu dans « unchanged ». Le test disait l'inverse de ce que nous croyions.
> Corrigé en comparaison exacte. »

Si vous voulez une trace écrite en plus de la vidéo :

```sh
ansible-playbook -i ansible/inventory.yml ansible/site.yml --ask-vault-pass | tee /tmp/preuve-idempotence.txt
```

---

### Prise 5 — La montée en charge · 1 min

**Ce que ça prouve : la solution se redéploie et encaisse le trafic (2 points).**

```sh
grep -n app_instance_count terraform/locals.tf
terraform -chdir=terraform plan -var app_instance_count=2
```

> « Le nombre de serveurs est une variable, définie par environnement : la
> première ligne, c'est dev avec un serveur ; la deuxième, la préproduction
> avec deux ; la troisième, la production avec trois.
>
> Je demande à Terraform ce qu'il ferait avec deux serveurs. Il annonce ce
> qu'il créerait : l'instance supplémentaire, son enregistrement dans le load
> balancer, et son entrée d'inventaire. Les trois restent cohérents parce
> qu'ils viennent du même code.
>
> Je ne l'applique pas, ça prendrait trois minutes de plus. Mais c'est
> exactement l'opération de la veille de l'ouverture des ventes : une variable,
> un `apply`, le playbook, et le load balancer envoie du trafic au nouveau
> serveur dès qu'il répond au contrôle de santé. »

Le `-var` ne modifie aucun fichier : il n'y a rien à remettre en place.

---

## 6. Relire avant de ranger

Regardez les cinq vidéos en entier, avec le son, et vérifiez :

- [ ] le texte du terminal est lisible sans plisser les yeux ;
- [ ] on entend votre voix sans saturation ;
- [ ] `changed=0` est visible nettement dans la prise 4 ;
- [ ] aucun mot de passe, aucune clé, aucune fenêtre personnelle n'apparaît ;
- [ ] chaque prise commence et finit proprement, sans trente secondes de
      flottement.

Puis :

- exportez en **MP4**, une résolution de 1080p suffit ;
- **deux copies** : une clé USB et un espace en ligne. Une clé qui ne monte pas
  le jour J, ça arrive ;
- **ne mettez pas les vidéos dans le dépôt Git** — elles sont déjà ignorées par
  le `.gitignore`. Si votre professeur les demande, déposez-les séparément.

---

## 7. Le jour de la soutenance

**Faites la démonstration en direct si tout fonctionne.** C'est plus
convaincant, et le jury le voit. La vidéo reste votre filet.

Dans l'ordre :

1. Vingt minutes avant, depuis le réseau de la salle :
   `terraform -chdir=terraform apply` puis `./scripts/demo-check.sh`.
2. Tout est vert → démonstration en direct.
3. Un seul point échoue → vous faites les prises qui marchent en direct et vous
   projetez la vidéo pour celle qui coince.
4. Rien ne répond → vous projetez les cinq vidéos et **vous le dites
   franchement** : « le réseau de la salle ne nous laisse pas joindre AWS, voici
   l'enregistrement fait hier ». Un recours annoncé passe bien ; un écran qui
   plante en silence, non.

Et après la soutenance, pour arrêter la facturation :

```sh
./scripts/destroy.sh dev
```
