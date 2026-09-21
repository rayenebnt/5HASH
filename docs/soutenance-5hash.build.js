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
pres.title = "Taylor Shift - La boutique de billets";

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

// une phrase simple, en amber, qui donne l'image a retenir
function keyLine(slide, text, y) {
  slide.addText(text, {
    x: MX, y, w: CW, h: 0.4, isTextBox: true, margin: 0,
    fontFace: B, fontSize: 15, italic: true, color: AMBER_DK,
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
s.addText("Une boutique de billets qui tient debout\nle jour de l'ouverture des ventes", {
  x: MX, y: 3.25, w: 9.6, h: 0.9, isTextBox: true, margin: 0,
  fontFace: B, fontSize: 21, color: "A8B8C8", lineSpacing: 28,
});
const chips = ["Terraform", "Ansible", "PrestaShop", "AWS"];
chips.forEach((c, i) => {
  const x = MX + i * 2.0;
  s.addShape(pres.ShapeType.roundRect, {
    x, y: 4.5, w: 1.8, h: 0.45, fill: { color: INK_SOFT }, line: { color: "35475A", width: 0.75 }, rectRadius: 0.08,
  });
  s.addText(c, { x, y: 4.5, w: 1.8, h: 0.45, isTextBox: true, margin: 0, fontFace: M, fontSize: 12, color: "C9D6E2", align: "center", valign: "middle" });
});
s.addText("Prénom 1  ·  Prénom 2  ·  Prénom 3", {
  x: MX, y: 5.5, w: CW, h: 0.35, isTextBox: true, margin: 0, fontFace: B, fontSize: 16, color: PAPER,
});
s.addText("En ligne sur un vrai compte AWS, région Paris", {
  x: MX, y: 5.9, w: CW, h: 0.3, isTextBox: true, margin: 0, fontFace: B, fontSize: 13, color: "7A8C9E",
});
s.addNotes(`Bonjour à tous. On est l'agence 5HASH, et Taylor Shift nous a confié sa boutique de billets.

Le site, il existe déjà : c'est PrestaShop. Nous, on ne touche pas au site. Notre travail, c'est de lui construire une maison — et surtout une maison qui tient debout le jour où des milliers de fans se connectent en même temps.

Tout est écrit en code : Terraform pour construire, Ansible pour installer. Et ce n'est pas une maquette : ça tourne en ce moment sur un vrai compte AWS. On vous le montrera à la fin.`);

// ===========================================================================
// 2 - trois questions
// ===========================================================================
s = pres.addSlide();
titleSlide(s, "01 — LE BESOIN", "On s'est posé trois questions simples");
const qs = [
  ["1", "Comment un client arrive\njusqu'à la boutique ?", "Une seule porte ouverte sur Internet. Tout le reste est caché derrière."],
  ["2", "Et si dix fois plus\nde monde arrive ?", "Nos serveurs ne gardent rien. Donc en ajouter, c'est changer un chiffre."],
  ["3", "Et si une machine\ntombe en panne ?", "On l'a mesuré : le client ne voit rien, et son panier est conservé."],
];
qs.forEach((q, i) => {
  const x = MX + i * 4.12;
  card(s, { x, y: 1.85, w: 3.85, h: 3.0 });
  bullet(s, x + 0.3, 2.15, q[0]);
  s.addText(q[1], { x: x + 0.3, y: 2.68, w: 3.25, h: 0.95, isTextBox: true, margin: 0, fontFace: H, fontSize: 16, bold: true, color: TEXT, lineSpacing: 22 });
  s.addText(q[2], { x: x + 0.3, y: 3.72, w: 3.25, h: 0.95, isTextBox: true, margin: 0, fontFace: B, fontSize: 13.5, color: MUTED });
});
keyLine(s, "Chaque choix qu'on va vous présenter répond à l'une de ces trois questions.", 5.25);
s.addNotes(`Avant de choisir la moindre technologie, on s'est posé trois questions toutes bêtes.

Un : comment un client arrive jusqu'à la boutique ? Autrement dit, par où ça rentre, et qu'est-ce qu'on laisse ouvert.

Deux : et si dix fois plus de monde arrive d'un coup ? Parce qu'une ouverture de billetterie, ce n'est pas un trafic régulier. C'est un mur.

Trois : et si une machine tombe ? Parce qu'une machine finit toujours par tomber.

Tout ce qu'on va vous montrer répond à l'une de ces trois questions.`);

// ===========================================================================
// 3 - architecture
// ===========================================================================
s = pres.addSlide();
titleSlide(s, "02 — L'ARCHITECTURE", "Une entrée, des caisses, un coffre");

const dTop = 1.72, dLeft = 1.55, dW = 11.1;
const bands = [
  ["CÔTÉ RUE\n(public)", dTop + 0.42, 1.15],
  ["LES CAISSES\n(privé)", dTop + 1.95, 1.15],
  ["LES RÉSERVES\n(privé)", dTop + 3.45, 1.3],
];
bands.forEach(([label, y, h]) => {
  s.addShape(pres.ShapeType.roundRect, { x: dLeft, y, w: dW, h, fill: { color: WASH }, line: { color: LINE, width: 0.75 }, rectRadius: 0.03 });
  s.addText(label, { x: MX - 0.05, y: y + h / 2 - 0.3, w: 0.95, h: 0.6, isTextBox: true, margin: 0, fontFace: M, fontSize: 8.5, color: MUTED, align: "right", valign: "middle" });
});
s.addText("LES CLIENTS", { x: dLeft + 0.3, y: dTop - 0.02, w: 2.0, h: 0.3, isTextBox: true, margin: 0, fontFace: M, fontSize: 10, color: MUTED });
s.addShape(pres.ShapeType.line, { x: dLeft + 0.75, y: dTop + 0.26, w: 0, h: 0.16, line: { color: AMBER, width: 1.5 } });
s.addText("le site", { x: dLeft + 0.95, y: dTop + 0.18, w: 1.2, h: 0.25, isTextBox: true, margin: 0, fontFace: M, fontSize: 8.5, color: AMBER_DK });
s.addShape(pres.ShapeType.line, { x: dLeft + 8.6, y: dTop + 0.26, w: 0, h: 0.16, line: { color: MUTED, width: 1.25, dashType: "dash" } });
s.addText("nous, pour installer", { x: dLeft + 8.8, y: dTop + 0.18, w: 2.4, h: 0.25, isTextBox: true, margin: 0, fontFace: M, fontSize: 8.5, color: MUTED });

card(s, { x: dLeft + 0.28, y: dTop + 0.58, w: 5.1, h: 0.82, fill: PAPER, line: AMBER });
s.addText("Le répartiteur  (load balancer)", { x: dLeft + 0.45, y: dTop + 0.68, w: 4.8, h: 0.3, isTextBox: true, margin: 0, fontFace: H, fontSize: 13, bold: true, color: TEXT });
s.addText("il envoie chaque visiteur vers une caisse qui va bien", { x: dLeft + 0.45, y: dTop + 1.0, w: 4.8, h: 0.3, isTextBox: true, margin: 0, fontFace: B, fontSize: 11, color: MUTED });

card(s, { x: dLeft + 7.6, y: dTop + 0.58, w: 3.2, h: 0.82, fill: PAPER, line: "B4C0CC" });
s.addText("L'entrée de service", { x: dLeft + 7.78, y: dTop + 0.68, w: 2.9, h: 0.3, isTextBox: true, margin: 0, fontFace: H, fontSize: 13, bold: true, color: TEXT });
s.addText("réservée à l'équipe, jamais aux clients", { x: dLeft + 7.78, y: dTop + 1.0, w: 2.9, h: 0.3, isTextBox: true, margin: 0, fontFace: B, fontSize: 11, color: MUTED });

s.addShape(pres.ShapeType.line, { x: dLeft + 2.4, y: dTop + 1.42, w: 0, h: 0.5, line: { color: AMBER, width: 1.75, endArrowType: "triangle" } });
s.addShape(pres.ShapeType.line, { x: dLeft + 9.2, y: dTop + 1.42, w: 0, h: 0.5, line: { color: MUTED, width: 1.25, dashType: "dash", endArrowType: "triangle" } });

card(s, { x: dLeft + 0.28, y: dTop + 2.12, w: 10.5, h: 0.82, fill: PAPER, line: "B4C0CC" });
s.addText("Les caisses : des serveurs qui font tourner PrestaShop", { x: dLeft + 0.45, y: dTop + 2.2, w: 10.1, h: 0.3, isTextBox: true, margin: 0, fontFace: H, fontSize: 13, bold: true, color: TEXT });
s.addText("toutes identiques, interchangeables — et aucune n'est joignable depuis Internet", { x: dLeft + 0.45, y: dTop + 2.52, w: 10.1, h: 0.3, isTextBox: true, margin: 0, fontFace: B, fontSize: 11, color: MUTED });

s.addShape(pres.ShapeType.line, { x: dLeft + 2.4, y: dTop + 2.96, w: 0, h: 0.46, line: { color: TEAL, width: 1.75, endArrowType: "triangle" } });
s.addShape(pres.ShapeType.line, { x: dLeft + 8.2, y: dTop + 2.96, w: 0, h: 0.46, line: { color: TEAL, width: 1.75, endArrowType: "triangle" } });

card(s, { x: dLeft + 0.28, y: dTop + 3.62, w: 5.1, h: 0.96, fill: PAPER, line: TEAL });
s.addText("Le coffre : la base de données", { x: dLeft + 0.45, y: dTop + 3.72, w: 4.8, h: 0.3, isTextBox: true, margin: 0, fontFace: H, fontSize: 13, bold: true, color: TEXT });
s.addText("les billets, les paniers, les commandes", { x: dLeft + 0.45, y: dTop + 4.06, w: 4.8, h: 0.35, isTextBox: true, margin: 0, fontFace: B, fontSize: 11, color: MUTED });

card(s, { x: dLeft + 5.7, y: dTop + 3.62, w: 5.1, h: 0.96, fill: PAPER, line: TEAL });
s.addText("Le vestiaire : un disque partagé", { x: dLeft + 5.88, y: dTop + 3.72, w: 4.8, h: 0.3, isTextBox: true, margin: 0, fontFace: H, fontSize: 13, bold: true, color: TEXT });
s.addText("les images, le thème, et les paniers en cours", { x: dLeft + 5.88, y: dTop + 4.06, w: 4.8, h: 0.35, isTextBox: true, margin: 0, fontFace: B, fontSize: 11, color: MUTED });

keyLine(s, "Les caisses ne gardent rien : tout est dans le coffre et le vestiaire. C'est ce qui rend tout le reste possible.", 6.6);
s.addNotes(`Pour expliquer l'architecture, on va prendre l'image d'une salle de concert. Ça se lit de haut en bas, comme le trajet d'un client.

En haut, côté rue, il y a UNE seule porte : le répartiteur. C'est l'hôte d'accueil. Il envoie chaque visiteur vers une caisse libre, et il vérifie toutes les quinze secondes que chaque caisse va bien. Si une caisse ne répond plus, il arrête d'y envoyer du monde.

À côté, l'entrée de service. Elle, elle est réservée à l'équipe : c'est par là qu'on passe pour installer et dépanner. Elle est ouverte à une seule adresse, la nôtre. Aucun client ne passe par là.

Au milieu, les caisses : ce sont les serveurs qui font tourner la boutique. Elles sont toutes identiques. Et surtout, elles ne sont pas joignables depuis Internet — on ne peut y arriver qu'en passant par la porte d'accueil.

En bas, les réserves. Le coffre, c'est la base de données : les billets, les paniers, les commandes. Le vestiaire, c'est un disque partagé : les images du site, le thème, et les paniers en cours.

Et voilà le point important : les caisses ne gardent rien. Tout est dans le coffre et dans le vestiaire. C'est exactement ce qui va nous permettre d'en ajouter ou d'en perdre sans que personne ne s'en aperçoive.`);

// ===========================================================================
// 4 - qui fait quoi
// ===========================================================================
s = pres.addSlide();
titleSlide(s, "03 — NOS CHOIX", "Ce qu'on gère, ce qu'on laisse à AWS");
s.addText("La règle qu'on s'est donnée : on garde la main sur ce qui est propre à la boutique, et on laisse à AWS ce que personne n'a envie de réparer un soir d'ouverture.", {
  x: MX, y: 1.6, w: 11.8, h: 0.45, isTextBox: true, margin: 0, fontFace: B, fontSize: 14, color: MUTED,
});
const rows = [
  [{ text: "QUOI", options: { bold: true } }, { text: "NOTRE CHOIX", options: { bold: true } }, { text: "POURQUOI", options: { bold: true } }],
  ["La boutique", "Docker sur un serveur EC2", "Le sujet demande l'image PrestaShop sur EC2. Changer de version, c'est une ligne à modifier."],
  ["La base de données", "RDS, le service géré d'AWS", "Sauvegardes, mises à jour, machine de secours : AWS le fait mieux que nous, et sans nous réveiller la nuit."],
  ["Les fichiers", "EFS, un disque partagé", "Plusieurs serveurs doivent voir les mêmes images. Un disque normal ne se partage pas."],
  ["L'entrée", "Un load balancer", "Il surveille les serveurs et répartit les visiteurs tout seul."],
  ["Les mots de passe", "Coffre AWS + Ansible Vault", "Le mot de passe de la base n'est écrit nulle part : chaque serveur va le chercher lui-même."],
  ["Notre accès", "Un serveur d'entrée dédié", "Une seule porte pour l'équipe, ouverte à une seule adresse IP."],
];
s.addTable(rows, {
  x: MX, y: 2.2, w: CW, colW: [2.2, 2.7, 7.19],
  fontFace: B, fontSize: 12.5, color: TEXT, valign: "top",
  border: { type: "solid", pt: 0.5, color: LINE },
  fill: { color: PAPER }, rowH: 0.62,
});
s.addNotes(`Le sujet nous laissait libres : ce qui tourne sur nos serveurs, et ce qu'on confie à AWS. Voilà comment on a tranché.

La boutique tourne dans un conteneur Docker, sur un serveur EC2. C'est ce que demande le sujet, et ça nous arrange : changer de version de PrestaShop, c'est une seule ligne à modifier.

La base de données, par contre, on ne veut pas la gérer. AWS s'occupe des sauvegardes, des mises à jour, et garde une machine de secours prête à prendre le relais. Franchement, personne n'a envie de découvrir un problème de base de données le soir de l'ouverture des ventes.

Pour les fichiers, il nous fallait un disque que plusieurs serveurs voient en même temps. Un disque classique ne se partage pas. EFS, si.

Et les mots de passe : celui de la base n'est écrit nulle part dans notre code. Terraform le génère, le dépose dans le coffre d'AWS, et chaque serveur va le chercher tout seul avec sa propre autorisation. Dans le dépôt, il n'y a que le mot de passe de l'administration du site, et il est chiffré.`);

// ===========================================================================
// 5 - terraform
// ===========================================================================
s = pres.addSlide();
titleSlide(s, "04 — TERRAFORM", "On décrit ce qu'on veut, Terraform le construit");
s.addText("Six briques, une par couche. On les assemble, et la même description donne un petit environnement de test ou une vraie production.", {
  x: MX, y: 1.58, w: 11.8, h: 0.45, isTextBox: true, margin: 0, fontFace: B, fontSize: 14, color: MUTED,
});
const mods = [
  ["network", "le réseau et ses trois niveaux"],
  ["security", "qui a le droit de parler à qui"],
  ["storage", "le disque partagé"],
  ["database", "la base de données"],
  ["compute", "les serveurs"],
  ["loadbalancer", "l'entrée et la surveillance"],
];
mods.forEach((m, i) => {
  const y = 2.2 + i * 0.52;
  s.addShape(pres.ShapeType.rect, { x: MX, y: y + 0.06, w: 0.1, h: 0.28, fill: { color: TEAL }, line: { color: TEAL } });
  s.addText(m[0], { x: MX + 0.22, y, w: 1.8, h: 0.4, isTextBox: true, margin: 0, fontFace: M, fontSize: 12, bold: true, color: TEXT });
  s.addText(m[1], { x: MX + 2.0, y, w: 4.3, h: 0.4, isTextBox: true, margin: 0, fontFace: B, fontSize: 12.5, color: MUTED });
});
const tcards = [
  ["Trois environnements, un seul code", "Test, pré-production, production : on change un mot, pas le code. Le test a 1 serveur, la production en a 3 répartis sur 3 zones."],
  ["Le travail à trois est protégé", "La description de l'infrastructure est stockée sur AWS, verrouillée : deux personnes ne peuvent pas la modifier en même temps."],
  ["Rien n'est écrit en dur", "Terraform va chercher lui-même l'image système, les zones disponibles, et même notre adresse IP — celle qui aura le droit de se connecter."],
];
tcards.forEach((c, i) => {
  const y = 2.2 + i * 1.33;
  card(s, { x: 7.05, y, w: 5.66, h: 1.2 });
  s.addText(c[0], { x: 7.25, y: y + 0.12, w: 5.3, h: 0.3, isTextBox: true, margin: 0, fontFace: H, fontSize: 13, bold: true, color: TEXT });
  s.addText(c[1], { x: 7.25, y: y + 0.44, w: 5.3, h: 0.72, isTextBox: true, margin: 0, fontFace: B, fontSize: 11.5, color: MUTED });
});
s.addNotes(`Terraform, c'est l'outil qui construit. On lui décrit ce qu'on veut, il se débrouille pour le créer.

On a découpé en six briques, une par couche : le réseau, les droits, le disque, la base, les serveurs, et l'entrée. Chaque brique se relit toute seule, et si on veut en changer une, on ne casse pas les autres.

Le truc dont on est contents : les trois environnements. Test, pré-production, production. C'est exactement le même code. On change un mot, et on passe d'un serveur à trois serveurs répartis sur trois zones, avec une base qui a une machine de secours et deux semaines de sauvegardes.

La description de l'infrastructure est stockée sur AWS, pas sur nos ordinateurs, et elle est verrouillée : à trois, on ne peut pas se marcher dessus.

Et rien n'est écrit en dur. Terraform va même chercher notre adresse IP du moment, et c'est la seule qui aura le droit de se connecter aux serveurs.`);

// ===========================================================================
// 6 - ansible
// ===========================================================================
s = pres.addSlide();
titleSlide(s, "05 — ANSIBLE", "Ansible lit les adresses chez Terraform");
s.addText("Terraform connaît déjà les adresses des serveurs. Plutôt que de les recopier à la main, Ansible va les lire chez lui.", {
  x: MX, y: 1.58, w: 11.8, h: 0.4, isTextBox: true, margin: 0, fontFace: B, fontSize: 14, color: MUTED,
});
code(s, [
  "# Terraform écrit la liste des serveurs…",
  'resource "ansible_host" "app" {',
  '  name      = "taylorshift-dev-app-1"',
  '  groups    = ["prestashop"]',
  '  variables = { ansible_host = ..., db_host = ... }',
  "}",
  "",
  "# …et Ansible la relit. C'est tout.",
  "plugin: cloud.terraform.terraform_provider",
], { x: MX, y: 2.12, w: 7.15, h: 2.5, size: 11.5 });

const acards = [
  ["Des rôles qu'on réutilise", "Le serveur d'entrée et les caisses partagent le même rôle de base, avec des réglages différents. Docker vient d'un rôle public, installé depuis Galaxy."],
  ["Les secrets sont chiffrés", "Le mot de passe de l'administration est chiffré dans le dépôt. Celui de la base n'y est même pas."],
  ["On peut le relancer sans risque", "Ansible décrit l'état voulu, pas des étapes. Si tout est déjà en place, il ne touche à rien."],
];
acards.forEach((c, i) => {
  const y = 2.12 + i * 1.5;
  card(s, { x: 8.05, y, w: 4.66, h: 1.35 });
  s.addText(c[0], { x: 8.25, y: y + 0.13, w: 4.3, h: 0.3, isTextBox: true, margin: 0, fontFace: H, fontSize: 13, bold: true, color: TEXT });
  s.addText(c[1], { x: 8.25, y: y + 0.46, w: 4.3, h: 0.85, isTextBox: true, margin: 0, fontFace: B, fontSize: 11, color: MUTED });
});
s.addShape(pres.ShapeType.roundRect, { x: MX, y: 4.85, w: 7.15, h: 1.0, fill: { color: "E8F3EC" }, line: { color: OK, width: 0.75 }, rectRadius: 0.05 });
s.addText("On relance : « changed=0 »", {
  x: MX + 0.25, y: 4.98, w: 6.7, h: 0.35, isTextBox: true, margin: 0, fontFace: H, fontSize: 16, bold: true, color: OK,
});
s.addText("Zéro modification. La machine était déjà dans l'état demandé.", {
  x: MX + 0.25, y: 5.36, w: 6.7, h: 0.35, isTextBox: true, margin: 0, fontFace: B, fontSize: 12.5, color: MUTED,
});
s.addNotes(`Ansible, c'est l'outil qui installe. Une fois que Terraform a construit les machines, Ansible les configure.

Le problème classique, c'est de faire le lien entre les deux : Terraform crée un serveur, et il faut donner son adresse à Ansible. Beaucoup de gens recopient à la main. Nous, non.

Terraform écrit la liste des serveurs dans sa propre description, et Ansible va la lire directement chez lui. Résultat : il n'y a pas une seule adresse IP écrite à la main dans tout le projet. On crée un serveur avec Terraform, il apparaît tout seul dans la liste d'Ansible.

On a écrit trois rôles réutilisables. Le serveur d'entrée et les caisses partagent le même rôle de base, juste avec des réglages différents. Et pour Docker, on a pris un rôle public, installé depuis Ansible Galaxy, plutôt que de le réécrire.

Et le point le plus important, celui du barème : on peut relancer l'installation autant de fois qu'on veut. La deuxième fois, Ansible affiche « changed égale zéro ». Il ne touche à rien, parce que tout est déjà comme demandé. Ce n'est pas de la chance : on a conçu l'installation pour ça.`);

// ===========================================================================
// 7 - affluence
// ===========================================================================
s = pres.addSlide();
titleSlide(s, "06 — LE JOUR DE L'OUVERTURE", "Plus de monde ? On change un chiffre");
s.addText("Aucune commande, aucune image, aucun panier ne vit sur un serveur : tout est dans la base et sur le disque partagé. Du coup, ajouter un serveur ne dérange pas ceux qui travaillent déjà.", {
  x: MX, y: 1.6, w: 11.8, h: 0.5, isTextBox: true, margin: 0, fontFace: B, fontSize: 14, color: MUTED,
});
code(s, [
  "terraform apply -var app_instance_count=6      # on passe de 1 à 6 serveurs",
  "ansible-playbook ... site.yml                  # on les installe",
  "",
  "# environ 3 minutes, sans couper la boutique",
], { x: MX, y: 2.35, w: 12.09, h: 1.35, size: 12.5, dark: true });

const alarms = [
  ["Le site devient lent", "Plus de 2 secondes de réponse pendant 3 minutes : la flotte sature, il faut ajouter des serveurs."],
  ["Un serveur ne répond plus", "Il est sorti tout seul de la rotation. On va voir pourquoi avant qu'il y en ait deux."],
  ["Le site renvoie des erreurs", "Plus de 10 erreurs par minute : la boutique répond, mais mal."],
];
alarms.forEach((a, i) => {
  const x = MX + i * 4.12;
  card(s, { x, y: 4.0, w: 3.85, h: 1.85 });
  s.addText("AWS NOUS PRÉVIENT SI…", { x: x + 0.25, y: 4.15, w: 3.4, h: 0.25, isTextBox: true, margin: 0, fontFace: M, fontSize: 9, color: AMBER_DK, charSpacing: 1 });
  s.addText(a[0], { x: x + 0.25, y: 4.45, w: 3.4, h: 0.35, isTextBox: true, margin: 0, fontFace: H, fontSize: 14, bold: true, color: TEXT });
  s.addText(a[1], { x: x + 0.25, y: 4.88, w: 3.4, h: 0.85, isTextBox: true, margin: 0, fontFace: B, fontSize: 11.5, color: MUTED });
});
s.addNotes(`On arrive à la question qui compte vraiment : le jour où les billets partent en vente.

Nos serveurs ne gardent rien. Une commande va dans la base, une image sur le disque partagé, un panier aussi. Résultat : ajouter de la capacité, c'est littéralement changer un chiffre.

Deux commandes. La première crée les serveurs et les répartit sur les zones. La deuxième les installe — et seulement eux, parce qu'Ansible ne touche pas à ceux qui travaillent déjà. Trois minutes, sans couper la boutique.

Et on ne décide pas au hasard. AWS surveille trois choses pour nous et nous envoie un mail : si le site devient lent, si un serveur ne répond plus, ou si la boutique renvoie des erreurs. C'est ça qui nous dit quand ajouter des machines.`);

// ===========================================================================
// 8 - pannes
// ===========================================================================
s = pres.addSlide();
titleSlide(s, "07 — QUAND ÇA CASSE", "On a chronométré chaque panne");
const fr = [
  [{ text: "CE QUI TOMBE", options: { bold: true } }, { text: "CE QUE VOIT LE CLIENT", options: { bold: true } }, { text: "TEMPS", options: { bold: true } }, { text: "ON INTERVIENT ?", options: { bold: true } }],
  ["Un serveur", "Rien. Il est sorti de la rotation en 30 secondes, et les achats en cours ont le temps de se terminer.", "~30 s", "non"],
  ["Une zone AWS entière", "Rien. Les serveurs des autres zones prennent le relais.", "quelques secondes", "non"],
  ["La base de données", "Quelques secondes d'erreur, puis ça repart sur la machine de secours.", "1 à 2 min", "non (en prod)"],
  ["Notre serveur d'entrée", "Rien du tout : aucun client ne passe par là.", "~2 min", "on le recrée"],
];
s.addTable(fr, {
  x: MX, y: 1.75, w: CW, colW: [2.4, 6.19, 1.9, 1.6],
  fontFace: B, fontSize: 12.5, color: TEXT, valign: "top",
  border: { type: "solid", pt: 0.5, color: LINE }, fill: { color: PAPER }, rowH: 0.78,
});
s.addShape(pres.ShapeType.roundRect, { x: MX, y: 5.35, w: CW, h: 0.95, fill: { color: "FDF4E6" }, line: { color: AMBER, width: 0.75 }, rectRadius: 0.05 });
s.addText("Et surtout : le panier du client est conservé. Les paniers sont sur le disque partagé, pas sur le serveur qui tombe. C'est la différence entre « un serveur est tombé » et « mon panier est vide ».", {
  x: MX + 0.28, y: 5.5, w: CW - 0.56, h: 0.7, isTextBox: true, margin: 0, fontFace: B, fontSize: 13.5, color: TEXT,
});
s.addNotes(`Troisième question : quand ça casse. On a regardé chaque panne possible, et on a chronométré.

Un serveur tombe. Le répartiteur l'interroge toutes les quinze secondes ; au bout de deux échecs, donc trente secondes, il arrête de lui envoyer des clients. Et les achats déjà en cours ont trente secondes de plus pour se terminer. Le client ne voit rien : il est servi par les autres.

Une zone AWS entière tombe — ça arrive, c'est un bâtiment entier. Les serveurs des autres zones prennent le relais. Automatique.

La base tombe. En production, AWS garde une machine de secours dans une autre zone. La bascule prend une à deux minutes. Il y a quelques secondes d'erreurs, on ne va pas vous mentir, puis ça repart.

Notre serveur d'entrée tombe : aucun impact client, aucun client ne passe par là.

Et le point qu'on veut vraiment que vous reteniez : le panier du client est conservé. Les paniers sont sur le disque partagé, pas sur la machine qui tombe. Pour une billetterie, c'est toute la différence.`);

// ===========================================================================
// 9 - les bugs
// ===========================================================================
s = pres.addSlide();
titleSlide(s, "08 — CE QU'ON A APPRIS", "Quatre problèmes vus seulement en vrai");
const bugs = [
  ["Un caractère interdit", "AWS refuse certains caractères dans les descriptions. On avait écrit une flèche « -> ». Création refusée."],
  ["Un outil qui n'existe plus", "Le paquet awscli a disparu d'Ubuntu 24.04. On est passés à une bibliothèque Python : 60 Mo de moins par serveur."],
  ["Un mot de passe exécuté", "Le mot de passe généré contenait un « & ». Le shell a cru que c'était une commande et a essayé de l'exécuter."],
  ["Un cache incompatible", "Sur un disque partagé, PrestaShop n'arrivait pas à vider son cache. On l'a remis sur le disque local du serveur."],
];
bugs.forEach((b, i) => {
  const x = MX + (i % 2) * 6.15;
  const y = 1.78 + Math.floor(i / 2) * 2.1;
  card(s, { x, y, w: 5.9, h: 1.9 });
  bullet(s, x + 0.28, y + 0.26, String(i + 1), TEAL);
  s.addText(b[0], { x: x + 0.78, y: y + 0.24, w: 4.9, h: 0.38, isTextBox: true, margin: 0, fontFace: H, fontSize: 15, bold: true, color: TEXT });
  s.addText(b[1], { x: x + 0.28, y: y + 0.78, w: 5.35, h: 1.0, isTextBox: true, margin: 0, fontFace: B, fontSize: 12.5, color: MUTED });
});
keyLine(s, "Les quatre sont corrigés dans le dépôt : un déploiement depuis zéro ne les rencontre plus.", 6.15);
s.addNotes(`On tenait à vous montrer cette diapo, parce que c'est la partie honnête du projet.

Le code était écrit, relu, vérifié. Et puis on l'a déployé pour de vrai sur AWS, et on s'est pris quatre murs qu'aucune relecture n'aurait montrés.

Le premier : AWS n'accepte que certains caractères dans les descriptions. On avait écrit une petite flèche, avec un chevron. Refusé.

Le deuxième : l'outil en ligne de commande d'AWS n'existe plus dans les dépôts d'Ubuntu 24.04. On aurait pu installer la version officielle — soixante mégaoctets par serveur, pour un seul appel. On est passés à une bibliothèque Python déjà présente.

Le troisième, c'est notre préféré. Le mot de passe de la base est généré au hasard, et il contenait une esperluette, le « et commercial ». Notre script chargeait le fichier avec une commande du shell — et le shell a pris le mot de passe pour une commande, et a essayé de l'exécuter. Maintenant on lit le fichier sans jamais l'interpréter, et on a limité les caractères du mot de passe.

Le quatrième : PrestaShop vide son cache après l'installation. Sur un disque partagé en réseau, supprimer un fichier encore ouvert laisse une trace invisible, donc la suppression échouait — et ça tuait le conteneur juste après une installation réussie. On a compris que ce cache n'avait rien à faire sur le disque partagé : c'est un fichier temporaire, propre à chaque serveur. On l'a remis en local.

Les quatre sont corrigés dans le dépôt. Un déploiement depuis zéro ne les rencontre plus.`);

// ===========================================================================
// 10 - limites
// ===========================================================================
s = pres.addSlide();
titleSlide(s, "09 — CE QU'ON N'A PAS FAIT", "Nos limites, et comment on les franchirait");
const lims = [
  ["Ajouter des serveurs demande quelqu'un", "Ce n'est pas automatique : il faut un opérateur et deux commandes, environ 3 minutes. Pour l'automatiser, il faudrait préparer une image toute faite du serveur. Notre installation est déjà écrite pour ça."],
  ["Tout le site est sur le disque partagé", "C'est pratique — les serveurs sont interchangeables — mais un disque réseau est plus lent qu'un disque local. Au-delà de quelques milliers de visiteurs par minute, il faudrait mettre le site dans l'image et ne partager que les photos."],
  ["Une seule base pour écrire", "On peut ajouter des copies pour la lecture, mais pas pour l'écriture. Et une billetterie, ça écrit beaucoup. C'est la taille de cette base qui est notre vrai plafond."],
  ["Une seule région", "Si toute la région Paris tombe, la boutique tombe. Doubler dans une autre région coûterait plus cher que la panne qu'on évite. C'est un choix, pas un oubli."],
];
lims.forEach((l, i) => {
  const x = MX + (i % 2) * 6.15;
  const y = 1.72 + Math.floor(i / 2) * 2.2;
  card(s, { x, y, w: 5.9, h: 2.0 });
  s.addText(l[0], { x: x + 0.28, y: y + 0.18, w: 5.35, h: 0.62, isTextBox: true, margin: 0, fontFace: H, fontSize: 14, bold: true, color: TEXT });
  s.addText(l[1], { x: x + 0.28, y: y + 0.82, w: 5.35, h: 1.05, isTextBox: true, margin: 0, fontFace: B, fontSize: 11.5, color: MUTED });
});
s.addNotes(`Une infrastructure dont on ne connaît pas les limites, c'est une infrastructure qu'on n'a pas comprise. Voilà les nôtres, en toute transparence.

La première, la plus importante : ajouter des serveurs, ça demande quelqu'un. Ce n'est pas automatique. Un pic soudain, il faut un opérateur et deux commandes — trois minutes. Pour l'automatiser vraiment, il faudrait préparer à l'avance une image toute faite du serveur, avec tout déjà installé. Et bonne nouvelle : notre installation est déjà écrite pour ça, c'est une évolution, pas une réécriture.

La deuxième : on a mis tout le site sur le disque partagé. C'est ce qui rend les serveurs interchangeables, mais un disque réseau est plus lent qu'un disque local. Au-delà de quelques milliers de visiteurs par minute, il faudrait mettre le site dans l'image et ne garder que les photos sur le disque partagé.

La troisième : une seule base pour écrire. On peut ajouter des copies pour la lecture, mais une billetterie, ça écrit surtout.

Et la quatrième : une seule région. Si toute la région Paris tombe, on tombe. Doubler ailleurs coûterait plus cher que la panne qu'on évite. C'est assumé.`);

// ===========================================================================
// 11 - demo
// ===========================================================================
s = pres.addSlide();
titleSlide(s, "10 — DÉMONSTRATION", "D'un compte AWS vide à une boutique en ligne");
code(s, [
  "./scripts/bootstrap-backend.sh dev     # une seule fois par compte",
  "",
  "terraform -chdir=terraform init",
  "terraform -chdir=terraform apply       # ~12 min (la base est lente)",
  "",
  "ansible-galaxy install -r ansible/requirements.yml",
  "ansible-inventory -i ansible/inventory.yml --graph",
  "ansible-playbook  -i ansible/inventory.yml ansible/site.yml --ask-vault-pass",
], { x: MX, y: 1.75, w: 7.3, h: 2.9, size: 11.5, dark: true });

const steps = [
  "La boutique, puis l'administration",
  "On relance l'installation : changed=0",
  "On ajoute un serveur, il entre tout seul",
  "On en coupe un : la boutique tient",
];
steps.forEach((t, i) => {
  const y = 1.85 + i * 0.78;
  bullet(s, 8.2, y, String(i + 1));
  s.addText(t, { x: 8.72, y: y - 0.02, w: 4.1, h: 0.45, isTextBox: true, margin: 0, fontFace: B, fontSize: 13.5, color: TEXT, valign: "middle" });
});
s.addShape(pres.ShapeType.roundRect, { x: MX, y: 4.95, w: 7.3, h: 0.85, fill: { color: WASH }, line: { color: LINE, width: 0.75 }, rectRadius: 0.05 });
s.addText("Tout le reste — réseau, base, disque, surveillance, mots de passe — découle de ces six commandes.", {
  x: MX + 0.25, y: 5.1, w: 6.8, h: 0.6, isTextBox: true, margin: 0, fontFace: B, fontSize: 12.5, color: MUTED,
});
s.addNotes(`Voilà tout ce qu'il y a à taper. Six commandes.

La première, on ne la lance qu'une fois par compte : elle prépare l'endroit où Terraform range sa description de l'infrastructure.

Ensuite Terraform construit. Une douzaine de minutes, et c'est la base de données qui prend tout le temps.

Puis Ansible installe. Regardez bien la commande du milieu : c'est celle qui affiche la liste des serveurs. Aucune adresse n'y est écrite, elle est lue chez Terraform.

On va vous montrer quatre choses : la boutique et son administration ; l'installation relancée qui ne change rien ; un serveur ajouté qui entre tout seul en service ; et enfin on en coupe un, en direct, pour vous montrer que la boutique tient.`);

// ===========================================================================
// 12 - fin
// ===========================================================================
s = pres.addSlide();
s.background = { color: INK };
s.addShape(pres.ShapeType.ellipse, { x: MX, y: 1.72, w: 0.16, h: 0.16, fill: { color: AMBER }, line: { color: AMBER } });
s.addText("MERCI — VOS QUESTIONS", {
  x: MX + 0.3, y: 1.65, w: CW, h: 0.3, isTextBox: true, margin: 0, fontFace: M, fontSize: 12, color: AMBER, charSpacing: 2,
});
s.addText("En ligne, documentée,\net on sait la refaire.", {
  x: MX, y: 2.15, w: 11.0, h: 1.7, isTextBox: true, margin: 0,
  fontFace: H, fontSize: 42, bold: true, color: PAPER, lineSpacing: 46,
});
const finals = [
  ["Terraform", "6 briques · 3 environnements"],
  ["Ansible", "3 rôles · secrets chiffrés · changed=0"],
  ["README", "installer, exploiter, dépanner"],
];
finals.forEach((f, i) => {
  const x = MX + i * 4.12;
  s.addShape(pres.ShapeType.roundRect, { x, y: 4.2, w: 3.85, h: 1.1, fill: { color: INK_SOFT }, line: { color: "35475A", width: 0.75 }, rectRadius: 0.06 });
  s.addText(f[0], { x: x + 0.25, y: 4.35, w: 3.4, h: 0.3, isTextBox: true, margin: 0, fontFace: M, fontSize: 13, bold: true, color: AMBER });
  s.addText(f[1], { x: x + 0.25, y: 4.68, w: 3.4, h: 0.5, isTextBox: true, margin: 0, fontFace: B, fontSize: 11.5, color: "A8B8C8" });
});
s.addText("5HASH  —  merci de votre attention", {
  x: MX, y: 5.75, w: CW, h: 0.4, isTextBox: true, margin: 0, fontFace: H, fontSize: 17, bold: true, color: PAPER,
});
s.addNotes(`Pour conclure. La boutique est en ligne sur un vrai compte AWS. Elle est documentée : le README explique comment l'installer, la faire grandir, la dépanner et la supprimer. Et on sait la refaire : on l'a détruite et redéployée pour en être sûrs.

Merci de votre attention, on est prêts pour vos questions.

[Réponses courtes à avoir en tête :

— Pourquoi pas d'ajout automatique de serveurs ? Parce qu'on installe les serveurs avec Ansible après leur création. Pour automatiser, il faudrait une image toute prête. On a préféré livrer quelque chose qui marche et dont on connaît la limite.

— Pourquoi EFS et pas S3 ? Parce que PrestaShop écrit sur un disque, tout simplement. S3 demanderait un module en plus.

— Où est le mot de passe de la base ? Nulle part chez nous. AWS le garde, et chaque serveur va le chercher avec sa propre autorisation.

— Combien ça coûte ? Deux à trois dollars par jour pour l'environnement de test.

— Comment vous changez de version de PrestaShop ? Une ligne dans un fichier Ansible, on relance, et on prend une sauvegarde de la base avant.]`);

pres.writeFile({ fileName: process.argv[2] || "soutenance.pptx" }).then((f) => console.log("écrit :", f));
