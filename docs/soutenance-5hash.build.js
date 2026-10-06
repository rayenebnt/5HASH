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
s.background = { color: PAPER };
s.addShape(pres.ShapeType.ellipse, { x: MX, y: 1.5, w: 0.16, h: 0.16, fill: { color: AMBER }, line: { color: AMBER } });
s.addText("PROJET 5HASH  ·  INFRASTRUCTURE AS CODE", {
  x: MX + 0.3, y: 1.43, w: CW, h: 0.3, isTextBox: true, margin: 0,
  fontFace: M, fontSize: 12, color: AMBER_DK, charSpacing: 2,
});
s.addText("Taylor Shift", {
  x: MX, y: 1.95, w: CW, h: 1.1, isTextBox: true, margin: 0,
  fontFace: H, fontSize: 56, bold: true, color: TEXT,
});
s.addText("Infrastructure de la boutique de billets", {
  x: MX, y: 3.08, w: 9.6, h: 0.5, isTextBox: true, margin: 0,
  fontFace: B, fontSize: 21, color: MUTED,
});
const chips = ["Terraform", "Ansible", "PrestaShop", "AWS"];
chips.forEach((c, i) => {
  const x = MX + i * 2.0;
  s.addShape(pres.ShapeType.roundRect, {
    x, y: 3.9, w: 1.8, h: 0.45, fill: { color: WASH }, line: { color: LINE, width: 0.75 }, rectRadius: 0.08,
  });
  s.addText(c, { x, y: 3.9, w: 1.8, h: 0.45, isTextBox: true, margin: 0, fontFace: M, fontSize: 12, color: TEXT, align: "center", valign: "middle" });
});
s.addText("Prénom 1  ·  Prénom 2  ·  Prénom 3", {
  x: MX, y: 4.85, w: CW, h: 0.35, isTextBox: true, margin: 0, fontFace: B, fontSize: 16, color: TEXT,
});
s.addText("Déployé sur un compte AWS, région eu-west-3 (Paris)", {
  x: MX, y: 5.25, w: CW, h: 0.3, isTextBox: true, margin: 0, fontFace: B, fontSize: 13, color: MUTED,
});
s.addShape(pres.ShapeType.roundRect, { x: MX, y: 5.9, w: 7.6, h: 0.62, fill: { color: WASH }, line: { color: LINE, width: 0.75 }, rectRadius: 0.06 });
s.addText("4 diapositives  ·  5 min      Démonstration  ·  7 min      Questions", {
  x: MX + 0.28, y: 5.9, w: 7.1, h: 0.62, isTextBox: true, margin: 0, fontFace: M, fontSize: 12.5, color: TEXT, valign: "middle",
});
s.addNotes(`Bonjour. Nous sommes l'agence 5HASH. Taylor Shift nous a confié l'infrastructure de sa boutique de billets.

L'application existe déjà : c'est PrestaShop, l'image publiée sur Docker Hub. Nous ne touchons pas au code du site. Notre travail, c'est de l'héberger, de le configurer, et de faire en sorte qu'il tienne le jour de l'ouverture des ventes.

Deux outils : Terraform crée l'infrastructure, Ansible configure les serveurs. Tout est déployé sur un compte AWS réel, en région Paris.

Nous avons fait court sur les diapositives : quatre écrans, cinq minutes. L'essentiel est dans la démonstration, parce que c'est elle qui prouve que la solution fonctionne.`);

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
// 3 - les deux outils
// ===========================================================================
s = pres.addSlide();
titleSlide(s, "03 — LES DEUX OUTILS", "Terraform crée, Ansible configure");

const cols = [
  {
    x: MX, name: "TERRAFORM", sub: "crée ce qui existe",
    items: [
      ["6 modules", "réseau, sécurité, stockage, base, calcul, load balancer"],
      ["3 environnements", "dev, staging, prod : mêmes modules, dimensionnement différent"],
      ["État distant", "bucket S3 chiffré, versionné, avec verrouillage"],
      ["25 variables décrites", "et 12 sorties, dont l'URL de la boutique"],
    ],
    accent: AMBER, accentDk: AMBER_DK,
  },
  {
    x: MX + 6.15, name: "ANSIBLE", sub: "configure ce qu'il y a dedans",
    items: [
      ["3 rôles à nous", "common, efs, prestashop — plus geerlingguy.docker depuis Galaxy"],
      ["Templates", "chaque fichier de configuration est généré depuis des variables"],
      ["Handlers", "un redémarrage n'a lieu que si un fichier a réellement changé"],
      ["Vault", "les identifiants du back-office sont chiffrés dans le dépôt"],
    ],
    accent: TEAL, accentDk: TEAL,
  },
];

cols.forEach((c) => {
  card(s, { x: c.x, y: 1.68, w: 5.95, h: 3.6, fill: PAPER, line: c.accent });
  s.addText(c.name, { x: c.x + 0.28, y: 1.85, w: 5.4, h: 0.33, isTextBox: true, margin: 0, fontFace: M, fontSize: 13, bold: true, color: c.accentDk, charSpacing: 1 });
  s.addText(c.sub, { x: c.x + 0.28, y: 2.18, w: 5.4, h: 0.32, isTextBox: true, margin: 0, fontFace: H, fontSize: 16, bold: true, color: TEXT });
  c.items.forEach((it, i) => {
    const y = 2.68 + i * 0.63;
    s.addText(it[0], { x: c.x + 0.28, y, w: 5.4, h: 0.26, isTextBox: true, margin: 0, fontFace: B, fontSize: 13, bold: true, color: TEXT });
    s.addText(it[1], { x: c.x + 0.28, y: y + 0.25, w: 5.4, h: 0.3, isTextBox: true, margin: 0, fontFace: B, fontSize: 10.5, color: MUTED });
  });
});

s.addShape(pres.ShapeType.roundRect, { x: MX, y: 5.45, w: CW, h: 1.0, fill: { color: WASH }, line: { color: LINE, width: 0.75 }, rectRadius: 0.05 });
s.addText("LA JONCTION  ·  L'ÉTAT TERRAFORM", { x: MX + 0.3, y: 5.6, w: 5.0, h: 0.28, isTextBox: true, margin: 0, fontFace: M, fontSize: 10.5, color: AMBER_DK, charSpacing: 1 });
s.addText("Terraform écrit dans son état l'adresse de chaque serveur et les coordonnées de la base. L'inventaire Ansible les relit. Il ne contient que deux lignes : le nom du plugin et le chemin du code Terraform.", {
  x: MX + 0.3, y: 5.86, w: 11.8, h: 0.5, isTextBox: true, margin: 0, fontFace: B, fontSize: 12.5, color: TEXT,
});
keyLine(s, "Aucune adresse et aucun secret ne sont recopiés à la main entre les deux outils.", 6.62);
s.addNotes(`Nos deux outils, et la frontière entre eux.

Terraform crée ce qui existe : le réseau, les serveurs, la base, le load balancer. Son code est découpé en six modules, un par couche, chacun avec ses variables et ses sorties. Les trois environnements — dev, staging, production — utilisent les mêmes modules : seul le dimensionnement change. L'état est stocké dans un bucket S3 chiffré et versionné, avec un verrouillage : nous sommes trois, et sans ça deux personnes peuvent modifier l'infrastructure en même temps.

Ansible configure ce qu'il y a dedans : les paquets, Docker, le conteneur PrestaShop, le montage du disque partagé. Trois rôles sont les nôtres, et nous avons pris le rôle Docker sur Ansible Galaxy plutôt que de le réécrire. Chaque fichier de configuration est un template généré depuis des variables, et les redémarrages passent par des handlers : ils n'ont lieu que si un fichier a vraiment changé.

Et voici le point important. Terraform ne se connecte jamais en SSH, Ansible ne crée jamais de ressource AWS. Leur seul point de rencontre, c'est l'état Terraform. Terraform y écrit l'adresse de chaque serveur et les coordonnées de la base ; l'inventaire Ansible les relit. Cet inventaire ne contient que deux lignes utiles. Aucune adresse n'y est écrite à la main — nous vous le montrerons en démonstration.`);

// ===========================================================================
// 4 - justification des choix
// ===========================================================================
s = pres.addSlide();
titleSlide(s, "04 — JUSTIFICATION DES CHOIX", "Chaque choix, et l'option qu'on a écartée");

const rows = [
  [
    { text: "COMPOSANT", options: { bold: true } },
    { text: "NOTRE CHOIX", options: { bold: true } },
    { text: "POURQUOI PAS L'AUTRE OPTION", options: { bold: true } },
  ],
  ["Base de données", "RDS MySQL managé", "MySQL sur l'instance : la base disparaîtrait avec le serveur, et les sauvegardes seraient à écrire nous-mêmes."],
  ["Images et sessions", "EFS, disque partagé", "Un disque EBS ne se partage pas : deux serveurs afficheraient deux catalogues différents."],
  ["Point d'entrée", "Load balancer ALB", "Un DNS à répartition simple n'a pas de contrôle de santé : les clients tomberaient sur un serveur mort."],
  ["Montée en charge", "Nombre de serveurs en variable", "L'auto-scaling ferait naître des machines qu'Ansible n'a pas configurées."],
  ["Mot de passe base", "Secrets Manager + rôle IAM", "Une variable dans le dépôt, même chiffrée, finit dans l'historique Git."],
  ["Accès administration", "Bastion, une seule IP autorisée", "Une adresse publique par serveur, c'est autant de portes d'entrée que de serveurs."],
];
s.addTable(rows, {
  x: MX, y: 1.72, w: CW, colW: [2.25, 3.15, 6.69],
  fontFace: B, fontSize: 12.5, color: TEXT, valign: "top",
  border: { type: "solid", pt: 0.5, color: LINE },
  fill: { color: PAPER }, rowH: 0.58,
});
keyLine(s, "Le fil conducteur : un serveur ne contient rien d'unique, donc on peut en ajouter ou en perdre un.", 6.3);
s.addNotes(`Le sujet nous laissait libres de répartir. Voici nos choix, et à chaque fois l'option qu'on a écartée — parce qu'un choix ne se justifie que par rapport à son alternative.

La base de données est managée, c'est RDS. L'alternative était MySQL sur l'instance EC2 : elle disparaîtrait avec le serveur, et il faudrait écrire nous-mêmes les sauvegardes et le basculement.

Les images et les sessions sont sur EFS, un disque partagé. L'alternative, un disque EBS, ne se partage pas entre instances : un visiteur qui téléverse une image sur le premier serveur ne la verrait pas depuis le second.

Le point d'entrée est un load balancer. L'alternative, une répartition par DNS, n'a aucun contrôle de santé : les clients continueraient d'arriver sur un serveur en panne.

La montée en charge se fait en changeant une variable. L'alternative serait l'auto-scaling, mais nos serveurs sont configurés par Ansible après leur création : une machine qui naît automatiquement à trois heures du matin naîtrait sans configuration. Il faudrait d'abord construire une image préconfigurée. C'est un choix assumé, pas un oubli.

Le mot de passe de la base est dans Secrets Manager, lu par chaque serveur avec son propre rôle IAM. L'alternative serait une variable chiffrée dans le dépôt, mais elle finit dans l'historique Git, et un historique ne s'efface pas.

Et l'accès administration passe par un bastion ouvert à une seule adresse IP, plutôt qu'une adresse publique sur chaque serveur.

Le fil conducteur de tous ces choix est le même : un serveur ne contient rien d'unique. C'est ce qui permet d'en ajouter ou d'en perdre un sans conséquence.`);

// ===========================================================================
// 5 - demonstration
// ===========================================================================
s = pres.addSlide();
titleSlide(s, "05 — DÉMONSTRATION", "Cinq étapes, sept minutes");

s.addText("ÉTAPE", { x: MX + 0.5, y: 1.52, w: 3.2, h: 0.24, isTextBox: true, margin: 0, fontFace: M, fontSize: 9, color: MUTED, charSpacing: 1 });
s.addText("COMMANDE", { x: MX + 4.7, y: 1.52, w: 4.0, h: 0.24, isTextBox: true, margin: 0, fontFace: M, fontSize: 9, color: MUTED, charSpacing: 1 });
s.addText("CE QUE ÇA PROUVE", { x: MX + 8.85, y: 1.52, w: 3.2, h: 0.24, isTextBox: true, margin: 0, fontFace: M, fontSize: 9, color: MUTED, charSpacing: 1 });
s.addShape(pres.ShapeType.line, { x: MX, y: 1.8, w: CW, h: 0, line: { color: LINE, width: 0.75 } });

const demo = [
  ["La boutique répond", "http://…elb.amazonaws.com", "L'application est déployée et accessible."],
  ["Une commande passe", "back-office puis front-office", "La base de données est bien connectée et fonctionnelle."],
  ["Les serveurs viennent de Terraform", "ansible-inventory --graph", "L'inventaire est dynamique : aucune adresse écrite à la main."],
  ["Le playbook est relancé", "ansible-playbook … --ask-vault-pass", "Le déploiement est idempotent : changed=0."],
  ["Un serveur de plus", "app_instance_count = 2 puis plan", "La solution se redéploie et monte en charge."],
];
demo.forEach((d, i) => {
  const y = 1.95 + i * 0.88;
  if (i % 2 === 0) {
    s.addShape(pres.ShapeType.rect, { x: MX, y: y - 0.06, w: CW, h: 0.82, fill: { color: WASH }, line: { color: WASH } });
  }
  bullet(s, MX + 0.02, y + 0.14, String(i + 1), AMBER);
  s.addText(d[0], { x: MX + 0.5, y: y + 0.1, w: 4.05, h: 0.42, isTextBox: true, margin: 0, fontFace: B, fontSize: 13.5, bold: true, color: TEXT, valign: "middle" });
  s.addText(d[1], { x: MX + 4.7, y: y + 0.1, w: 4.0, h: 0.42, isTextBox: true, margin: 0, fontFace: M, fontSize: 10.5, color: AMBER_DK, valign: "middle" });
  s.addText(d[2], { x: MX + 8.85, y: y + 0.08, w: 3.2, h: 0.46, isTextBox: true, margin: 0, fontFace: B, fontSize: 10.5, color: MUTED, valign: "middle" });
});
s.addShape(pres.ShapeType.line, { x: MX, y: 6.33, w: CW, h: 0, line: { color: LINE, width: 0.75 } });
keyLine(s, "L'infrastructure a été créée avant la soutenance : terraform apply prend douze minutes.", 6.5);
s.addNotes(`Nous passons à la démonstration. Cinq étapes, et à chaque fois nous disons ce qu'elle prouve.

Un : la boutique répond. J'ouvre l'adresse du load balancer, vous voyez la boutique en ligne.

Deux : une commande passe. Je me connecte au back-office, je modifie le catalogue, et la modification apparaît côté client. Ça prouve que la base de données est bien connectée et qu'elle fonctionne — une page qui s'affiche ne le prouverait pas.

Trois : les serveurs viennent de Terraform. J'affiche l'inventaire Ansible. Les serveurs qui apparaissent ne sont écrits nulle part : ils sont lus dans l'état Terraform.

Quatre : je relance le playbook complet. Il ne doit rien modifier. Ça prend deux à trois minutes, je commenterai pendant qu'il tourne.

Cinq : j'ajoute un serveur. Je passe la variable à deux et je lance un plan Terraform : il annonce une instance à créer. Je ne l'applique pas, ça prendrait trois minutes de plus.

Une précision : l'infrastructure a été créée avant la soutenance. La création complète prend douze minutes, dont l'essentiel pour la base de données. Nous l'avons détruite et redéployée pour vérifier que c'est reproductible.`);

// ===========================================================================
// 6 - bilan et questions
// ===========================================================================
s = pres.addSlide();
s.background = { color: PAPER };
s.addShape(pres.ShapeType.ellipse, { x: MX, y: 0.95, w: 0.16, h: 0.16, fill: { color: AMBER }, line: { color: AMBER } });
s.addText("BILAN", {
  x: MX + 0.3, y: 0.88, w: CW, h: 0.3, isTextBox: true, margin: 0, fontFace: M, fontSize: 12, color: AMBER_DK, charSpacing: 2,
});
s.addText("Déployée, documentée, reproductible.", {
  x: MX, y: 1.35, w: 11.6, h: 0.75, isTextBox: true, margin: 0,
  fontFace: H, fontSize: 34, bold: true, color: TEXT,
});

const panels = [
  {
    title: "CE QUI EST LIVRÉ", color: OK,
    items: [
      "Terraform : 6 modules, 3 environnements, état distant verrouillé",
      "Ansible : 3 rôles, Galaxy, Vault, templates, handlers",
      "Inventaire dynamique lu dans l'état Terraform",
      "README : déployer, exploiter, dépanner, supprimer",
    ],
  },
  {
    title: "CORRIGÉ AU DÉPLOIEMENT RÉEL", color: AMBER_DK,
    items: [
      "Une description de pare-feu refusée par AWS",
      "Un paquet absent des dépôts d'Ubuntu 24.04",
      "Un mot de passe interprété par le shell",
      "Le cache de PrestaShop incompatible avec NFS",
    ],
  },
  {
    title: "CE QU'ON N'A PAS FAIT", color: MUTED,
    items: [
      "Pas d'auto-scaling : choix assumé, expliqué",
      "HTTPS prêt dans le code, pas activé en dev",
      "Base en une seule zone en dev, répliquée en prod",
      "Pas de chaîne d'intégration continue",
    ],
  },
];
panels.forEach((p, i) => {
  const x = MX + i * 4.12;
  s.addShape(pres.ShapeType.roundRect, { x, y: 2.35, w: 3.85, h: 3.35, fill: { color: PAPER }, line: { color: LINE, width: 0.75 }, rectRadius: 0.06 });
  s.addShape(pres.ShapeType.line, { x: x + 0.25, y: 2.63, w: 0.42, h: 0, line: { color: p.color, width: 2 } });
  s.addText(p.title, { x: x + 0.25, y: 2.75, w: 3.4, h: 0.42, isTextBox: true, margin: 0, fontFace: M, fontSize: 10, bold: true, color: p.color, charSpacing: 0.5 });
  p.items.forEach((it, j) => {
    s.addText("·  " + it, { x: x + 0.25, y: 3.28 + j * 0.58, w: 3.42, h: 0.52, isTextBox: true, margin: 0, fontFace: B, fontSize: 10.5, color: TEXT });
  });
});
s.addText("Merci de votre attention. Nous répondons à vos questions.", {
  x: MX, y: 6.05, w: CW, h: 0.4, isTextBox: true, margin: 0, fontFace: H, fontSize: 18, bold: true, color: TEXT,
});
s.addText("Les trois colonnes ci-dessus sont volontairement affichées pendant les questions : elles indiquent ce que nous savons défendre.", {
  x: MX, y: 6.5, w: CW, h: 0.35, isTextBox: true, margin: 0, fontFace: B, fontSize: 12, color: MUTED,
});
s.addNotes(`Pour conclure.

La boutique est déployée sur un compte AWS réel. Elle est documentée : le README explique comment la déployer, l'exploiter, la mettre à l'échelle, la dépanner et la supprimer. Et elle est reproductible : nous l'avons détruite et redéployée pour le vérifier.

La colonne du milieu, ce sont les quatre erreurs que nous avons rencontrées au déploiement réel et corrigées. Nous les affichons volontairement : c'est la différence entre une infrastructure écrite et une infrastructure qui a tourné.

La colonne de droite, ce sont nos limites. Nous préférons les annoncer que les laisser découvrir.

Merci de votre attention, nous répondons à vos questions.

[Réponses préparées :

— Pourquoi pas d'auto-scaling ? Nos serveurs sont configurés par Ansible après leur création. Un groupe d'auto-scaling lancerait des machines non configurées. Il faudrait d'abord construire une image préconfigurée avec Packer.

— Pourquoi EFS et pas S3 ? PrestaShop écrit sur un système de fichiers. Passer par S3 demanderait un module PrestaShop supplémentaire.

— Où est le mot de passe de la base ? Dans AWS Secrets Manager. Terraform le génère, chaque serveur le lit avec son rôle IAM. Il n'est ni dans le dépôt, ni dans l'inventaire Ansible.

— Il est dans l'état Terraform, alors ? Oui, et c'est pour ça que l'état est dans un bucket S3 chiffré, versionné, accès publics bloqués, et jamais dans Git.

— Comment savez-vous que le playbook est idempotent ? La deuxième exécution affichait deux modifications. La cause était une condition qui testait si la chaîne « changed » était contenue dans la sortie, et « changed » est contenu dans « unchanged ». Corrigé en comparaison exacte, la troisième exécution a donné zéro.

— Combien ça coûte ? Environ deux à trois dollars par jour pour l'environnement dev. Les postes principaux sont la passerelle NAT et le load balancer.

— Comment changer de version de PrestaShop ? C'est une variable dans les group_vars Ansible. On modifie le tag de l'image et on relance le playbook, après une sauvegarde de la base.]`);

pres.writeFile({ fileName: process.argv[2] || "soutenance.pptx" }).then((f) => console.log("écrit :", f));
