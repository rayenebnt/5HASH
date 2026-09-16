---
marp: true
title: Taylor Shift — Ticket Shop Infrastructure
paginate: true
---

# Taylor Shift — Ticket Shop

**Deploying and operating the shop for the ticket rush**

5HASH agency — Terraform + Ansible on AWS

---

## The brief

- The application exists: generic **PrestaShop** image on Docker Hub.
- We own the **infrastructure**, the **configuration** and the **documentation**.
- It has to stay up and responsive **the minute tickets go on sale**.

Three questions drive every choice:

1. How does a request reach the shop?
2. What happens when 10× more requests arrive?
3. What happens when something breaks?

---

## Architecture

```
            internet
      HTTP(S) │            │ SSH (operator IP only)
        ┌─────▼──────┐  ┌──▼────────┐        public subnets, 2-3 AZ
        │    ALB     │  │  Bastion  │
        └─────┬──────┘  └──┬────────┘
              │ :80        │ :22
     ┌────────▼────────────▼─────────┐        private app subnets
     │  EC2 × N — Docker PrestaShop  │        (1 dev / 3 prod)
     └───┬────────────────────────┬──┘
   MySQL │                        │ NFS
   ┌─────▼──────────┐   ┌─────────▼────────────┐   private data subnets
   │ RDS MySQL 8.0  │   │ EFS: webroot, media, │
   │ Multi-AZ (prod)│   │ PHP sessions         │
   └────────────────┘   └──────────────────────┘
```

Secrets Manager (DB password) · CloudWatch alarms · S3 gateway endpoint

---

## What runs where, and why

| Component | Choice | Reason |
|---|---|---|
| Shop | Docker on **EC2** | Ansible-configured instance, identical runtime everywhere |
| Database | **RDS MySQL** | Backups, patching, Multi-AZ failover we don't have to write |
| Shared files | **EFS** | Same pictures *and* PHP sessions on every instance |
| Entry point | **ALB** | Health checks, draining, scaling across AZs |
| Secrets | **Secrets Manager** + **Vault** | DB password never leaves AWS; shop credentials encrypted in Git |
| Access | **Bastion**, no public IP on app | One audited SSH door, IMDSv2 enforced |

---

## Terraform

- Root module composes **six small modules**: network, security, storage,
  database, compute, loadbalancer.
- **Environment separation** driven by one variable: `env_defaults` in
  `locals.tf` sizes dev / staging / prod; `environments/*.tfvars` overrides.
- **Remote state**: versioned, encrypted S3 bucket + locking, created by
  `bootstrap/` (`scripts/bootstrap-backend.sh`).
- **Data sources**, not hardcoded values: latest Ubuntu AMI, availability zones,
  and the operator's public IP to lock the bastion down.
- Every variable documented, every layer exposing outputs.

---

## Ansible

- **Dynamic inventory** — `cloud.terraform.terraform_provider` reads the
  Terraform state. No IP, no endpoint is ever copied by hand.
- **Reusable roles** — `common`, `efs`, `prestashop`, plus `geerlingguy.docker`
  from Galaxy. The bastion and the app tier share `common` with different vars.
- **Vault** — back-office credentials encrypted; the database password is not
  even in the repository: each instance reads it from Secrets Manager with its
  own IAM role.
- **Idempotent** — templates + handlers; the install runs once, in a throw-away
  container, so the serving container never changes on a second run.

---

## Handling the rush

**Path**: DNS → ALB (one node per AZ) → healthy targets → container → RDS + EFS

**Scaling out is a number** — the tier is stateless:

```sh
terraform -chdir=terraform apply -var app_instance_count=6
ansible-playbook -i ansible/inventory.yml ansible/site.yml --ask-vault-pass
```

New instances are spread across AZs, registered in the target group, picked up
by the inventory automatically. Existing instances never stop serving.

**When to scale**: CloudWatch alarms on `TargetResponseTime` (> 2 s / 3 min),
`UnHealthyHostCount` and 5xx count → SNS.

---

## When something breaks

| Failure | Effect | Recovery |
|---|---|---|
| Container / instance | Out of rotation after 2 failed checks (~30 s), 30 s draining | `apply -replace` + playbook |
| Whole AZ | ALB stops using its node, other AZs absorb | Automatic |
| Database | Multi-AZ failover, 60–120 s | Automatic (prod) |
| Bastion | No customer impact — Ansible access only | Recreate, or SSM |

Carts and logins survive an instance loss: **sessions live on EFS**, not on the
instance.

---

## Limits (and what comes next)

- Scaling is **declarative, not automatic** — an operator runs two commands
  (~3 min). Next: bake an AMI with Packer, put an **Auto Scaling group** behind
  the same target group. The health endpoint and the role are ready for it.
- The webroot on **EFS** costs NFS latency on PHP includes. Past a few thousand
  requests/min: code in the image, only `img/` on EFS, CDN in front.
- **One writable database** — reads can go to a replica, writes cannot.
- **Single region** — a regional outage is downtime.

---

## Why real AWS, not the emulator

The course tooling (Floci) provisions a lot of this stack for free — so we
checked it rather than assumed it:

| On the emulator | |
|---|---|
| EC2, RDS MySQL | **real containers** — Ansible configures them, the shop's SQL really runs |
| VPC, IAM, Secrets Manager, CloudWatch | provisioned and usable |
| EFS | metadata only — no NFS data plane, mounting fails |
| Load balancer | listeners and targets stored, **no packet forwarded** |
| Docker **inside** an instance | impossible — instances are unprivileged containers |

The brief requires the PrestaShop image from Docker Hub to run on an EC2
instance. Only a real instance runs a container engine, so the shop targets real
AWS — `environments/floci.tfvars` still applies the whole stack locally to
rehearse Terraform, the inventory and the database wiring at zero cost.

---

## Demo

1. `./scripts/bootstrap-backend.sh dev` — state backend
2. `terraform -chdir=terraform apply` — VPC, ALB, EC2, RDS, EFS
3. `ansible-inventory --graph` — hosts straight out of the state
4. `ansible-playbook ... --ask-vault-pass` — shop installed
5. Open `shop_url`, order a ticket, log into the back office
6. Run the playbook **again** — `changed=0`
7. `app_instance_count=2` → apply + playbook → second instance in rotation

---

## Questions

Repository: Terraform (`terraform/`), Ansible (`ansible/`), README with the
deploy, operate and troubleshoot runbook.

**Thank you.**
