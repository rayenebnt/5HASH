const PptxGenJS = require("pptxgenjs");

// --- palette ---------------------------------------------------------------
const INK = "0F1720";
const INK_SOFT = "1B2732";
const PAPER = "FFFFFF";
const WASH = "F2F5F7";
const TEXT = "17222C";
const MUTED = "5C6B7A";
const LINE = "D3DBE3";
const AMBER = "E08B1F";
const AMBER_DK = "9E5D06";
const TEAL = "0C6A72";
const OK = "2E7D4F";

const H = "Arial";
const B = "Calibri";
const M = "Courier New";

const pres = new PptxGenJS();
pres.layout = "LAYOUT_WIDE"; // 13.33 x 7.5
pres.author = "5HASH";
pres.company = "5HASH";
pres.title = "Taylor Shift - Infrastructure de la boutique";

const MX = 0.62;
const CW = 13.33 - MX * 2;

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

// la conclusion factuelle de la diapositive
function keyLine(slide, text, y) {
  slide.addText(text, {
    x: MX, y, w: CW, h: 0.4, isTextBox: true, margin: 0,
    fontFace: B, fontSize: 15, bold: true, color: AMBER_DK,
  });
}

// ===========================================================================
// 1 - titre
// ===========================================================================
let s = pres.addSlide();
s.background = { color: INK };
s.addShape(pres.ShapeType.ellipse, { x: MX, y: 1.62, w: 0.16, h: 0.16, fill: { color: AMBER }, line: { color: AMBER } });
s.addText("PROJET 5HASH  ·  INFRASTRUCTURE AS CODE", {
  x: MX + 0.3, y: 1.55, w: CW, h: 0.3, isTextBox: true, margin: 0,
  fontFace: M, fontSize: 12, color: AMBER, charSpacing: 2,
});
s.addText("Taylor Shift", {
  x: MX, y: 2.1, w: CW, h: 1.15, isTextBox: true, margin: 0,
  fontFace: H, fontSize: 60, bold: true, color: PAPER,
});
s.addText("Infrastructure de la boutique de billets", {
  x: MX, y: 3.3, w: 9.6, h: 0.5, isTextBox: true, margin: 0,
  fontFace: B, fontSize: 22, color: "A8B8C8",
});
const chips = ["Terraform", "Ansible", "PrestaShop", "AWS"];
chips.forEach((c, i) => {
  const x = MX + i * 2.0;
  s.addShape(pres.ShapeType.roundRect, {
    x, y: 4.2, w: 1.8, h: 0.45, fill: { color: INK_SOFT }, line: { color: "35475A", width: 0.75 }, rectRadius: 0.08,
  });
  s.addText(c, { x, y: 4.2, w: 1.8, h: 0.45, isTextBox: true, margin: 0, fontFace: M, fontSize: 12, color: "C9D6E2", align: "center", valign: "middle" });
});
s.addText("Prénom 1  ·  Prénom 2  ·  Prénom 3", {
  x: MX, y: 5.25, w: CW, h: 0.35, isTextBox: true, margin: 0, fontFace: B, fontSize: 16, color: PAPER,
});
s.addText("Déployé sur un compte AWS, région eu-west-3 (Paris)", {
  x: MX, y: 5.68, w: CW, h: 0.3, isTextBox: true, margin: 0, fontFace: B, fontSize: 13, color: "7A8C9E",
});
s.addNotes(`Bonjour. Nous sommes l'agence 5HASH. Taylor Shift nous a confié l'infrastructure de sa boutique de billets.

L'application existe déjà : c'est PrestaShop, l'image publiée sur Docker Hub. Nous ne touchons pas au code du site. Notre travail, c'est de l'héberger, de le configurer, et de faire en sorte qu'il tienne le jour de l'ouverture des ventes.

Nous avons utilisé deux outils : Terraform pour créer l'infrastructure, Ansible pour configurer les serveurs. Tout est déployé sur un compte AWS réel, en région Paris. Nous ferons une démonstration à la fin.`);

// ===========================================================================
// 2 - les trois questions
// ===========================================================================
s = pres.addSlide();
titleSlide(s, "01 — LE BESOIN", "Trois questions au départ");
const qs = [
  ["1", "Par où passent\nles requêtes ?", "Un seul point d'entrée public. Les serveurs et la base sont dans des réseaux privés."],
  ["2", "Comment absorber\nun pic de trafic ?", "Les serveurs ne stockent aucune donnée. On peut donc en ajouter à la demande."],
  ["3", "Que se passe-t-il\nen cas de panne ?", "Le load balancer retire le serveur en panne. Les autres continuent de répondre."],
];
qs.forEach((q, i) => {
  const x = MX + i * 4.12;
  card(s, { x, y: 1.85, w: 3.85, h: 3.0 });
  bullet(s, x + 0.3, 2.15, q[0]);
  s.addText(q[1], { x: x + 0.3, y: 2.68, w: 3.25, h: 0.95, isTextBox: true, margin: 0, fontFace: H, fontSize: 16, bold: true, color: TEXT, lineSpacing: 22 });
  s.addText(q[2], { x: x + 0.3, y: 3.72, w: 3.25, h: 0.95, isTextBox: true, margin: 0, fontFace: B, fontSize: 13.5, color: MUTED });
});
keyLine(s, "Chaque choix présenté ensuite répond à l'une de ces trois questions.", 5.25);
s.addNotes(`Avant de choisir les technologies, nous avons posé trois questions.

Première question : par où passent les requêtes ? C'est la question du réseau et de la sécurité. Notre réponse : un seul point d'entrée public, et tout le reste dans des réseaux privés.

Deuxième question : comment absorber un pic de trafic ? Une ouverture de billetterie, c'est un pic, pas une charge régulière. Notre réponse : les serveurs ne stockent aucune donnée, donc on peut en ajouter à la demande.

Troisième question : que se passe-t-il en cas de panne ? Notre réponse : le load balancer retire automatiquement le serveur en panne, et les autres continuent.

Chaque choix que nous présentons ensuite répond à l'une de ces trois questions.`);

// ===========================================================================
// 3 - architecture
// ===========================================================================
s = pres.addSlide();
titleSlide(s, "02 — ARCHITECTURE", "Trois niveaux de réseau, deux zones de disponibilité");

const dTop = 1.72, dLeft = 1.75, dW = 10.9;
const bands = [
  ["RÉSEAU\nPUBLIC", dTop + 0.42, 1.15],
  ["RÉSEAU PRIVÉ\nAPPLICATION", dTop + 1.95, 1.15],
  ["RÉSEAU PRIVÉ\nDONNÉES", dTop + 3.45, 1.3],
];
bands.forEach(([label, y, h]) => {
  s.addShape(pres.ShapeType.roundRect, { x: dLeft, y, w: dW, h, fill: { color: WASH }, line: { color: LINE, width: 0.75 }, rectRadius: 0.03 });
  s.addText(label, { x: MX - 0.05, y: y + h / 2 - 0.3, w: 1.15, h: 0.6, isTextBox: true, margin: 0, fontFace: M, fontSize: 8.5, color: MUTED, align: "right", valign: "middle" });
});
s.addText("INTERNET", { x: dLeft + 0.3, y: dTop - 0.02, w: 2.0, h: 0.3, isTextBox: true, margin: 0, fontFace: M, fontSize: 10, color: MUTED });
s.addShape(pres.ShapeType.line, { x: dLeft + 0.75, y: dTop + 0.26, w: 0, h: 0.16, line: { color: AMBER, width: 1.5 } });
s.addText("clients · HTTP", { x: dLeft + 0.95, y: dTop + 0.18, w: 1.6, h: 0.25, isTextBox: true, margin: 0, fontFace: M, fontSize: 8.5, color: AMBER_DK });
s.addShape(pres.ShapeType.line, { x: dLeft + 8.4, y: dTop + 0.26, w: 0, h: 0.16, line: { color: MUTED, width: 1.25, dashType: "dash" } });
s.addText("administration · SSH, notre IP", { x: dLeft + 8.6, y: dTop + 0.18, w: 2.6, h: 0.25, isTextBox: true, margin: 0, fontFace: M, fontSize: 8.5, color: MUTED });

card(s, { x: dLeft + 0.28, y: dTop + 0.58, w: 5.0, h: 0.82, fill: PAPER, line: AMBER });
s.addText("Load balancer", { x: dLeft + 0.45, y: dTop + 0.68, w: 4.7, h: 0.3, isTextBox: true, margin: 0, fontFace: H, fontSize: 13.5, bold: true, color: TEXT });
s.addText("répartit les requêtes · vérifie chaque serveur toutes les 15 s", { x: dLeft + 0.45, y: dTop + 1.0, w: 4.7, h: 0.3, isTextBox: true, margin: 0, fontFace: B, fontSize: 11, color: MUTED });

card(s, { x: dLeft + 7.4, y: dTop + 0.58, w: 3.2, h: 0.82, fill: PAPER, line: "B4C0CC" });
s.addText("Bastion", { x: dLeft + 7.58, y: dTop + 0.68, w: 2.9, h: 0.3, isTextBox: true, margin: 0, fontFace: H, fontSize: 13.5, bold: true, color: TEXT });
s.addText("accès SSH pour Ansible uniquement", { x: dLeft + 7.58, y: dTop + 1.0, w: 2.9, h: 0.3, isTextBox: true, margin: 0, fontFace: B, fontSize: 11, color: MUTED });

s.addShape(pres.ShapeType.line, { x: dLeft + 2.4, y: dTop + 1.42, w: 0, h: 0.5, line: { color: AMBER, width: 1.75, endArrowType: "triangle" } });
s.addText("port 80", { x: dLeft + 2.55, y: dTop + 1.5, w: 1.1, h: 0.25, isTextBox: true, margin: 0, fontFace: M, fontSize: 9, color: AMBER_DK });
s.addShape(pres.ShapeType.line, { x: dLeft + 9.0, y: dTop + 1.42, w: 0, h: 0.5, line: { color: MUTED, width: 1.25, dashType: "dash", endArrowType: "triangle" } });
s.addText("port 22", { x: dLeft + 9.15, y: dTop + 1.5, w: 1.1, h: 0.25, isTextBox: true, margin: 0, fontFace: M, fontSize: 9, color: MUTED });

card(s, { x: dLeft + 0.28, y: dTop + 2.12, w: 10.3, h: 0.82, fill: PAPER, line: "B4C0CC" });
s.addText("Serveurs EC2  —  conteneur Docker PrestaShop", { x: dLeft + 0.45, y: dTop + 2.2, w: 9.9, h: 0.3, isTextBox: true, margin: 0, fontFace: H, fontSize: 13.5, bold: true, color: TEXT });
s.addText("identiques · répartis sur les zones · aucune adresse IP publique", { x: dLeft + 0.45, y: dTop + 2.52, w: 9.9, h: 0.3, isTextBox: true, margin: 0, fontFace: B, fontSize: 11, color: MUTED });

s.addShape(pres.ShapeType.line, { x: dLeft + 2.4, y: dTop + 2.96, w: 0, h: 0.46, line: { color: TEAL, width: 1.75, endArrowType: "triangle" } });
s.addText("port 3306", { x: dLeft + 2.55, y: dTop + 3.02, w: 1.3, h: 0.25, isTextBox: true, margin: 0, fontFace: M, fontSize: 9, color: TEAL });
s.addShape(pres.ShapeType.line, { x: dLeft + 8.0, y: dTop + 2.96, w: 0, h: 0.46, line: { color: TEAL, width: 1.75, endArrowType: "triangle" } });
s.addText("port 2049", { x: dLeft + 8.15, y: dTop + 3.02, w: 1.3, h: 0.25, isTextBox: true, margin: 0, fontFace: M, fontSize: 9, color: TEAL });

card(s, { x: dLeft + 0.28, y: dTop + 3.62, w: 5.0, h: 0.96, fill: PAPER, line: TEAL });
s.addText("Base de données RDS MySQL", { x: dLeft + 0.45, y: dTop + 3.72, w: 4.7, h: 0.3, isTextBox: true, margin: 0, fontFace: H, fontSize: 13.5, bold: true, color: TEXT });
s.addText("catalogue, paniers, commandes", { x: dLeft + 0.45, y: dTop + 4.06, w: 4.7, h: 0.35, isTextBox: true, margin: 0, fontFace: B, fontSize: 11, color: MUTED });

card(s, { x: dLeft + 5.6, y: dTop + 3.62, w: 5.0, h: 0.96, fill: PAPER, line: TEAL });
s.addText("Disque partagé EFS", { x: dLeft + 5.78, y: dTop + 3.72, w: 4.7, h: 0.3, isTextBox: true, margin: 0, fontFace: H, fontSize: 13.5, bold: true, color: TEXT });
s.addText("images, thème, sessions PHP", { x: dLeft + 5.78, y: dTop + 4.06, w: 4.7, h: 0.35, isTextBox: true, margin: 0, fontFace: B, fontSize: 11, color: MUTED });

keyLine(s, "Les serveurs ne stockent aucune donnée : tout est dans la base ou sur le disque partagé.", 6.6);
s.addNotes(`Voici l'architecture. Elle se lit de haut en bas, dans le sens d'une requête.

Premier niveau, le réseau public. Il contient deux choses. Le load balancer, qui est le seul point d'entrée des clients : il répartit les requêtes entre les serveurs et vérifie leur état toutes les quinze secondes. Et le bastion, qui sert uniquement à notre accès SSH : il est ouvert à une seule adresse IP, la nôtre. Aucun client ne passe par le bastion.

Deuxième niveau, le réseau privé applicatif. Il contient les serveurs EC2, avec le conteneur PrestaShop. Ils sont identiques entre eux, répartis sur les deux zones de disponibilité, et ils n'ont aucune adresse IP publique : on ne peut les joindre qu'à travers le load balancer.

Troisième niveau, le réseau privé des données. La base MySQL d'un côté, le disque partagé de l'autre. Ce niveau n'a aucune route vers Internet.

Le point à retenir : les serveurs ne stockent aucune donnée. Le catalogue et les commandes sont dans la base, les images et les sessions sur le disque partagé. C'est ce qui permet d'ajouter ou de perdre un serveur sans conséquence.`);

// ===========================================================================
// 4 - choix
// ===========================================================================
s = pres.addSlide();
titleSlide(s, "03 — NOS CHOIX", "Ce qu'on gère, ce qu'on laisse à AWS");
s.addText("Le sujet nous laissait libres de répartir. Nous avons gardé ce qui est propre à la boutique, et confié à AWS ce qui est standard.", {
  x: MX, y: 1.6, w: 11.8, h: 0.45, isTextBox: true, margin: 0, fontFace: B, fontSize: 14, color: MUTED,
});
const rows = [
  [{ text: "COMPOSANT", options: { bold: true } }, { text: "CHOIX", options: { bold: true } }, { text: "RAISON", options: { bold: true } }],
  ["Application", "Docker sur EC2", "Le sujet impose l'image PrestaShop sur une instance EC2 configurée par Ansible. Changer de version se fait en une ligne."],
  ["Base de données", "RDS MySQL (managé)", "AWS gère les sauvegardes, les mises à jour et le basculement automatique vers une instance de secours."],
  ["Fichiers", "EFS (disque partagé)", "Plusieurs serveurs doivent lire et écrire les mêmes fichiers. Un disque EBS ne se partage pas."],
  ["Point d'entrée", "Load balancer (ALB)", "Il surveille l'état des serveurs et répartit les requêtes entre les zones."],
  ["Secrets", "Secrets Manager + Vault", "Le mot de passe de la base n'est pas dans le dépôt. Chaque serveur le lit avec son rôle IAM."],
  ["Accès administration", "Bastion SSH", "Les serveurs n'ont pas d'adresse publique. Un seul point d'accès, limité à notre IP."],
];
s.addTable(rows, {
  x: MX, y: 2.2, w: CW, colW: [2.3, 2.7, 7.09],
  fontFace: B, fontSize: 12.5, color: TEXT, valign: "top",
  border: { type: "solid", pt: 0.5, color: LINE },
  fill: { color: PAPER }, rowH: 0.62,
});
s.addNotes(`Le sujet nous laissait libres de choisir ce qui tourne sur EC2 et ce qu'on confie à un service managé. Voici nos choix.

L'application tourne dans un conteneur Docker sur une instance EC2. C'est ce que demande le sujet. Le conteneur donne un environnement identique partout, et changer de version de PrestaShop revient à modifier une ligne.

La base de données est managée, c'est RDS. AWS gère les sauvegardes automatiques, les mises à jour de sécurité, et le basculement vers une instance de secours. Nous n'avons pas voulu réécrire ça nous-mêmes.

Pour les fichiers, il fallait un stockage que plusieurs serveurs lisent et écrivent en même temps. Un disque EBS ne se partage pas entre instances, EFS si.

Pour le point d'entrée, le load balancer surveille les serveurs et répartit les requêtes entre les deux zones.

Pour les secrets, le mot de passe de la base est généré par Terraform et déposé dans Secrets Manager. Il n'est pas dans le dépôt. Chaque serveur va le chercher avec son propre rôle IAM. Seuls les identifiants du back-office sont dans le dépôt, et ils sont chiffrés avec Ansible Vault.

Enfin, les serveurs n'ont pas d'adresse publique. L'accès administration passe par un bastion, ouvert à notre seule adresse IP.`);

// ===========================================================================
// 5 - terraform
// ===========================================================================
s = pres.addSlide();
titleSlide(s, "04 — TERRAFORM", "Terraform crée l'infrastructure");
s.addText("Le code est découpé en six modules, un par couche. Chaque module a ses variables et ses sorties, et peut être relu séparément.", {
  x: MX, y: 1.58, w: 11.8, h: 0.45, isTextBox: true, margin: 0, fontFace: B, fontSize: 14, color: MUTED,
});
const mods = [
  ["network", "VPC, sous-réseaux, NAT, routes"],
  ["security", "groupes de sécurité"],
  ["storage", "disque partagé EFS"],
  ["database", "RDS MySQL, Secrets Manager"],
  ["compute", "instances EC2, bastion, rôle IAM"],
  ["loadbalancer", "ALB, alarmes CloudWatch"],
];
mods.forEach((m, i) => {
  const y = 2.2 + i * 0.52;
  s.addShape(pres.ShapeType.rect, { x: MX, y: y + 0.06, w: 0.1, h: 0.28, fill: { color: TEAL }, line: { color: TEAL } });
  s.addText(m[0], { x: MX + 0.22, y, w: 1.8, h: 0.4, isTextBox: true, margin: 0, fontFace: M, fontSize: 12, bold: true, color: TEXT });
  s.addText(m[1], { x: MX + 2.0, y, w: 4.3, h: 0.4, isTextBox: true, margin: 0, fontFace: B, fontSize: 12.5, color: MUTED });
});
const tcards = [
  ["Trois environnements, un seul code", "dev, staging et prod utilisent le même code. Une table de variables définit les tailles : 1 serveur en dev, 3 serveurs sur 3 zones en prod."],
  ["État distant et verrouillage", "L'état Terraform est dans un bucket S3 versionné et chiffré, avec un verrou. Deux personnes ne peuvent pas modifier en même temps."],
  ["Valeurs résolues automatiquement", "L'AMI Ubuntu, la liste des zones et notre adresse IP publique sont lues à l'exécution, pas écrites en dur dans le code."],
];
tcards.forEach((c, i) => {
  const y = 2.2 + i * 1.33;
  card(s, { x: 7.05, y, w: 5.66, h: 1.2 });
  s.addText(c[0], { x: 7.25, y: y + 0.12, w: 5.3, h: 0.3, isTextBox: true, margin: 0, fontFace: H, fontSize: 13, bold: true, color: TEXT });
  s.addText(c[1], { x: 7.25, y: y + 0.44, w: 5.3, h: 0.72, isTextBox: true, margin: 0, fontFace: B, fontSize: 11.5, color: MUTED });
});
s.addNotes(`Terraform crée l'infrastructure. On décrit les ressources voulues, Terraform les crée et retient ce qu'il a créé.

Nous avons découpé le code en six modules, un par couche : le réseau, les groupes de sécurité, le stockage, la base, les instances et le load balancer. Chaque module a ses variables documentées et ses sorties. On peut en relire un sans lire les autres.

Pour les environnements, nous avons dev, staging et prod. C'est le même code. Une table de variables définit les tailles : en dev, un serveur et une base simple ; en prod, trois serveurs sur trois zones, une base avec instance de secours, et quatorze jours de sauvegardes. On change une variable, pas le code.

L'état Terraform, c'est-à-dire la liste de ce qui a été créé, est stocké dans un bucket S3 versionné et chiffré, avec un verrou. C'est nécessaire à trois : sans ça, deux personnes peuvent modifier l'infrastructure en même temps.

Enfin, trois valeurs sont lues automatiquement à l'exécution : l'identifiant de l'image Ubuntu, la liste des zones disponibles, et notre adresse IP publique. Cette dernière sert à autoriser l'accès SSH au bastion.`);

// ===========================================================================
// 6 - ansible
// ===========================================================================
s = pres.addSlide();
titleSlide(s, "05 — ANSIBLE", "Ansible configure les serveurs");
s.addText("Terraform connaît les adresses des serveurs. Ansible les lit directement dans l'état Terraform, au lieu qu'on les recopie.", {
  x: MX, y: 1.58, w: 11.8, h: 0.4, isTextBox: true, margin: 0, fontFace: B, fontSize: 14, color: MUTED,
});
code(s, [
  "# Terraform déclare les serveurs et leurs informations",
  'resource "ansible_host" "app" {',
  '  name      = "taylorshift-dev-app-1"',
  '  groups    = ["prestashop"]',
  '  variables = { ansible_host = ..., db_host = ... }',
  "}",
  "",
  "# Ansible les lit depuis l'état Terraform",
  "plugin: cloud.terraform.terraform_provider",
], { x: MX, y: 2.1, w: 7.15, h: 2.5, size: 11.5 });

const acards = [
  ["Trois rôles réutilisables", "common, efs et prestashop. Le bastion et les serveurs applicatifs utilisent le même rôle common avec des variables différentes. Docker vient d'un rôle Ansible Galaxy."],
  ["Secrets protégés", "Les identifiants du back-office sont chiffrés avec Ansible Vault. Le mot de passe de la base n'est pas dans le dépôt."],
  ["Playbook idempotent", "Le playbook décrit l'état voulu. Si l'état est déjà atteint, il ne modifie rien."],
];
acards.forEach((c, i) => {
  const y = 2.1 + i * 1.5;
  card(s, { x: 8.05, y, w: 4.66, h: 1.35 });
  s.addText(c[0], { x: 8.25, y: y + 0.13, w: 4.3, h: 0.3, isTextBox: true, margin: 0, fontFace: H, fontSize: 13, bold: true, color: TEXT });
  s.addText(c[1], { x: 8.25, y: y + 0.46, w: 4.3, h: 0.85, isTextBox: true, margin: 0, fontFace: B, fontSize: 11, color: MUTED });
});
s.addShape(pres.ShapeType.roundRect, { x: MX, y: 4.85, w: 7.15, h: 1.0, fill: { color: "E8F3EC" }, line: { color: OK, width: 0.75 }, rectRadius: 0.05 });
s.addText("Deuxième exécution : changed=0", {
  x: MX + 0.25, y: 4.98, w: 6.7, h: 0.35, isTextBox: true, margin: 0, fontFace: H, fontSize: 16, bold: true, color: OK,
});
s.addText("Aucune modification. Les serveurs sont déjà dans l'état décrit.", {
  x: MX + 0.25, y: 5.36, w: 6.7, h: 0.35, isTextBox: true, margin: 0, fontFace: B, fontSize: 12.5, color: MUTED,
});
s.addNotes(`Ansible configure les serveurs créés par Terraform : il installe Docker, monte le disque partagé, récupère le mot de passe de la base et démarre le conteneur PrestaShop.

Le point d'intégration entre les deux outils est ici. Terraform connaît les adresses des serveurs. Plutôt que de les recopier dans un fichier d'inventaire, Terraform les déclare dans son état, et Ansible les lit depuis cet état avec un plugin d'inventaire dynamique.

Conséquence : il n'y a aucune adresse IP écrite à la main dans le projet. Quand on ajoute un serveur avec Terraform, il apparaît automatiquement dans l'inventaire Ansible.

Nous avons écrit trois rôles réutilisables : common, efs et prestashop. Le bastion et les serveurs applicatifs utilisent le même rôle common, avec des variables différentes. Pour Docker, nous avons utilisé un rôle existant d'Ansible Galaxy plutôt que de le réécrire.

Les identifiants du back-office sont chiffrés avec Ansible Vault. Le mot de passe de la base n'est pas dans le dépôt du tout.

Enfin, le playbook est idempotent : il décrit l'état voulu, pas une suite d'étapes. À la deuxième exécution, il affiche changed égale zéro : il ne modifie rien, parce que tout est déjà en place.`);

// ===========================================================================
// 7 - montee en charge
// ===========================================================================
s = pres.addSlide();
titleSlide(s, "06 — MONTÉE EN CHARGE", "Ajouter des serveurs = modifier une variable");
s.addText("Les serveurs ne stockent aucune donnée. On peut donc en ajouter sans interrompre ceux qui répondent déjà.", {
  x: MX, y: 1.6, w: 11.8, h: 0.4, isTextBox: true, margin: 0, fontFace: B, fontSize: 14, color: MUTED,
});
code(s, [
  "terraform apply -var app_instance_count=6     # crée les serveurs",
  "ansible-playbook ... site.yml                 # les configure",
  "",
  "# environ 3 minutes, sans interruption de service",
], { x: MX, y: 2.3, w: 12.09, h: 1.35, size: 12.5, dark: true });

const alarms = [
  ["Temps de réponse > 2 s", "Moyenne sur 3 minutes. Signifie que les serveurs saturent : il faut en ajouter."],
  ["Serveur hors rotation", "Le load balancer a retiré un serveur. Il faut comprendre pourquoi."],
  ["Plus de 10 erreurs 5xx / min", "Les serveurs répondent, mais renvoient des erreurs."],
];
alarms.forEach((a, i) => {
  const x = MX + i * 4.12;
  card(s, { x, y: 4.0, w: 3.85, h: 1.85 });
  s.addText("ALARME CLOUDWATCH", { x: x + 0.25, y: 4.15, w: 3.4, h: 0.25, isTextBox: true, margin: 0, fontFace: M, fontSize: 9, color: AMBER_DK, charSpacing: 1 });
  s.addText(a[0], { x: x + 0.25, y: 4.45, w: 3.4, h: 0.35, isTextBox: true, margin: 0, fontFace: H, fontSize: 14, bold: true, color: TEXT });
  s.addText(a[1], { x: x + 0.25, y: 4.88, w: 3.4, h: 0.85, isTextBox: true, margin: 0, fontFace: B, fontSize: 11.5, color: MUTED });
});
s.addNotes(`Voici comment nous répondons à un pic de trafic.

Les serveurs ne stockent aucune donnée : les commandes sont dans la base, les images et les sessions sur le disque partagé. Ajouter de la capacité revient donc à modifier une variable.

Deux commandes. La première, Terraform, crée les serveurs, les répartit sur les zones et les enregistre auprès du load balancer. La deuxième, Ansible, les configure. Comme le playbook est idempotent, il ne touche pas aux serveurs déjà en service. L'opération prend environ trois minutes, sans interruption.

Pour savoir quand le faire, trois alarmes CloudWatch sont créées avec le load balancer. La première surveille le temps de réponse : au-delà de deux secondes en moyenne sur trois minutes, les serveurs saturent. La deuxième compte les serveurs retirés de la rotation. La troisième compte les erreurs serveur. Les trois notifient une adresse mail.`);

// ===========================================================================
// 8 - pannes
// ===========================================================================
s = pres.addSlide();
titleSlide(s, "07 — PANNES", "Comportement mesuré en cas de panne");
const fr = [
  [{ text: "PANNE", options: { bold: true } }, { text: "CONSÉQUENCE POUR LE CLIENT", options: { bold: true } }, { text: "DURÉE", options: { bold: true } }, { text: "ACTION", options: { bold: true } }],
  ["Un serveur", "Aucune. Retiré de la rotation après 2 vérifications échouées, les requêtes en cours ont 30 s pour finir.", "~30 s", "aucune"],
  ["Une zone de disponibilité", "Aucune. Les serveurs des autres zones prennent le relais.", "quelques secondes", "aucune"],
  ["La base de données", "Erreurs pendant le basculement, puis retour à la normale sur l'instance de secours.", "60 à 120 s", "aucune (prod)"],
  ["Le bastion", "Aucune. Il ne sert qu'à l'administration.", "~2 min", "le recréer"],
];
s.addTable(fr, {
  x: MX, y: 1.75, w: CW, colW: [2.6, 5.99, 1.9, 1.6],
  fontFace: B, fontSize: 12.5, color: TEXT, valign: "top",
  border: { type: "solid", pt: 0.5, color: LINE }, fill: { color: PAPER }, rowH: 0.78,
});
s.addShape(pres.ShapeType.roundRect, { x: MX, y: 5.35, w: CW, h: 0.9, fill: { color: "FDF4E6" }, line: { color: AMBER, width: 0.75 }, rectRadius: 0.05 });
s.addText("Le panier du client est conservé : les sessions PHP sont sur le disque partagé, pas sur le serveur en panne.", {
  x: MX + 0.28, y: 5.52, w: CW - 0.56, h: 0.6, isTextBox: true, margin: 0, fontFace: B, fontSize: 14, bold: true, color: TEXT,
});
s.addNotes(`Troisième question : le comportement en cas de panne. Nous avons mesuré chaque cas.

Un serveur tombe. Le load balancer le vérifie toutes les quinze secondes. Après deux échecs, soit environ trente secondes, il le retire de la rotation. Les requêtes déjà en cours ont trente secondes supplémentaires pour se terminer. Le client ne voit rien : il est servi par les autres serveurs.

Une zone de disponibilité tombe. Le load balancer a un nœud par zone, il cesse d'utiliser celui de la zone en panne. Les serveurs des autres zones prennent le relais. Aucune action de notre part.

La base de données tombe. En production, elle a une instance de secours dans une autre zone. Le basculement prend entre une et deux minutes. Il y a des erreurs pendant ce temps, nous ne le cachons pas, puis le service revient.

Le bastion tombe. Aucune conséquence pour les clients : il ne sert qu'à l'administration. Il faut le recréer, ce qui prend deux minutes.

Un point important : le panier du client est conservé. Les sessions PHP sont stockées sur le disque partagé, pas sur le serveur. Si un serveur tombe, le client continue son achat sur un autre.`);

// ===========================================================================
// 9 - problemes rencontres
// ===========================================================================
s = pres.addSlide();
titleSlide(s, "08 — PROBLÈMES RENCONTRÉS", "Quatre erreurs apparues au déploiement réel");
const bugs = [
  ["Caractère refusé par AWS", "AWS n'accepte qu'un jeu de caractères limité dans les descriptions de groupes de sécurité. Le caractère « > » que nous avions utilisé faisait échouer la création."],
  ["Paquet awscli inexistant", "Le paquet a été retiré des dépôts d'Ubuntu 24.04. Nous l'avons remplacé par la bibliothèque Python boto3, déjà disponible dans les dépôts de base."],
  ["Mot de passe interprété", "Le script chargeait le fichier d'environnement avec « source ». Le mot de passe généré contenait un « & », que le shell a interprété comme une commande."],
  ["Cache incompatible avec NFS", "Sur un disque réseau, supprimer un fichier ouvert laisse une trace. Le vidage de cache de PrestaShop échouait. Le cache est passé sur le disque local."],
];
bugs.forEach((b, i) => {
  const x = MX + (i % 2) * 6.15;
  const y = 1.78 + Math.floor(i / 2) * 2.1;
  card(s, { x, y, w: 5.9, h: 1.9 });
  bullet(s, x + 0.28, y + 0.26, String(i + 1), TEAL);
  s.addText(b[0], { x: x + 0.78, y: y + 0.24, w: 4.9, h: 0.38, isTextBox: true, margin: 0, fontFace: H, fontSize: 15, bold: true, color: TEXT });
  s.addText(b[1], { x: x + 0.28, y: y + 0.78, w: 5.35, h: 1.0, isTextBox: true, margin: 0, fontFace: B, fontSize: 12, color: MUTED });
});
keyLine(s, "Les quatre corrections sont dans le dépôt. Un déploiement depuis zéro ne les rencontre plus.", 6.15);
s.addNotes(`Nous présentons cette diapositive parce qu'elle montre ce que le déploiement réel apporte.

Le code était écrit, relu et vérifié. En le déployant sur un compte AWS, nous avons rencontré quatre erreurs qu'une relecture n'aurait pas montrées.

Première erreur : AWS n'accepte qu'un jeu de caractères limité dans les descriptions de groupes de sécurité. Nous avions écrit une flèche avec un chevron. La création du groupe a échoué.

Deuxième erreur : le paquet awscli n'existe plus dans les dépôts d'Ubuntu 24.04. Installer la version officielle représentait soixante mégaoctets par serveur pour un seul appel. Nous l'avons remplacé par la bibliothèque Python boto3, déjà disponible.

Troisième erreur : notre script chargeait le fichier de configuration avec la commande source du shell. Le mot de passe de la base, généré aléatoirement, contenait une esperluette. Le shell l'a interprétée comme un séparateur de commande. Nous lisons maintenant ce fichier sans l'interpréter, et nous avons restreint les caractères du mot de passe généré.

Quatrième erreur : sur un disque réseau, supprimer un fichier encore ouvert laisse une entrée temporaire. Le vidage de cache de PrestaShop échouait donc après l'installation, et arrêtait le conteneur. Nous avons déplacé ce cache sur le disque local de chaque serveur, puisqu'il est propre à chaque serveur et régénérable.

Les quatre corrections sont dans le dépôt.`);

// ===========================================================================
// 10 - limites
// ===========================================================================
s = pres.addSlide();
titleSlide(s, "09 — LIMITES", "Limites de la solution");
const lims = [
  ["La montée en charge n'est pas automatique", "Elle demande un opérateur et deux commandes, environ 3 minutes. Pour l'automatiser, il faudrait construire une image serveur préconfigurée avec Packer et utiliser un groupe d'autoscaling."],
  ["Le site entier est sur le disque partagé", "Cela rend les serveurs interchangeables, mais un disque réseau est plus lent qu'un disque local. Au-delà de quelques milliers de requêtes par minute, il faudrait mettre le code dans l'image et ne partager que les images produits."],
  ["Une seule base en écriture", "Les lectures peuvent être réparties sur des réplicas, pas les écritures. Une billetterie écrit beaucoup : la taille de l'instance principale est la limite."],
  ["Une seule région", "Une panne régionale interrompt le service. Le multi-région coûterait plus que la panne qu'il évite à cette échelle."],
];
lims.forEach((l, i) => {
  const x = MX + (i % 2) * 6.15;
  const y = 1.72 + Math.floor(i / 2) * 2.2;
  card(s, { x, y, w: 5.9, h: 2.0 });
  s.addText(l[0], { x: x + 0.28, y: y + 0.18, w: 5.35, h: 0.62, isTextBox: true, margin: 0, fontFace: H, fontSize: 14, bold: true, color: TEXT });
  s.addText(l[1], { x: x + 0.28, y: y + 0.82, w: 5.35, h: 1.05, isTextBox: true, margin: 0, fontFace: B, fontSize: 11.5, color: MUTED });
});
s.addNotes(`Voici les limites de notre solution.

Première limite, la principale : la montée en charge n'est pas automatique. Elle demande un opérateur et deux commandes, environ trois minutes. Pour l'automatiser, il faudrait construire à l'avance une image serveur préconfigurée, avec Packer, puis utiliser un groupe d'autoscaling derrière le même load balancer. Notre rôle Ansible et notre page de santé sont déjà compatibles avec cette évolution.

Deuxième limite : le site entier est sur le disque partagé. Cela rend les serveurs interchangeables, mais un disque réseau est plus lent qu'un disque local pour lire des fichiers PHP. Au-delà de quelques milliers de requêtes par minute, il faudrait mettre le code dans l'image Docker et ne partager que les images produits.

Troisième limite : une seule base en écriture. On peut répartir les lectures sur des réplicas, pas les écritures. Une billetterie écrit beaucoup, donc la taille de l'instance principale est notre plafond.

Quatrième limite : une seule région. Une panne régionale interrompt le service. À cette échelle, le multi-région coûterait plus cher que la panne qu'il évite. C'est un choix, pas un oubli.`);

// ===========================================================================
// 11 - demo
// ===========================================================================
s = pres.addSlide();
titleSlide(s, "10 — DÉMONSTRATION", "Déploiement complet en six commandes");
code(s, [
  "./scripts/bootstrap-backend.sh dev     # une fois par compte AWS",
  "",
  "terraform -chdir=terraform init",
  "terraform -chdir=terraform apply       # ~12 min (création RDS)",
  "",
  "ansible-galaxy install -r ansible/requirements.yml",
  "ansible-inventory -i ansible/inventory.yml --graph",
  "ansible-playbook  -i ansible/inventory.yml ansible/site.yml --ask-vault-pass",
], { x: MX, y: 1.75, w: 7.3, h: 2.9, size: 11.5, dark: true });

const steps = [
  "La boutique et le back-office",
  "Playbook relancé : changed=0",
  "Ajout d'un serveur",
  "Arrêt d'un serveur : le site répond",
];
steps.forEach((t, i) => {
  const y = 1.85 + i * 0.78;
  bullet(s, 8.2, y, String(i + 1));
  s.addText(t, { x: 8.72, y: y - 0.02, w: 4.1, h: 0.45, isTextBox: true, margin: 0, fontFace: B, fontSize: 13.5, color: TEXT, valign: "middle" });
});
s.addShape(pres.ShapeType.roundRect, { x: MX, y: 4.95, w: 7.3, h: 0.85, fill: { color: WASH }, line: { color: LINE, width: 0.75 }, rectRadius: 0.05 });
s.addText("Réseau, base, stockage, surveillance et secrets sont créés par ces commandes.", {
  x: MX + 0.25, y: 5.15, w: 6.8, h: 0.5, isTextBox: true, margin: 0, fontFace: B, fontSize: 12.5, color: MUTED,
});
s.addNotes(`Voici l'ensemble des commandes nécessaires.

La première ne se lance qu'une fois par compte AWS : elle crée le bucket S3 qui stocke l'état Terraform.

Ensuite, Terraform : init puis apply. L'opération prend une douzaine de minutes, dont la majorité pour la création de la base de données.

Puis Ansible : on installe les dépendances depuis Galaxy, on vérifie l'inventaire, et on lance le playbook. La commande du milieu affiche la liste des serveurs : aucune adresse n'y est écrite, elle vient de l'état Terraform.

Nous allons vous montrer quatre choses : la boutique et son back-office, le playbook relancé qui n'affiche aucune modification, l'ajout d'un serveur, et enfin l'arrêt d'un serveur pour montrer que le site continue de répondre.`);

// ===========================================================================
// 12 - fin
// ===========================================================================
s = pres.addSlide();
s.background = { color: INK };
s.addShape(pres.ShapeType.ellipse, { x: MX, y: 1.72, w: 0.16, h: 0.16, fill: { color: AMBER }, line: { color: AMBER } });
s.addText("CONCLUSION", {
  x: MX + 0.3, y: 1.65, w: CW, h: 0.3, isTextBox: true, margin: 0, fontFace: M, fontSize: 12, color: AMBER, charSpacing: 2,
});
s.addText("Déployée, documentée,\nreproductible.", {
  x: MX, y: 2.15, w: 11.0, h: 1.7, isTextBox: true, margin: 0,
  fontFace: H, fontSize: 42, bold: true, color: PAPER, lineSpacing: 46,
});
const finals = [
  ["Terraform", "6 modules · 3 environnements · état distant"],
  ["Ansible", "3 rôles · Galaxy · Vault · changed=0"],
  ["README", "déployer, exploiter, dépanner"],
];
finals.forEach((f, i) => {
  const x = MX + i * 4.12;
  s.addShape(pres.ShapeType.roundRect, { x, y: 4.2, w: 3.85, h: 1.1, fill: { color: INK_SOFT }, line: { color: "35475A", width: 0.75 }, rectRadius: 0.06 });
  s.addText(f[0], { x: x + 0.25, y: 4.35, w: 3.4, h: 0.3, isTextBox: true, margin: 0, fontFace: M, fontSize: 13, bold: true, color: AMBER });
  s.addText(f[1], { x: x + 0.25, y: 4.68, w: 3.4, h: 0.5, isTextBox: true, margin: 0, fontFace: B, fontSize: 11.5, color: "A8B8C8" });
});
s.addText("Merci de votre attention. Nous répondons à vos questions.", {
  x: MX, y: 5.75, w: CW, h: 0.4, isTextBox: true, margin: 0, fontFace: H, fontSize: 17, bold: true, color: PAPER,
});
s.addNotes(`Pour conclure. La boutique est déployée sur un compte AWS réel. Elle est documentée : le README explique comment la déployer, l'exploiter, la mettre à l'échelle, la dépanner et la supprimer. Et elle est reproductible : nous l'avons détruite et redéployée pour le vérifier.

Merci de votre attention, nous répondons à vos questions.

[Réponses préparées :

— Pourquoi pas d'autoscaling ? Parce que nos serveurs sont configurés par Ansible après leur création. Un groupe d'autoscaling lancerait des machines non configurées. Il faudrait d'abord construire une image préconfigurée avec Packer.

— Pourquoi EFS et pas S3 ? Parce que PrestaShop écrit sur un système de fichiers. Utiliser S3 demanderait un module PrestaShop supplémentaire.

— Où est le mot de passe de la base ? Dans AWS Secrets Manager. Terraform le génère, chaque serveur le lit avec son rôle IAM. Il n'est ni dans le dépôt, ni dans l'inventaire Ansible.

— Combien ça coûte ? Environ deux à trois dollars par jour pour l'environnement dev. Les postes principaux sont la passerelle NAT et le load balancer.

— Comment changer de version de PrestaShop ? C'est une variable dans les group_vars Ansible. On modifie le tag de l'image et on relance le playbook, après une sauvegarde de la base.]`);

pres.writeFile({ fileName: process.argv[2] || "soutenance.pptx" }).then((f) => console.log("écrit :", f));
