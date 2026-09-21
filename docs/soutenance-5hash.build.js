const PptxGenJS = require("pptxgenjs");

// --- palette ---------------------------------------------------------------
const INK = "0F1720";       // fond des slides sombres
const INK_SOFT = "1B2732";  // cartes sur fond sombre
const PAPER = "FFFFFF";
const WASH = "F2F5F7";      // fond des cartes claires
const TEXT = "17222C";
const MUTED = "5C6B7A";
const LINE = "D3DBE3";
const AMBER = "E08B1F";     // accent (lumière de scène)
const AMBER_DK = "9E5D06";  // amber lisible sur fond clair
const TEAL = "0C6A72";
const OK = "2E7D4F";
const BAD = "B3261E";

const H = "Arial";
const B = "Calibri";
const M = "Courier New";

const pres = new PptxGenJS();
pres.layout = "LAYOUT_WIDE"; // 13.33 x 7.5
pres.author = "5HASH";
pres.company = "5HASH";
pres.title = "Taylor Shift - Infrastructure de la billetterie";

const MX = 0.62;            // marge laterale
const CW = 13.33 - MX * 2;  // largeur utile

// --- helpers ---------------------------------------------------------------
function titleSlide(slide, kicker, title) {
  slide.addText(kicker, {
    x: MX, y: 0.42, w: CW, h: 0.3, isTextBox: true, margin: 0,
    fontFace: M, fontSize: 11, color: AMBER_DK, charSpacing: 2,
  });
  slide.addText(title, {
    x: MX, y: 0.76, w: CW, h: 0.72, isTextBox: true, margin: 0,
    fontFace: H, fontSize: 30, bold: true, color: TEXT,
  });
}

function card(slide, o) {
  slide.addShape(pres.ShapeType.roundRect, {
    x: o.x, y: o.y, w: o.w, h: o.h,
    fill: { color: o.fill || WASH }, line: { color: o.line || LINE, width: 0.75 },
    rectRadius: 0.06,
  });
}

// pastille ronde numerotee : utilisee uniquement quand le contenu est une sequence
function bullet(slide, x, y, label, color) {
  slide.addShape(pres.ShapeType.ellipse, {
    x, y, w: 0.34, h: 0.34, fill: { color: color || AMBER }, line: { color: color || AMBER },
  });
  slide.addText(label, {
    x, y, w: 0.34, h: 0.34, isTextBox: true, margin: 0,
    fontFace: H, fontSize: 12, bold: true, color: "FFFFFF", align: "center", valign: "middle",
  });
}

function code(slide, lines, o) {
  slide.addShape(pres.ShapeType.roundRect, {
    x: o.x, y: o.y, w: o.w, h: o.h,
    fill: { color: o.dark ? INK_SOFT : "EDF1F4" }, line: { color: o.dark ? INK_SOFT : LINE, width: 0.75 },
    rectRadius: 0.04,
  });
  slide.addText(Array.isArray(lines) ? lines.join("\n") : lines, {
    x: o.x + 0.18, y: o.y + 0.12, w: o.w - 0.36, h: o.h - 0.24, isTextBox: true, margin: 0,
    fontFace: M, fontSize: o.size || 11, color: o.dark ? "C9D6E2" : TEXT, lineSpacing: o.size ? o.size * 1.5 : 16,
  });
}

// ===========================================================================
// 1 - titre
// ===========================================================================
let s = pres.addSlide();
s.background = { color: INK };
s.addShape(pres.ShapeType.ellipse, { x: MX, y: 1.62, w: 0.16, h: 0.16, fill: { color: AMBER }, line: { color: AMBER } });
s.addText("5HASH  ·  SOUTENANCE  ·  INFRASTRUCTURE AS CODE", {
  x: MX + 0.3, y: 1.55, w: CW, h: 0.3, isTextBox: true, margin: 0,
  fontFace: M, fontSize: 12, color: AMBER, charSpacing: 2,
});
s.addText("Taylor Shift", {
  x: MX, y: 2.1, w: CW, h: 1.15, isTextBox: true, margin: 0,
  fontFace: H, fontSize: 60, bold: true, color: PAPER,
});
s.addText("La boutique de billetterie, prête pour l'ouverture des ventes", {
  x: MX, y: 3.25, w: 9.6, h: 0.5, isTextBox: true, margin: 0,
  fontFace: B, fontSize: 21, color: "A8B8C8",
});
const chips = ["Terraform", "Ansible", "PrestaShop", "AWS"];
chips.forEach((c, i) => {
  const x = MX + i * 2.0;
  s.addShape(pres.ShapeType.roundRect, {
    x, y: 4.15, w: 1.8, h: 0.45, fill: { color: INK_SOFT }, line: { color: "35475A", width: 0.75 }, rectRadius: 0.08,
  });
  s.addText(c, { x, y: 4.15, w: 1.8, h: 0.45, isTextBox: true, margin: 0, fontFace: M, fontSize: 12, color: "C9D6E2", align: "center", valign: "middle" });
});
s.addText("Déployé sur un compte AWS réel · région eu-west-3 · dépôt GitHub 5HASH", {
  x: MX, y: 5.3, w: CW, h: 0.3, isTextBox: true, margin: 0, fontFace: B, fontSize: 13, color: "7A8C9E",
});
s.addNotes(`Bonjour. Nous sommes l'agence 5HASH, et Taylor Shift nous a confié l'infrastructure de sa boutique de billetterie.

L'application existe déjà : c'est PrestaShop, l'image générique publiée sur Docker Hub. Notre travail, ce n'est pas le code du site : c'est de lui donner une maison qui tienne debout le jour où les billets partent en vente.

Tout ce que vous allez voir est décrit en code — Terraform pour l'infrastructure, Ansible pour la configuration — et tourne en ce moment sur un vrai compte AWS, en région Paris. Nous ferons la démonstration à la fin.`);

// ===========================================================================
// 2 - les trois questions
// ===========================================================================
s = pres.addSlide();
titleSlide(s, "01 — LE BESOIN", "Trois questions dictent toute l'architecture");
s.addText("L'application est fournie. Nous devons la déployer, la configurer et la documenter — et surtout la rendre capable d'encaisser la minute où les billets partent.", {
  x: MX, y: 1.6, w: 11.4, h: 0.5, isTextBox: true, margin: 0, fontFace: B, fontSize: 15, color: MUTED,
});
const qs = [
  ["1", "Comment une requête arrive-t-elle jusqu'à la boutique ?", "Un seul point d'entrée public, trois niveaux privés derrière."],
  ["2", "Que se passe-t-il à 10× le trafic ?", "La couche applicative ne garde aucun état : la capacité devient un nombre."],
  ["3", "Que se passe-t-il quand quelque chose casse ?", "Sondes de santé, drainage, bascule de base — avec des temps mesurés."],
];
qs.forEach((q, i) => {
  const x = MX + i * 4.12;
  card(s, { x, y: 2.35, w: 3.85, h: 2.65 });
  bullet(s, x + 0.3, y = 2.62, q[0]);
  s.addText(q[1], { x: x + 0.3, y: 3.12, w: 3.25, h: 0.9, isTextBox: true, margin: 0, fontFace: H, fontSize: 15, bold: true, color: TEXT });
  s.addText(q[2], { x: x + 0.3, y: 4.05, w: 3.25, h: 0.8, isTextBox: true, margin: 0, fontFace: B, fontSize: 13, color: MUTED });
});
s.addText("Chaque choix technique de cette présentation répond à l'une de ces trois questions.", {
  x: MX, y: 5.35, w: CW, h: 0.35, isTextBox: true, margin: 0, fontFace: B, fontSize: 14, italic: true, color: AMBER_DK,
});
s.addNotes(`Le sujet nous demande trois choses : déployer, configurer, documenter. Mais derrière, il y a trois questions concrètes auxquelles une infrastructure doit savoir répondre.

Première question : comment une requête arrive jusqu'à la boutique ? C'est la question du chemin réseau et de la sécurité.

Deuxième question : que se passe-t-il quand le trafic est multiplié par dix ? C'est le cœur du sujet — une ouverture de billetterie, c'est un pic, pas une charge régulière.

Troisième question : que se passe-t-il quand quelque chose casse ? Parce que quelque chose casse toujours.

Chaque décision que nous allons présenter répond à l'une de ces trois questions. Si une décision ne répond à aucune, c'est qu'elle n'a pas sa place.`);

// ===========================================================================
// 3 - architecture
// ===========================================================================
s = pres.addSlide();
titleSlide(s, "02 — ARCHITECTURE", "Trois niveaux, deux zones de disponibilité, une porte");

const dTop = 1.62, dLeft = 1.55, dW = 11.1;
// bandes
const bands = [
  ["SOUS-RÉSEAUX\nPUBLICS", dTop + 0.42, 1.15],
  ["SOUS-RÉSEAUX\nAPPLICATIFS", dTop + 1.95, 1.15],
  ["SOUS-RÉSEAUX\nDONNÉES", dTop + 3.45, 1.3],
];
bands.forEach(([label, y, h]) => {
  s.addShape(pres.ShapeType.roundRect, { x: dLeft, y, w: dW, h, fill: { color: WASH }, line: { color: LINE, width: 0.75 }, rectRadius: 0.03 });
  s.addText(label, { x: MX - 0.05, y: y + h / 2 - 0.3, w: 0.95, h: 0.6, isTextBox: true, margin: 0, fontFace: M, fontSize: 8.5, color: MUTED, align: "right", valign: "middle" });
});
// internet
s.addText("INTERNET", { x: dLeft + 0.3, y: dTop - 0.02, w: 2.0, h: 0.3, isTextBox: true, margin: 0, fontFace: M, fontSize: 10, color: MUTED });
s.addShape(pres.ShapeType.line, { x: dLeft + 0.75, y: dTop + 0.26, w: 0, h: 0.16, line: { color: AMBER, width: 1.5 } });
s.addText("HTTP(S)", { x: dLeft + 0.95, y: dTop + 0.18, w: 1.2, h: 0.25, isTextBox: true, margin: 0, fontFace: M, fontSize: 8.5, color: AMBER_DK });
s.addShape(pres.ShapeType.line, { x: dLeft + 8.6, y: dTop + 0.26, w: 0, h: 0.16, line: { color: MUTED, width: 1.25, dashType: "dash" } });
s.addText("SSH — IP de l'opérateur", { x: dLeft + 8.8, y: dTop + 0.18, w: 2.4, h: 0.25, isTextBox: true, margin: 0, fontFace: M, fontSize: 8.5, color: MUTED });

// ALB
card(s, { x: dLeft + 0.28, y: dTop + 0.58, w: 5.1, h: 0.82, fill: PAPER, line: AMBER });
s.addText("Application Load Balancer", { x: dLeft + 0.45, y: dTop + 0.68, w: 4.8, h: 0.3, isTextBox: true, margin: 0, fontFace: H, fontSize: 13, bold: true, color: TEXT });
s.addText("sonde /health.php toutes les 15 s · cookie de session · drainage", { x: dLeft + 0.45, y: dTop + 1.0, w: 4.8, h: 0.3, isTextBox: true, margin: 0, fontFace: B, fontSize: 10.5, color: MUTED });
// bastion
card(s, { x: dLeft + 7.6, y: dTop + 0.58, w: 3.2, h: 0.82, fill: PAPER, line: "B4C0CC" });
s.addText("Bastion", { x: dLeft + 7.78, y: dTop + 0.68, w: 2.9, h: 0.3, isTextBox: true, margin: 0, fontFace: H, fontSize: 13, bold: true, color: TEXT });
s.addText("la seule porte d'entrée d'Ansible", { x: dLeft + 7.78, y: dTop + 1.0, w: 2.9, h: 0.3, isTextBox: true, margin: 0, fontFace: B, fontSize: 10.5, color: MUTED });
// fleches vers app
s.addShape(pres.ShapeType.line, { x: dLeft + 2.4, y: dTop + 1.42, w: 0, h: 0.5, line: { color: AMBER, width: 1.75, endArrowType: "triangle" } });
s.addText(":80", { x: dLeft + 2.55, y: dTop + 1.52, w: 0.7, h: 0.25, isTextBox: true, margin: 0, fontFace: M, fontSize: 9, color: AMBER_DK });
s.addShape(pres.ShapeType.line, { x: dLeft + 9.2, y: dTop + 1.42, w: 0, h: 0.5, line: { color: MUTED, width: 1.25, dashType: "dash", endArrowType: "triangle" } });
s.addText(":22", { x: dLeft + 9.35, y: dTop + 1.52, w: 0.7, h: 0.25, isTextBox: true, margin: 0, fontFace: M, fontSize: 9, color: MUTED });

// app
card(s, { x: dLeft + 0.28, y: dTop + 2.12, w: 10.5, h: 0.82, fill: PAPER, line: "B4C0CC" });
s.addText("EC2 × N  —  Docker  —  prestashop/prestashop:8.2.8", { x: dLeft + 0.45, y: dTop + 2.2, w: 10.1, h: 0.3, isTextBox: true, margin: 0, fontFace: H, fontSize: 13, bold: true, color: TEXT });
s.addText("sans état · réparties sur les zones · configurées par Ansible · aucune adresse publique", { x: dLeft + 0.45, y: dTop + 2.52, w: 10.1, h: 0.3, isTextBox: true, margin: 0, fontFace: B, fontSize: 10.5, color: MUTED });
// fleches vers data
s.addShape(pres.ShapeType.line, { x: dLeft + 2.4, y: dTop + 2.96, w: 0, h: 0.46, line: { color: TEAL, width: 1.75, endArrowType: "triangle" } });
s.addText("MySQL :3306", { x: dLeft + 2.55, y: dTop + 3.04, w: 1.6, h: 0.25, isTextBox: true, margin: 0, fontFace: M, fontSize: 9, color: TEAL });
s.addShape(pres.ShapeType.line, { x: dLeft + 8.2, y: dTop + 2.96, w: 0, h: 0.46, line: { color: TEAL, width: 1.75, endArrowType: "triangle" } });
s.addText("NFS :2049", { x: dLeft + 8.35, y: dTop + 3.04, w: 1.5, h: 0.25, isTextBox: true, margin: 0, fontFace: M, fontSize: 9, color: TEAL });
// data
card(s, { x: dLeft + 0.28, y: dTop + 3.62, w: 5.1, h: 0.96, fill: PAPER, line: TEAL });
s.addText("RDS MySQL 8.0", { x: dLeft + 0.45, y: dTop + 3.72, w: 4.8, h: 0.3, isTextBox: true, margin: 0, fontFace: H, fontSize: 13, bold: true, color: TEXT });
s.addText("catalogue, paniers, commandes · Multi-AZ en production", { x: dLeft + 0.45, y: dTop + 4.04, w: 4.8, h: 0.4, isTextBox: true, margin: 0, fontFace: B, fontSize: 10.5, color: MUTED });
card(s, { x: dLeft + 5.7, y: dTop + 3.62, w: 5.1, h: 0.96, fill: PAPER, line: TEAL });
s.addText("EFS — racine web partagée", { x: dLeft + 5.88, y: dTop + 3.72, w: 4.8, h: 0.3, isTextBox: true, margin: 0, fontFace: H, fontSize: 13, bold: true, color: TEXT });
s.addText("images, thèmes, modules et sessions PHP", { x: dLeft + 5.88, y: dTop + 4.04, w: 4.8, h: 0.4, isTextBox: true, margin: 0, fontFace: B, fontSize: 10.5, color: MUTED });

s.addText("Secrets Manager (mot de passe de la base)  ·  alarmes CloudWatch  ·  passerelles NAT  ·  point de terminaison S3", {
  x: MX, y: 6.55, w: CW, h: 0.3, isTextBox: true, margin: 0, fontFace: B, fontSize: 12, color: MUTED,
});
s.addNotes(`Voici l'architecture. Elle se lit de haut en bas, dans le sens d'une requête.

En haut, le seul point d'entrée public : le load balancer applicatif. Il est présent dans chaque zone de disponibilité, il interroge chaque instance toutes les quinze secondes sur une page de santé, et il sait retirer une instance de la rotation.

À côté, le bastion. Il ne sert jamais aux clients : c'est uniquement la porte par laquelle Ansible entre pour configurer la flotte. Il n'est ouvert qu'à l'adresse IP de l'opérateur.

Au milieu, les instances EC2 qui font tourner le conteneur PrestaShop. Elles n'ont aucune adresse publique : on ne peut pas les joindre depuis Internet, seulement à travers le load balancer.

En bas, les données. La base MySQL managée d'un côté, le système de fichiers partagé de l'autre. Les sous-réseaux de ce niveau n'ont aucune route vers Internet.

Le point important : les instances du milieu ne gardent rien. Le catalogue est dans la base, les images et les sessions sont sur le stockage partagé. C'est ce qui rend la suite possible.`);

// ===========================================================================
// 4 - quoi tourne ou
// ===========================================================================
s = pres.addSlide();
titleSlide(s, "03 — PLACEMENT", "Ce qui tourne sur EC2, ce qu'on laisse gérer à AWS");
s.addText("La règle : on possède ce qui est spécifique à la boutique, on loue ce qui est spécifique à l'exploitation d'une base de données.", {
  x: MX, y: 1.6, w: 11.5, h: 0.4, isTextBox: true, margin: 0, fontFace: B, fontSize: 14, color: MUTED,
});
const rows = [
  [{ text: "COMPOSANT", options: { bold: true } }, { text: "CHOIX", options: { bold: true } }, { text: "POURQUOI", options: { bold: true } }],
  ["PrestaShop", "Docker sur EC2", "L'instance configurée par Ansible qu'exige le sujet ; un conteneur rend le runtime identique partout."],
  ["Base de données", "RDS MySQL 8.0", "Sauvegardes, correctifs, bascule Multi-AZ : personne ne veut écrire ça soi-même un soir d'ouverture."],
  ["Fichiers partagés", "EFS", "Plusieurs instances doivent servir les mêmes images et les mêmes sessions. EBS ne se partage pas."],
  ["Point d'entrée", "Load balancer", "Sondes de santé, drainage des connexions, répartition entre zones."],
  ["Secrets", "Secrets Manager + Vault", "Le mot de passe de la base ne quitte jamais AWS ; seuls les identifiants du back-office sont dans le dépôt, chiffrés."],
  ["Accès SSH", "Bastion", "Aucune IP publique sur les instances. Une seule porte, tracée, ouverte à une seule adresse."],
];
s.addTable(rows, {
  x: MX, y: 2.2, w: CW, colW: [2.1, 2.5, 7.49],
  fontFace: B, fontSize: 12.5, color: TEXT, valign: "top",
  border: { type: "solid", pt: 0.5, color: LINE },
  fill: { color: PAPER }, rowH: 0.62,
});
s.addNotes(`Le sujet nous laissait libres de choisir ce qui tourne sur EC2 et ce qu'on confie à un service managé. Voici nos arbitrages, et le raisonnement derrière.

PrestaShop tourne dans un conteneur Docker sur EC2. Le sujet impose l'image de Docker Hub, et l'instance EC2 configurée par Ansible. Le conteneur nous donne un environnement identique partout, et changer de version de PrestaShop devient une seule ligne de variable.

La base de données, en revanche, nous ne voulons pas la gérer. RDS nous donne les sauvegardes automatiques, les correctifs de sécurité, et surtout la bascule automatique vers une instance de secours dans une autre zone. Écrire tout ça nous-mêmes, c'est du travail que personne ne veut découvrir le soir de l'ouverture des ventes.

Pour les fichiers, il fallait un stockage partagé : plusieurs instances doivent servir les mêmes photos de produits et les mêmes sessions PHP. Un disque EBS ne se partage pas entre instances. EFS, si.

Enfin, les secrets. Le mot de passe de la base est généré par Terraform et ne quitte jamais AWS : chaque instance va le chercher elle-même avec son propre rôle IAM. Dans le dépôt, il n'y a que les identifiants du back-office, et ils sont chiffrés avec Ansible Vault.`);

// ===========================================================================
// 5 - terraform
// ===========================================================================
s = pres.addSlide();
titleSlide(s, "04 — PROVISIONNEMENT", "Terraform : six modules, un seul fichier par environnement");
const mods = [
  ["network", "VPC, trois niveaux de sous-réseaux, NAT, journaux de flux"],
  ["security", "groupes de sécurité, une règle par ressource"],
  ["storage", "EFS et une cible de montage par zone"],
  ["database", "RDS, mot de passe généré, Secrets Manager"],
  ["compute", "flotte applicative, bastion, rôle IAM d'instance"],
  ["loadbalancer", "ALB, groupe de cibles, alarmes CloudWatch"],
];
mods.forEach((m, i) => {
  const y = 1.72 + i * 0.52;
  s.addShape(pres.ShapeType.rect, { x: MX, y: y + 0.06, w: 0.1, h: 0.28, fill: { color: TEAL }, line: { color: TEAL } });
  s.addText(m[0], { x: MX + 0.22, y, w: 1.75, h: 0.4, isTextBox: true, margin: 0, fontFace: M, fontSize: 12, bold: true, color: TEXT });
  s.addText(m[1], { x: MX + 1.95, y, w: 4.6, h: 0.4, isTextBox: true, margin: 0, fontFace: B, fontSize: 12, color: MUTED });
});
const tcards = [
  ["Séparation des environnements", "env_defaults dimensionne dev, staging et prod ; chacun a son fichier de variables et sa propre clé d'état."],
  ["État distant et verrouillage", "Bucket S3 versionné et chiffré, créé par un module d'amorçage avant le premier init."],
  ["Rien en dur", "Des sources de données résolvent l'AMI Ubuntu, les zones, et l'IP publique de l'opérateur — celle à laquelle le bastion est verrouillé."],
];
tcards.forEach((c, i) => {
  const y = 1.72 + i * 1.33;
  card(s, { x: 7.05, y, w: 5.66, h: 1.2 });
  s.addText(c[0], { x: 7.25, y: y + 0.12, w: 5.3, h: 0.3, isTextBox: true, margin: 0, fontFace: H, fontSize: 13, bold: true, color: TEXT });
  s.addText(c[1], { x: 7.25, y: y + 0.44, w: 5.3, h: 0.7, isTextBox: true, margin: 0, fontFace: B, fontSize: 11.5, color: MUTED });
});
s.addText("dev : 1 instance, 1 NAT, base mono-zone        prod : 3 instances, 3 zones, base Multi-AZ, 14 jours de sauvegardes", {
  x: MX, y: 5.95, w: CW, h: 0.35, isTextBox: true, margin: 0, fontFace: M, fontSize: 11.5, color: AMBER_DK,
});
s.addNotes(`Côté Terraform, le module racine ne fait qu'assembler six modules, un par couche. Chacun a ses variables documentées et ses sorties, et peut être relu ou remplacé seul.

La séparation des environnements tient dans un seul endroit : une table de dimensionnement dans locals.tf. Le même code donne un environnement de développement à une instance et une production à trois instances réparties sur trois zones, avec une base Multi-AZ et quatorze jours de sauvegardes. On change une variable, pas du code.

L'état est distant : un bucket S3 versionné et chiffré, avec verrouillage, créé par un module d'amorçage qu'on lance une fois par compte. C'est important parce que l'état contient des secrets générés, et parce qu'à trois, on ne peut pas travailler sur un fichier d'état local.

Enfin, rien n'est écrit en dur. L'AMI Ubuntu, la liste des zones de disponibilité, et même l'adresse IP publique de la machine qui lance Terraform — c'est celle-là, et elle seule, qui a le droit d'ouvrir une session SSH sur le bastion.`);

// ===========================================================================
// 6 - ansible
// ===========================================================================
s = pres.addSlide();
titleSlide(s, "05 — CONFIGURATION", "Ansible : l'inventaire, c'est l'état Terraform");
code(s, [
  "# terraform/ansible.tf — Terraform publie les hôtes et les faits",
  'resource "ansible_host" "app" {',
  '  count     = local.app_instance_count',
  '  name      = "${local.name_prefix}-app-${count.index + 1}"',
  '  groups    = ["prestashop"]',
  '  variables = { ansible_host = ..., db_host = ..., efs_dns_name = ... }',
  "}",
  "",
  "# ansible/inventory.yml — Ansible les relit",
  "plugin: cloud.terraform.terraform_provider",
  "project_path: ./terraform",
], { x: MX, y: 1.68, w: 7.15, h: 2.85, size: 11 });

const acards = [
  ["Rôles réutilisables", "common, efs, prestashop, plus geerlingguy.docker depuis Galaxy. Le bastion et la boutique partagent le même rôle common, avec d'autres variables."],
  ["Secrets", "Le back-office est chiffré par Vault. Le mot de passe de la base n'est même pas dans le dépôt : chaque instance le lit dans Secrets Manager avec son rôle IAM."],
  ["Idempotence", "L'installeur tourne une seule fois, dans un conteneur jetable. Le conteneur qui sert la boutique est toujours créé installeur désactivé."],
];
acards.forEach((c, i) => {
  const y = 1.68 + i * 1.62;
  card(s, { x: 8.05, y, w: 4.66, h: 1.45 });
  s.addText(c[0], { x: 8.25, y: y + 0.13, w: 4.3, h: 0.3, isTextBox: true, margin: 0, fontFace: H, fontSize: 13, bold: true, color: TEXT });
  s.addText(c[1], { x: 8.25, y: y + 0.46, w: 4.3, h: 0.92, isTextBox: true, margin: 0, fontFace: B, fontSize: 11, color: MUTED });
});
s.addShape(pres.ShapeType.roundRect, { x: MX, y: 4.75, w: 7.15, h: 0.95, fill: { color: "E8F3EC" }, line: { color: OK, width: 0.75 }, rectRadius: 0.05 });
s.addText("Deuxième exécution du playbook  :  changed=0", {
  x: MX + 0.25, y: 4.88, w: 6.7, h: 0.35, isTextBox: true, margin: 0, fontFace: H, fontSize: 15, bold: true, color: OK,
});
s.addText("Aucune adresse, aucun point de terminaison n'est recopié à la main entre les deux outils.", {
  x: MX + 0.25, y: 5.24, w: 6.7, h: 0.35, isTextBox: true, margin: 0, fontFace: B, fontSize: 11.5, color: MUTED,
});
s.addNotes(`C'est le point d'intégration du projet, et celui dont nous sommes le plus contents.

Terraform sait déjà tout ce qu'Ansible a besoin de savoir : les adresses des machines, le point de terminaison de la base, l'identifiant du système de fichiers. Plutôt que de recopier ces valeurs dans un inventaire, Terraform les publie dans son propre état, avec le provider ansible. Et Ansible relit cet état grâce au plugin d'inventaire dynamique.

Résultat : il n'y a pas une seule adresse IP écrite à la main dans le projet. On ajoute une instance avec Terraform, elle apparaît toute seule dans l'inventaire.

Côté organisation, trois rôles à nous, plus un rôle installé depuis Ansible Galaxy pour Docker. Le bastion et les serveurs applicatifs partagent le même rôle de base, avec des variables différentes — c'est ça, un rôle réutilisable.

Et l'idempotence, qui est le critère le plus concret : la deuxième exécution du playbook ne change rien. Zéro modification. Ce n'est pas un hasard, c'est une contrainte de conception : l'installeur de PrestaShop tourne une fois, dans un conteneur jetable, et le conteneur qui sert réellement la boutique est toujours créé avec l'installeur désactivé.`);

// ===========================================================================
// 7 - affluence
// ===========================================================================
s = pres.addSlide();
titleSlide(s, "06 — GÉRER L'AFFLUENCE", "La capacité est un nombre, parce que rien n'est stocké sur les instances");
s.addText("Aucune commande, aucune image, aucune session ne vit sur une instance : le catalogue est dans RDS, le reste sur EFS. Ajouter de la capacité n'interrompt jamais les instances qui servent déjà.", {
  x: MX, y: 1.6, w: 11.6, h: 0.55, isTextBox: true, margin: 0, fontFace: B, fontSize: 14, color: MUTED,
});
code(s, [
  "terraform -chdir=terraform apply -var app_instance_count=6",
  "ansible-playbook -i ansible/inventory.yml ansible/site.yml --ask-vault-pass",
  "",
  "# les nouvelles instances sont réparties sur les zones, enregistrées dans le",
  "# groupe de cibles, reprises par l'inventaire, et configurées en ~3 minutes",
], { x: MX, y: 2.3, w: 12.09, h: 1.55, size: 12, dark: true });

const alarms = [
  ["Temps de réponse > 2 s", "moyenne sur 3 minutes : la flotte sature, il faut ajouter des instances"],
  ["Instances hors rotation", "une machine a quitté le service — comprendre pourquoi avant qu'il y en ait deux"],
  ["Erreurs 5xx > 10 / min", "la boutique répond, mais mal"],
];
alarms.forEach((a, i) => {
  const x = MX + i * 4.12;
  card(s, { x, y: 4.15, w: 3.85, h: 1.7 });
  s.addText("ALARME CLOUDWATCH", { x: x + 0.25, y: 4.3, w: 3.4, h: 0.25, isTextBox: true, margin: 0, fontFace: M, fontSize: 9, color: AMBER_DK, charSpacing: 1 });
  s.addText(a[0], { x: x + 0.25, y: 4.58, w: 3.4, h: 0.35, isTextBox: true, margin: 0, fontFace: H, fontSize: 13.5, bold: true, color: TEXT });
  s.addText(a[1], { x: x + 0.25, y: 4.98, w: 3.4, h: 0.75, isTextBox: true, margin: 0, fontFace: B, fontSize: 11.5, color: MUTED });
});
s.addNotes(`Venons-en à la question qui compte vraiment : l'affluence.

Notre couche applicative ne garde rien. Une commande part dans la base, une photo de produit sur le stockage partagé, une session PHP aussi. Conséquence directe : ajouter de la capacité, c'est changer un nombre.

Deux commandes. Terraform crée les instances, les répartit sur les zones et les enregistre auprès du load balancer. Puis le playbook les configure — et seulement elles, parce qu'il est idempotent : il ne touche pas à celles qui servent déjà. Il faut environ trois minutes.

Et savoir quand le faire n'est pas au doigt mouillé. Trois alarmes CloudWatch sont créées avec le load balancer. La première surveille le temps de réponse : au-delà de deux secondes en moyenne sur trois minutes, la flotte sature. La deuxième compte les instances sorties de la rotation. La troisième compte les erreurs serveur. Elles notifient un sujet SNS, donc une adresse mail d'astreinte.`);

// ===========================================================================
// 8 - pannes
// ===========================================================================
s = pres.addSlide();
titleSlide(s, "07 — QUAND ÇA CASSE", "Des temps mesurés, pas des espoirs");
const fr = [
  [{ text: "PANNE", options: { bold: true } }, { text: "CE QUE VOIENT LES CLIENTS", options: { bold: true } }, { text: "REPRISE", options: { bold: true } }, { text: "HUMAIN", options: { bold: true } }],
  ["Conteneur ou instance", "Rien — sortie de rotation après 2 sondes échouées, puis 30 s de drainage des requêtes en cours", "~30 s", "aucun"],
  ["Une zone entière", "Rien — le load balancer cesse d'utiliser ce nœud, les autres zones absorbent", "quelques secondes", "aucun"],
  ["Base de données", "Une courte fenêtre d'erreurs, puis le service reprend sur l'instance de secours", "60 à 120 s", "aucun (prod)"],
  ["Bastion", "Rien — il ne porte qu'Ansible, jamais de client", "~2 min", "recréer"],
];
s.addTable(fr, {
  x: MX, y: 1.75, w: CW, colW: [2.5, 6.09, 2.0, 1.5],
  fontFace: B, fontSize: 12.5, color: TEXT, valign: "top",
  border: { type: "solid", pt: 0.5, color: LINE }, fill: { color: PAPER }, rowH: 0.72,
});
s.addShape(pres.ShapeType.roundRect, { x: MX, y: 5.5, w: CW, h: 0.85, fill: { color: "FDF4E6" }, line: { color: AMBER, width: 0.75 }, rectRadius: 0.05 });
s.addText("Les paniers et les sessions survivent à la perte d'une instance : les sessions PHP sont sur le stockage partagé, pas sur la machine. C'est la différence entre « un serveur est tombé » et « mon panier est vide ».", {
  x: MX + 0.28, y: 5.62, w: CW - 0.56, h: 0.6, isTextBox: true, margin: 0, fontFace: B, fontSize: 13, color: TEXT,
});
s.addNotes(`Troisième question : que se passe-t-il quand ça casse. Nous avons regardé chaque panne, et mesuré.

Si un conteneur ou une instance tombe : le load balancer l'interroge toutes les quinze secondes ; après deux échecs, soit une trentaine de secondes, il la sort de la rotation. Les requêtes déjà en cours ont trente secondes pour se terminer. Les clients ne voient rien, ils sont servis par les autres instances.

Si une zone de disponibilité entière tombe : le load balancer a un nœud par zone, il cesse d'utiliser celui-là. Les instances des autres zones absorbent. C'est automatique.

Si la base tombe : en production, elle est en Multi-AZ. La bascule vers l'instance de secours prend entre une et deux minutes. Il y a une courte fenêtre d'erreurs — nous ne le cachons pas — puis le service reprend.

Si le bastion tombe : rien du tout, côté client. Il ne porte aucun trafic de clients, uniquement Ansible.

Et le point que je veux souligner : les paniers survivent. Les sessions PHP sont sur le stockage partagé, pas sur la machine. Perdre une instance, ce n'est pas perdre le panier d'un client en train de payer ses billets.`);

// ===========================================================================
// 9 - le deploiement reel
// ===========================================================================
s = pres.addSlide();
titleSlide(s, "08 — CE QUE LE DÉPLOIEMENT RÉEL A APPRIS", "Quatre bugs que seul un vrai compte AWS révèle");
const bugs = [
  ["Description de security group", "AWS valide les descriptions contre un jeu de caractères fixe, sans le caractère « > ». Notre flèche « internet -> ALB » faisait échouer la création du groupe."],
  ["awscli absent d'Ubuntu 24.04", "Le paquet a disparu de l'archive. Nous sommes passés à python3-boto3, qui est dans main — et 60 Mo de téléchargement en moins par instance."],
  ["Mot de passe interprété par le shell", "Le script sourçait le fichier d'environnement ; le mot de passe généré contenait un « & ». Nous le lisons maintenant sans jamais l'évaluer."],
  ["Cache Symfony sur NFS", "Supprimer un fichier encore ouvert sur NFS laisse une entrée cachée : le vidage de cache de PrestaShop échouait. Le cache est passé sur le disque local."],
];
bugs.forEach((b, i) => {
  const x = MX + (i % 2) * 6.15;
  const y = 1.75 + Math.floor(i / 2) * 2.15;
  card(s, { x, y, w: 5.9, h: 1.95 });
  bullet(s, x + 0.28, y + 0.26, String(i + 1), TEAL);
  s.addText(b[0], { x: x + 0.78, y: y + 0.24, w: 4.9, h: 0.38, isTextBox: true, margin: 0, fontFace: H, fontSize: 14, bold: true, color: TEXT });
  s.addText(b[1], { x: x + 0.28, y: y + 0.78, w: 5.35, h: 1.05, isTextBox: true, margin: 0, fontFace: B, fontSize: 12, color: MUTED });
});
s.addText("Les quatre correctifs sont dans le dépôt : le prochain déploiement, depuis zéro, ne les rencontre plus.", {
  x: MX, y: 6.15, w: CW, h: 0.35, isTextBox: true, margin: 0, fontFace: B, fontSize: 13, italic: true, color: AMBER_DK,
});
s.addNotes(`Nous voulions vous montrer cette diapositive, parce qu'elle raconte la partie honnête du projet.

Le code était écrit, relu, validé statiquement. Puis nous l'avons déployé sur un vrai compte AWS, et nous avons rencontré quatre problèmes que ni une relecture ni un émulateur n'auraient montrés.

Le premier : AWS valide les descriptions de groupes de sécurité contre une liste de caractères autorisés, et le chevron n'en fait pas partie. Nous avions écrit une flèche dans une description.

Le deuxième : le paquet awscli n'existe plus dans les dépôts d'Ubuntu 24.04. Nous aurions pu installer l'outil officiel, soixante mégaoctets par instance, pour un seul appel. Nous sommes passés à la bibliothèque Python boto3, qui est dans les dépôts de base.

Le troisième est notre préféré : le script de configuration chargeait le fichier d'environnement avec la commande source du shell, et le mot de passe généré contenait une esperluette. Le shell a essayé de l'exécuter. Nous lisons maintenant ce fichier sans jamais l'évaluer, et nous avons restreint les caractères du mot de passe généré.

Le quatrième : sur NFS, supprimer un fichier encore ouvert laisse une entrée fantôme. Le vidage de cache de PrestaShop échouait donc, et tuait le conteneur juste après une installation réussie. Le cache compilé est de la donnée dérivée : il n'avait rien à faire sur un stockage partagé. Il est passé sur le disque local de chaque instance.

Les quatre correctifs sont dans le dépôt. Un déploiement depuis zéro ne les rencontre plus.`);

// ===========================================================================
// 10 - limites
// ===========================================================================
s = pres.addSlide();
titleSlide(s, "09 — LIMITES ASSUMÉES", "Ce que cette architecture ne fait pas");
const lims = [
  ["La montée en charge est déclarative, pas automatique", "Un pic soudain demande un opérateur et deux commandes, environ trois minutes. La suite logique : figer le résultat d'Ansible dans une image avec Packer, et placer un groupe d'autoscaling derrière le même groupe de cibles. La sonde de santé et le rôle sont déjà écrits pour ça."],
  ["La racine web est sur EFS", "Les instances deviennent interchangeables, au prix de la latence NFS sur les inclusions PHP. Au-delà de quelques milliers de requêtes par minute : le code dans l'image, seules les images produits sur EFS, et un CDN devant."],
  ["Une seule base en écriture", "Les lectures peuvent partir sur un réplica, pas les écritures. Une billetterie écrit beaucoup : la taille de l'instance primaire est le vrai plafond."],
  ["Une seule région", "Une panne régionale, c'est une interruption. Le multi-région coûterait plus cher que la panne qu'il évite, à cette échelle. C'est un arbitrage, pas un oubli."],
];
lims.forEach((l, i) => {
  const x = MX + (i % 2) * 6.15;
  const y = 1.72 + Math.floor(i / 2) * 2.2;
  card(s, { x, y, w: 5.9, h: 2.0 });
  s.addText(l[0], { x: x + 0.28, y: y + 0.18, w: 5.35, h: 0.62, isTextBox: true, margin: 0, fontFace: H, fontSize: 14, bold: true, color: TEXT });
  s.addText(l[1], { x: x + 0.28, y: y + 0.82, w: 5.35, h: 1.05, isTextBox: true, margin: 0, fontFace: B, fontSize: 11.5, color: MUTED });
});
s.addNotes(`Une architecture sans limite connue, c'est une architecture qu'on n'a pas comprise. Voici les nôtres.

La première, la plus importante : notre montée en charge est déclarative, pas automatique. Un pic soudain demande un opérateur et deux commandes. Environ trois minutes. La suite logique, nous savons la décrire : figer le résultat d'Ansible dans une image machine avec Packer, puis placer un groupe d'autoscaling derrière le même groupe de cibles. Notre sonde de santé et notre rôle sont déjà écrits pour ça — c'est une évolution, pas une réécriture.

La deuxième : nous avons mis toute la racine web sur EFS. Cela rend les instances interchangeables, mais cela coûte de la latence sur chaque inclusion de fichier PHP. Au-delà de quelques milliers de requêtes par minute, il faudrait mettre le code dans l'image, ne garder que les images produits sur EFS, et placer un CDN devant.

La troisième : une seule base en écriture. On peut déporter les lectures sur un réplica, pas les écritures. Et une billetterie, ça écrit beaucoup.

La quatrième : une seule région. Une panne régionale serait une interruption. À cette échelle, le multi-région coûterait plus cher que la panne qu'il évite. C'est un arbitrage assumé.`);

// ===========================================================================
// 11 - demo
// ===========================================================================
s = pres.addSlide();
titleSlide(s, "10 — DÉMONSTRATION", "D'un compte vide à une boutique en ligne");
code(s, [
  "# une fois par compte : état versionné, chiffré, verrouillé",
  "./scripts/bootstrap-backend.sh dev",
  "",
  "terraform -chdir=terraform init",
  "terraform -chdir=terraform apply",
  "",
  "ansible-galaxy install -r ansible/requirements.yml",
  "ansible-inventory -i ansible/inventory.yml --graph",
  "ansible-playbook  -i ansible/inventory.yml ansible/site.yml --ask-vault-pass",
], { x: MX, y: 1.7, w: 7.3, h: 3.1, size: 11.5, dark: true });

const steps = [
  "Ouvrir la boutique et le back-office",
  "Relancer le playbook : changed=0",
  "Ajouter une instance, la voir entrer en rotation",
  "Arrêter le conteneur : la boutique reste debout",
];
steps.forEach((t, i) => {
  const y = 1.75 + i * 0.8;
  bullet(s, 8.2, y, String(i + 1));
  s.addText(t, { x: 8.72, y: y - 0.02, w: 4.1, h: 0.45, isTextBox: true, margin: 0, fontFace: B, fontSize: 13.5, color: TEXT, valign: "middle" });
});
s.addShape(pres.ShapeType.roundRect, { x: MX, y: 5.05, w: 7.3, h: 0.78, fill: { color: WASH }, line: { color: LINE, width: 0.75 }, rectRadius: 0.05 });
s.addText("Tout le reste — réseau, base, stockage, sondes, secrets — découle de ces six commandes.", {
  x: MX + 0.25, y: 5.18, w: 6.8, h: 0.55, isTextBox: true, margin: 0, fontFace: B, fontSize: 12.5, color: MUTED,
});
s.addNotes(`Passons à la démonstration. Voici la totalité de ce qu'il faut taper.

Une fois par compte, on crée le backend d'état : un bucket S3 versionné, chiffré, avec verrouillage. C'est le seul prérequis, et il est documenté dans le README.

Ensuite, Terraform : init, apply. Une douzaine de minutes, c'est la base de données qui est lente.

Puis Ansible : on installe les dépendances depuis Galaxy, on vérifie que l'inventaire dynamique voit bien les machines — et je vous invite à regarder cette commande, parce qu'aucune adresse n'y est écrite — et on lance le playbook.

Je vais vous montrer quatre choses : la boutique et son back-office ; le playbook relancé qui ne change rien ; l'ajout d'une instance qui entre en rotation toute seule ; et enfin, j'arrête le conteneur sur une instance pour vous montrer que la boutique reste debout.`);

// ===========================================================================
// 12 - fin
// ===========================================================================
s = pres.addSlide();
s.background = { color: INK };
s.addShape(pres.ShapeType.ellipse, { x: MX, y: 1.72, w: 0.16, h: 0.16, fill: { color: AMBER }, line: { color: AMBER } });
s.addText("QUESTIONS", {
  x: MX + 0.3, y: 1.65, w: CW, h: 0.3, isTextBox: true, margin: 0, fontFace: M, fontSize: 12, color: AMBER, charSpacing: 2,
});
s.addText("Déployée, documentée,\nreproductible.", {
  x: MX, y: 2.15, w: 11.0, h: 1.7, isTextBox: true, margin: 0,
  fontFace: H, fontSize: 42, bold: true, color: PAPER, lineSpacing: 46,
});
const finals = [
  ["terraform/", "6 modules · 3 environnements · état distant"],
  ["ansible/", "3 rôles · Galaxy · Vault · changed=0"],
  ["README.md", "déployer, exploiter, dépanner"],
];
finals.forEach((f, i) => {
  const x = MX + i * 4.12;
  s.addShape(pres.ShapeType.roundRect, { x, y: 4.2, w: 3.85, h: 1.1, fill: { color: INK_SOFT }, line: { color: "35475A", width: 0.75 }, rectRadius: 0.06 });
  s.addText(f[0], { x: x + 0.25, y: 4.35, w: 3.4, h: 0.3, isTextBox: true, margin: 0, fontFace: M, fontSize: 13, bold: true, color: AMBER });
  s.addText(f[1], { x: x + 0.25, y: 4.68, w: 3.4, h: 0.5, isTextBox: true, margin: 0, fontFace: B, fontSize: 11.5, color: "A8B8C8" });
});
s.addText("Merci.  —  5HASH", {
  x: MX, y: 5.75, w: CW, h: 0.4, isTextBox: true, margin: 0, fontFace: H, fontSize: 17, bold: true, color: PAPER,
});
s.addNotes(`Pour conclure : la solution est déployée sur un vrai compte, elle est documentée dans un README qui sert de manuel d'exploitation — déployer, exploiter, mettre à l'échelle, dépanner, détruire — et elle est reproductible : nous l'avons détruite et redéployée pour en être sûrs.

Nous sommes prêts pour vos questions.

[Questions probables et réponses courtes :

— Pourquoi pas d'autoscaling ? Parce que notre unité de déploiement est une instance configurée par Ansible, pas une image figée. Le faire proprement demande Packer et une image préconstruite ; nous avons préféré livrer quelque chose qui marche et dont nous connaissons la limite, plutôt qu'un groupe d'autoscaling qui lancerait des machines non configurées.

— Pourquoi EFS et pas S3 ? Parce que PrestaShop écrit sur un système de fichiers. Utiliser S3 demanderait un module PrestaShop supplémentaire ; EFS est transparent pour l'application.

— Où est le mot de passe de la base ? Nulle part dans le dépôt. Terraform le génère, le dépose dans Secrets Manager, et chaque instance va le chercher avec son propre rôle IAM. Il n'est même pas dans l'inventaire Ansible.

— Combien ça coûte ? Environ deux à trois dollars par jour pour l'environnement de développement, et les postes principaux sont la passerelle NAT et le load balancer.

— Comment gérez-vous les montées de version de PrestaShop ? C'est une variable dans les variables de groupe Ansible : on change le tag de l'image, on relance le playbook. On prend un instantané de la base avant.]`);

pres.writeFile({ fileName: process.argv[2] || "soutenance.pptx" }).then((f) => console.log("écrit :", f));
