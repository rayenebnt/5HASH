# Démo — jour J

Mot de passe du vault : `taylorshift`
Toutes les commandes se lancent depuis la racine du dépôt.

---

## Partie 1 — Avant la soutenance (le matin, depuis le réseau de la salle)

**1.** Une seule fois par compte AWS :

```sh
./scripts/bootstrap-backend.sh dev
```

**2.** Créer l'infrastructure (~12 min) :

```sh
terraform -chdir=terraform init
terraform -chdir=terraform apply
```

**3.** Installer les dépendances Ansible :

```sh
ansible-galaxy install -r ansible/requirements.yml
```

**4.** Premier passage du playbook (~15 min, il installe la boutique) :

```sh
ansible-playbook -i ansible/inventory.yml ansible/site.yml --ask-vault-pass
```

**5.** Vérifier que tout répond :

```sh
./scripts/demo-check.sh
```

Tout doit être vert.

**6.** Récupérer les adresses :

```sh
terraform -chdir=terraform output -raw shop_url
terraform -chdir=terraform output -raw admin_url
```

**7.** Récupérer les identifiants admin — **ne pas montrer à l'écran** :

```sh
ansible-vault view ansible/group_vars/all/vault.yml
```

**8.** Préparer 2 onglets navigateur :

- onglet 1 : la boutique
- onglet 2 : le back-office, déjà connecté, sur Catalogue → Produits

**9.** Dans le terminal : agrandir la police, maximiser le panneau, puis `clear`

---

## Partie 2 — La démo à l'oral

**1.** Onglet 1 : montrer la boutique qui s'affiche.

**2.** Onglet 2 : ouvrir un produit, changer le prix, Enregistrer.

**3.** Onglet 1 : ouvrir la fiche du produit, `Ctrl + Maj + R`. Le nouveau prix apparaît.

**4.** Terminal :

```sh
terraform -chdir=terraform output database_endpoint
```

Montrer que l'adresse finit par `rds.amazonaws.com`.

**5.** Terminal, les 3 à la suite :

```sh
cat ansible/inventory.yml
terraform -chdir=terraform output app_instance_ids
ansible-inventory -i ansible/inventory.yml --graph
```

Montrer que l'inventaire ne contient aucune adresse, et que les serveurs
listés sont ceux de Terraform.

**6.** Terminal :

```sh
ansible-playbook -i ansible/inventory.yml ansible/site.yml --ask-vault-pass
```

Ça tourne 2-3 minutes. À la fin, remonter jusqu'à `PLAY RECAP` et rester
dessus. Montrer `changed=0`.

**7.** Terminal :

```sh
grep -n app_instance_count terraform/locals.tf
terraform -chdir=terraform plan -var app_instance_count=2
```

Montrer la ligne finale du plan : les ressources à ajouter. Ne pas appliquer.

**Fin de la démo.**

---

## Après

Remettre le prix d'origine du produit, puis :

```sh
./scripts/destroy.sh dev
```
