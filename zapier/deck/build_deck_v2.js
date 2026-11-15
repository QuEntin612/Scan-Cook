const pptxgen = require("pptxgenjs");
const React = require("react");
const ReactDOMServer = require("react-dom/server");
const sharp = require("sharp");
const Lu = require("react-icons/lu");
const { applyTheme } = require("/root/.claude/skills/synced/901b5bbc-269f-4ced-981a-67e469d66e82_305e6c5d-8470-4200-9650-bc9adc11ad27/pptx/scripts/apply_theme.js");

const IMG = __dirname + "/img/";
const OUT = "/home/user/scan-cook/zapier/deck/FinalChallenge_QuentinBlasco_v2.pptx";

const HEX = {
  green: "2E9E5B", greenDark: "1F7A44", greenLight: "E3F2E8", orange: "F28C28", orangeText: "B85E12",
  ink: "1F2A24", muted: "4A5650", border: "E1E8E3", bg: "F6F8F5", white: "FFFFFF", orangeLight: "FDF0E3",
};
const THEME = {
  name: "Scan and Cook v2",
  headFontFace: "Space Grotesk",
  bodyFontFace: "Inter",
  colors: {
    dk1: HEX.ink, lt1: HEX.white, dk2: HEX.muted, lt2: HEX.bg,
    accent1: HEX.green, accent2: HEX.orange, accent3: HEX.greenDark, accent4: HEX.orangeText,
    accent5: HEX.greenLight, accent6: HEX.border, hlink: HEX.greenDark, folHlink: HEX.greenDark,
  },
};
const H = THEME.headFontFace, B = THEME.bodyFontFace;

async function icon(name, color = "#FFFFFF") {
  const Comp = Lu[name];
  if (!Comp) throw new Error("Icône inconnue : " + name);
  const svg = ReactDOMServer.renderToStaticMarkup(React.createElement(Comp, { color, size: "256", strokeWidth: 2 }));
  return "image/png;base64," + (await sharp(Buffer.from(svg)).png().toBuffer()).toString("base64");
}

(async () => {
  const pres = new pptxgen();
  pres.layout = "LAYOUT_16x9"; // 10 x 5.625 in
  pres.theme = { headFontFace: H, bodyFontFace: B };
  pres.title = "Scan & Cook - Final Challenge";
  pres.author = "Quentin Blasco";
  const C = pres.SchemeColor;

  // ---------- Layouts ----------
  pres.defineSlideMaster({
    title: "BLANC",
    background: { color: C.background1 },
    objects: [
      { text: { text: "Scan & Cook", options: { x: 0.5, y: 5.17, w: 3, h: 0.25, fontFace: B, fontSize: 10, color: C.text2, bold: true, margin: 0 } } },
      { placeholder: { options: { name: "title", type: "title", x: 0.5, y: 0.38, w: 9.0, h: 0.95, fontFace: H, fontSize: 26, bold: true, color: C.text1, valign: "top", align: "left", margin: 0 }, text: "" } },
    ],
    slideNumber: { x: 9.0, y: 5.15, w: 0.5, h: 0.28, fontFace: B, fontSize: 10, color: C.text2, align: "right" },
  });
  pres.defineSlideMaster({ title: "VERT", background: { color: C.accent1 }, objects: [] });

  const T = (s, t, o) => s.addText(t, { isTextBox: true, fontFace: B, color: C.text1, fontSize: 14, margin: 0, valign: "top", ...o });
  const circleIcon = async (s, name, x, y, d, fill = C.accent1, color = "#FFFFFF") => {
    s.addShape(pres.shapes.OVAL, { x, y, w: d, h: d, fill: { color: fill }, line: { type: "none" }, objectName: "icone_fond" });
    s.addImage({ data: await icon(name, color), x: x + d * 0.24, y: y + d * 0.24, w: d * 0.52, h: d * 0.52, altText: name });
  };
  // Capture d'écran dans un cadre de téléphone (ratio 1:2 conservé).
  const phone = (s, file, x, y, h, alt) => {
    const w = h / 2, p = 0.07;
    s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: x - p, y: y - p, w: w + 2 * p, h: h + 2 * p, rectRadius: 0.16, fill: { color: C.text1 }, line: { type: "none" },
      shadow: { type: "outer", color: "1F2A24", opacity: 0.18, blur: 10, offset: 3, angle: 90 }, objectName: "telephone" });
    s.addImage({ path: IMG + file, x, y, w, h, altText: alt });
  };
  const slide = (title, section) => {
    const s = pres.addSlide({ masterName: "BLANC", sectionTitle: section });
    s.addText(title, { placeholder: "title" });
    return s;
  };
  const tableCell = (text, o = {}) => ({ text, options: { fontFace: B, fontSize: 12.5, color: HEX.ink, valign: "middle", margin: [0.05, 0.1, 0.05, 0.1],
    border: [{ type: "none" }, { type: "none" }, { pt: 0.75, color: HEX.border }, { type: "none" }], fill: { color: HEX.white }, ...o } });

  // ================= 1. Titre =================
  pres.addSection({ title: "Introduction" });
  let s = pres.addSlide({ masterName: "VERT", sectionTitle: "Introduction" });
  s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: 0.6, y: 0.6, w: 1.0, h: 1.0, rectRadius: 0.18, fill: { color: C.background1 }, line: { type: "none" }, objectName: "logo_fond" });
  s.addImage({ path: IMG + "logo.png", x: 0.64, y: 0.64, w: 0.92, h: 0.92, altText: "Logo Scan & Cook" });
  T(s, [{ text: "Scan " }, { text: "&", options: { color: C.text1 } }, { text: " Cook" }], { x: 0.6, y: 1.85, w: 5.6, h: 0.95, fontFace: H, fontSize: 50, bold: true, color: C.background1 });
  T(s, "Un bip, une recette.", { x: 0.6, y: 2.85, w: 5.6, h: 0.5, fontFace: H, fontSize: 24, bold: true, color: C.text1 });
  T(s, "Le produit scanné en rayon devient une recette adaptée à votre objectif.", { x: 0.6, y: 3.45, w: 5.2, h: 0.65, fontSize: 15, color: C.background1 });
  T(s, "Final Challenge · Start-up et chatbot Zapier\nQuentin Blasco · novembre 2026", { x: 0.6, y: 4.45, w: 5.6, h: 0.6, fontSize: 12.5, color: C.accent5 });
  phone(s, "recette.jpg", 7.0, 0.55, 4.5, "Fiche recette de l'application");
  s.addNotes("Bonjour, je suis Quentin Blasco. Je vous présente Scan & Cook : une application qui transforme n'importe quel produit de supermarché en recette adaptée à vos objectifs nutritionnels, en un seul scan. Je vous présenterai la start-up, puis le chatbot que j'ai construit sur Zapier.");

  // ================= 2. Équipe =================
  pres.addSection({ title: "La start-up" });
  s = slide("Un fondateur qui porte le projet de l'idée au prototype", "La start-up");
  s.addShape(pres.shapes.OVAL, { x: 0.8, y: 1.65, w: 1.7, h: 1.7, fill: { color: C.accent1 }, line: { type: "none" }, objectName: "avatar" });
  T(s, "QB", { x: 0.8, y: 1.65, w: 1.7, h: 1.7, fontFace: H, fontSize: 40, bold: true, color: C.background1, align: "center", valign: "middle" });
  T(s, "Quentin Blasco", { x: 0.5, y: 3.55, w: 2.3, h: 0.4, fontFace: H, fontSize: 18, bold: true, align: "center" });
  T(s, "Fondateur · CEO et Product", { x: 0.5, y: 3.95, w: 2.3, h: 0.35, fontSize: 12.5, bold: true, color: C.accent4, align: "center" });
  const team = [
    ["Concept et business", "Problème, cible, proposition de valeur, modèle économique"],
    ["Identité de marque", "Nom, logo, couleurs et ton de Scan & Cook"],
    ["Application web", "Prototype en ligne : scan du code-barres, recettes, favoris"],
    ["Chatbot Zapier", "Directive, scénarios, tests et mise en ligne"],
  ];
  team.forEach(([a, b], i) => {
    const y = 1.6 + i * 0.82;
    T(s, String(i + 1).padStart(2, "0"), { x: 3.4, y, w: 0.6, h: 0.5, fontFace: H, fontSize: 24, bold: true, color: C.accent2 });
    T(s, a, { x: 4.15, y: y + 0.02, w: 5.3, h: 0.32, fontSize: 15.5, bold: true });
    T(s, b, { x: 4.15, y: y + 0.35, w: 5.3, h: 0.3, fontSize: 12.5, color: C.text2 });
  });
  s.addNotes("Je porte le projet seul : le concept et le business, l'identité de marque, le prototype d'application et le chatbot Zapier.");

  // ================= 3. Concept =================
  s = pres.addSlide({ masterName: "VERT", sectionTitle: "La start-up" });
  T(s, "LE CONCEPT", { x: 0.6, y: 0.6, w: 5.5, h: 0.3, fontSize: 12, bold: true, color: C.text1, charSpacing: 2 });
  T(s, "Vous scannez un article en rayon, Scan & Cook vous propose aussitôt une recette complète", { x: 0.6, y: 1.0, w: 5.9, h: 1.65, fontFace: H, fontSize: 24, bold: true, color: C.background1 });
  T(s, "Calibrée pour votre objectif personnel : perte de poids, prise de masse, maintien ou plaisir de cuisiner.", { x: 0.6, y: 2.85, w: 5.5, h: 0.75, fontSize: 15, color: C.background1 });
  T(s, "Calories · macronutriments · budget · liste de courses · étapes", { x: 0.6, y: 3.85, w: 5.6, h: 0.35, fontSize: 14, bold: true, color: C.text1 });
  T(s, "Mission : aider chacun à mieux manger avec ce qu'il achète, sans y passer des heures.", { x: 0.6, y: 4.45, w: 5.6, h: 0.5, fontSize: 13, color: C.accent5, italic: true });
  phone(s, "camera.jpg", 7.0, 0.55, 4.5, "Scan d'un code-barres");
  s.addNotes("Le concept : vous scannez un article en rayon, et Scan & Cook vous propose immédiatement une recette complète avec ce produit, calibrée pour votre objectif, avec les calories, les macronutriments, le budget, la liste de courses et les étapes.");

  // ================= 4. Problème =================
  s = slide("Au supermarché, on a un produit en main sans savoir quoi en faire", "La start-up");
  const pains = [
    ["LuLightbulbOff", "Manque d'idées", "On achète toujours les mêmes produits et on cuisine toujours les mêmes plats."],
    ["LuCalculator", "Objectifs difficiles à suivre", "Compter les calories et les macros d'une recette prend du temps et décourage."],
    ["LuWallet", "Budget flou", "On ne sait pas combien va coûter le plat, ni quels ingrédients il manque."],
    ["LuLayers", "Solutions éclatées", "Il faut jongler entre une appli de recettes, une appli de calories et une liste de courses."],
  ];
  for (let i = 0; i < 4; i++) {
    const x = 0.5 + (i % 2) * 4.6, y = 1.6 + Math.floor(i / 2) * 1.75;
    s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x, y, w: 4.4, h: 1.55, rectRadius: 0.12, fill: { color: C.background2 }, line: { type: "none" }, objectName: "probleme_" + (i + 1) });
    await circleIcon(s, pains[i][0], x + 0.25, y + 0.3, 0.62, C.accent2);
    T(s, pains[i][1], { x: x + 1.1, y: y + 0.25, w: 3.1, h: 0.35, fontSize: 16, bold: true, fontFace: H });
    T(s, pains[i][2], { x: x + 1.1, y: y + 0.65, w: 3.1, h: 0.8, fontSize: 13, color: C.text2 });
  }
  s.addNotes("Le problème : au supermarché, on a souvent un produit en main sans savoir quoi en faire, ni s'il colle à nos objectifs. On manque d'idées, suivre ses calories décourage, le budget est flou, et il faut jongler entre trois applis.");

  // ================= 5. Comment ça marche =================
  s = slide("Quatre étapes, du questionnaire à la recette instantanée", "La start-up");
  const steps = [
    ["questionnaire.jpg", "Le questionnaire", "Une seule fois : objectif, goûts, allergies et régime"],
    ["curseurs.jpg", "Le métabolisme", "Âge, sexe, poids, taille, activité : les besoins caloriques"],
    ["camera.jpg", "Le scan en rayon", "Le code-barres de l'article au supermarché"],
    ["recette.jpg", "La recette", "Instantanée, adaptée à l'objectif et aux besoins caloriques"],
  ];
  steps.forEach(([img, a, b], i) => {
    const x = 0.5 + i * 2.3;
    phone(s, img, x + 0.53, 1.5, 2.2, a);
    T(s, String(i + 1), { x, y: 3.95, w: 0.35, h: 0.4, fontFace: H, fontSize: 22, bold: true, color: C.accent2 });
    T(s, a, { x: x + 0.38, y: 4.0, w: 1.8, h: 0.3, fontSize: 13.5, bold: true });
    T(s, b, { x: x + 0.38, y: 4.32, w: 1.8, h: 0.62, fontSize: 11, color: C.text2 });
  });
  s.addNotes("Comment ça marche : un questionnaire une seule fois, le calcul du métabolisme de base qui rend les recettes précises, le scan du code-barres en rayon, puis la recette instantanée adaptée à l'objectif.");

  // ================= 6. Fiche recette =================
  s = slide("Chaque fiche recette réunit tout ce qu'il faut pour cuisiner", "La start-up");
  phone(s, "recette.jpg", 4.25, 1.45, 3.4, "Fiche recette");
  const left = [["LuFlame", "Calories", "Le total de la recette et par portion"], ["LuChartPie", "Macronutriments", "Protéines, glucides et lipides"], ["LuClock", "Temps", "Préparation et cuisson"]];
  const right = [["LuShoppingCart", "Ingrédients à acheter", "Ce qui manque pour compléter le plat"], ["LuWallet", "Budget", "Le coût estimé de la recette"], ["LuListOrdered", "Étapes", "Les instructions pas à pas"]];
  for (let i = 0; i < 3; i++) {
    const y = 1.6 + i * 1.12;
    await circleIcon(s, left[i][0], 3.45, y, 0.52);
    T(s, left[i][1], { x: 0.5, y: y - 0.02, w: 2.8, h: 0.3, fontSize: 15, bold: true, align: "right" });
    T(s, left[i][2], { x: 0.5, y: y + 0.3, w: 2.8, h: 0.5, fontSize: 12.5, color: C.text2, align: "right" });
    await circleIcon(s, right[i][0], 6.05, y, 0.52);
    T(s, right[i][1], { x: 6.75, y: y - 0.02, w: 2.75, h: 0.3, fontSize: 15, bold: true });
    T(s, right[i][2], { x: 6.75, y: y + 0.3, w: 2.75, h: 0.5, fontSize: 12.5, color: C.text2 });
  }
  s.addNotes("Chaque fiche recette contient les calories, les macronutriments, la liste des ingrédients à acheter, le budget estimé, les étapes et le temps de préparation. Tout est réuni sur un seul écran.");

  // ================= 7. Cible =================
  s = slide("Une appli pour tous ceux qui veulent mieux manger sans y passer des heures", "La start-up");
  const cible = [
    ["Profil", "Objectif", "Ce qu'il attend de Scan & Cook"],
    ["Sportifs", "Prise de masse musculaire", "Des recettes riches en protéines, macros détaillées"],
    ["Personnes au régime", "Perte de poids", "Des plats rassasiants sous un seuil de calories"],
    ["Actifs pressés", "Maintien", "Des recettes rapides et équilibrées au quotidien"],
    ["Étudiants", "Petit budget", "Des idées avec ce qu'ils ont dans le panier, coût affiché"],
    ["Curieux et gourmands", "Découverte culinaire", "De nouvelles idées avec des produits qu'ils ne savent pas cuisiner"],
  ];
  s.addTable(cible.map((r, ri) => r.map((c, ci) => tableCell(c, { bold: ri === 0 || ci === 0, color: ri > 0 && ci === 1 ? HEX.greenDark : HEX.ink, fontSize: 13 }))),
    { x: 0.5, y: 1.55, w: 9.0, colW: [2.2, 2.4, 4.4], rowH: 0.5, objectName: "cible" });
  s.addNotes("Scan & Cook s'adresse à toute personne qui fait ses courses et veut mieux manger : les sportifs, les personnes au régime, les actifs pressés, les étudiants et les curieux.");

  // ================= 8. Proposition de valeur =================
  s = pres.addSlide({ masterName: "VERT", sectionTitle: "La start-up" });
  T(s, "PROPOSITION DE VALEUR", { x: 0.5, y: 0.45, w: 9, h: 0.3, fontSize: 12, bold: true, color: C.text1, charSpacing: 2 });
  T(s, "Un simple scan devient une recette personnalisée, chiffrée et prête à cuisiner, directement depuis le rayon", { x: 0.5, y: 0.85, w: 9, h: 1.25, fontFace: H, fontSize: 25, bold: true, color: C.background1 });
  const vp = [
    ["LuZap", "Instantané", "Un scan suffit, la recette s'affiche tout de suite"],
    ["LuTarget", "Personnalisé", "Calibré sur l'objectif et le métabolisme"],
    ["LuClipboardList", "Complet", "Calories, macros, budget, courses, étapes et temps"],
    ["LuMapPin", "Pratique", "Au rayon, là où la décision se prend"],
    ["LuPiggyBank", "Économique", "Budget affiché, moins de gaspillage"],
  ];
  for (let i = 0; i < 5; i++) {
    const x = 0.5 + i * 1.83;
    s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x, y: 2.45, w: 1.7, h: 2.5, rectRadius: 0.12, fill: { color: C.background1 }, line: { type: "none" }, objectName: "valeur_" + (i + 1) });
    await circleIcon(s, vp[i][0], x + 0.2, 2.65, 0.55, C.accent2);
    T(s, vp[i][1], { x: x + 0.2, y: 3.35, w: 1.35, h: 0.32, fontSize: 14.5, bold: true, fontFace: H });
    T(s, vp[i][2], { x: x + 0.2, y: 3.72, w: 1.35, h: 1.1, fontSize: 12, color: C.text2 });
  }
  s.addNotes("Notre proposition de valeur : un simple scan devient une recette personnalisée, chiffrée et prête à cuisiner. C'est instantané, personnalisé, complet, pratique parce qu'on l'utilise au moment de l'achat, et économique.");

  // ================= 9. Différenciation =================
  s = slide("Aucune appli courante ne relie le scan d'un produit à une recette personnalisée", "La start-up");
  const comp = [
    ["Type d'appli", "Exemple", "Ce qu'elle fait", "Ce qui lui manque"],
    ["Scan de produits", "Yuka", "Note la qualité d'un produit scanné", "Ne propose pas quoi cuisiner"],
    ["Suivi des calories", "MyFitnessPal", "Compte calories et macros", "Pas d'idée de recette à partir d'un produit"],
    ["Recettes", "Marmiton", "Large choix de recettes", "Ni objectif personnel, ni budget, ni scan"],
    ["Les trois réunis", "Scan & Cook", "Scan, recette adaptée à l'objectif, calories, macros, budget et courses", "—"],
  ];
  s.addTable(comp.map((r, ri) => r.map((c, ci) => tableCell(c, {
    bold: ri === 0 || ci === 1 || ri === 4, fontSize: 12.5,
    color: ri === 4 ? HEX.greenDark : HEX.ink,
    fill: { color: ri === 4 ? HEX.greenLight : HEX.white },
  }))), { x: 0.5, y: 1.55, w: 9.0, colW: [1.9, 1.6, 2.9, 2.6], rowH: 0.55, objectName: "comparatif" });
  T(s, "Scan & Cook réunit trois usages aujourd'hui séparés.", { x: 0.5, y: 4.6, w: 9, h: 0.35, fontSize: 14, bold: true, color: C.accent3 });
  s.addNotes("Ce qui nous différencie : Yuka note un produit mais ne dit pas quoi cuisiner, MyFitnessPal compte les calories sans proposer de recette, Marmiton propose des recettes sans objectif, sans budget et sans scan. Scan & Cook réunit les trois.");

  // ================= 10. Modèle économique =================
  s = slide("Un modèle freemium : gratuit pour attirer, Premium et partenariats pour financer", "La start-up");
  const rev = [
    ["Version gratuite", "0 €", "Questionnaire, métabolisme et quelques scans par jour, avec publicité", false],
    ["Premium", "4,99 € / mois", "Scans illimités, sans publicité, planning de repas, suivi des objectifs", true],
    ["Supermarchés", "Partenariat", "Mise en avant de produits et promotions dans les recettes", false],
    ["Marques", "Partenariat", "Recettes sponsorisées autour de leurs produits, clairement signalées", false],
  ];
  rev.forEach(([a, p, d, hi], i) => {
    const x = 0.5 + i * 2.3;
    s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x, y: 1.6, w: 2.15, h: 3.0, rectRadius: 0.12, fill: { color: hi ? C.accent1 : C.background2 }, line: { type: "none" }, objectName: "revenu_" + (i + 1) });
    T(s, a, { x: x + 0.2, y: 1.8, w: 1.8, h: 0.3, fontSize: 13.5, bold: true, color: hi ? C.background1 : C.text2 });
    const [big, small] = p.split(" / ");
    T(s, small ? [{ text: big }, { text: " / " + small, options: { fontSize: 13 } }] : big, { x: x + 0.2, y: 2.15, w: 1.85, h: 0.5, fontFace: H, fontSize: 21, bold: true, color: hi ? C.background1 : C.text1 });
    T(s, d, { x: x + 0.2, y: 2.85, w: 1.8, h: 1.6, fontSize: 12.5, color: hi ? C.background1 : C.text2 });
  });
  T(s, "Prix indicatifs, pour une entreprise fictive.", { x: 0.5, y: 4.75, w: 6, h: 0.3, fontSize: 10.5, color: C.text2 });
  s.addNotes("Le modèle est freemium : l'appli est gratuite pour attirer un maximum d'utilisateurs, avec un abonnement Premium d'environ 4,99 euros par mois, et des partenariats avec les supermarchés et les marques, toujours clairement signalés.");

  // ================= 11. Divider chatbot =================
  pres.addSection({ title: "Le chatbot" });
  s = pres.addSlide({ masterName: "VERT", sectionTitle: "Le chatbot" });
  T(s, "PARTIE 2", { x: 0.6, y: 1.5, w: 5, h: 0.3, fontSize: 12, bold: true, color: C.text1, charSpacing: 2 });
  T(s, "Le chatbot Scan & Cook sur Zapier", { x: 0.6, y: 1.9, w: 8.8, h: 1.0, fontFace: H, fontSize: 36, bold: true, color: C.background1 });
  T(s, "Stratégie, fonctionnement, configuration et démonstration", { x: 0.6, y: 3.0, w: 8.8, h: 0.4, fontSize: 16, color: C.accent5 });
  s.addNotes("Passons au chatbot : pourquoi je l'ai créé, comment il fonctionne, comment je l'ai configuré sur Zapier, et une démonstration.");

  // ================= 12. Stratégie =================
  s = slide("Le chatbot fait l'onboarding et recommande une recette pour chaque produit", "Le chatbot");
  T(s, "Sa mission pour l'utilisateur", { x: 0.5, y: 1.5, w: 4.3, h: 0.35, fontSize: 15, bold: true, color: C.accent3 });
  const mission = [
    ["LuUserPlus", "Onboarding", "Crée le profil en 6 questions"],
    ["LuChefHat", "Recommandation", "Une recette adaptée pour chaque produit"],
    ["LuShieldCheck", "Sécurité", "Alerte allergène avant toute recette"],
    ["LuHeart", "Fidélisation", "Autre recette, favoris, historique"],
  ];
  for (let i = 0; i < 4; i++) {
    const y = 1.98 + i * 0.72;
    await circleIcon(s, mission[i][0], 0.5, y, 0.5);
    T(s, mission[i][1], { x: 1.15, y: y - 0.02, w: 3.4, h: 0.3, fontSize: 14.5, bold: true });
    T(s, mission[i][2], { x: 1.15, y: y + 0.27, w: 3.4, h: 0.28, fontSize: 12.5, color: C.text2 });
  }
  s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: 5.0, y: 1.5, w: 4.5, h: 3.4, rectRadius: 0.12, fill: { color: C.accent5 }, line: { type: "none" }, objectName: "benefices" });
  T(s, "Ce qu'il apporte à la start-up", { x: 5.25, y: 1.7, w: 4.0, h: 0.35, fontSize: 15, bold: true, color: C.accent3 });
  T(s, [
    ["Acquisition", "un simple lien à partager, rien à installer"],
    ["Qualification", "objectif, régime et budget connus dès le premier échange"],
    ["Conversion", "les utilisateurs conquis sont orientés vers l'appli et Premium"],
    ["Disponibilité", "24 h sur 24, sans conseiller à mobiliser"],
  ].flatMap(([a, b], k, arr) => [{ text: a + " : ", options: { bold: true } }, { text: b, options: { breakLine: k < arr.length - 1 } }]),
  { x: 5.25, y: 2.15, w: 4.0, h: 2.6, fontSize: 13.5, paraSpaceAfter: 9 });
  s.addNotes("Le chatbot a une double fonction : onboarding et recommandation de produits, ici de recettes. Pour la start-up, c'est un outil d'acquisition, de qualification des utilisateurs et de conversion vers l'application et le Premium, disponible en permanence.");

  // ================= 13. Parcours =================
  s = slide("Le parcours suit six étapes, avec un contrôle avant chaque recette", "Le chatbot");
  const flow = [
    ["LuHand", "Accueil", "Message de bienvenue et boutons suggérés"],
    ["LuClipboardList", "Profil", "6 questions, réponses en chiffres ou en mots"],
    ["LuCalculator", "Besoins", "Métabolisme, besoins du jour, kcal par repas"],
    ["LuShoppingBasket", "Produit", "Le nom du produit en rayon"],
    ["LuShieldAlert", "Contrôle", "Allergène, non alimentaire, boisson"],
    ["LuChefHat", "Recette", "Fiche complète au format de l'appli"],
  ];
  s.addShape(pres.shapes.LINE, { x: 1.0, y: 1.95, w: 8.0, h: 0, line: { color: HEX.border, width: 2 }, objectName: "fil" });
  for (let i = 0; i < 6; i++) {
    const x = 0.5 + i * 1.6, ctrl = i === 4;
    await circleIcon(s, flow[i][0], x + 0.43, 1.6, 0.7, ctrl ? C.accent2 : C.accent1);
    T(s, flow[i][1], { x, y: 2.45, w: 1.56, h: 0.3, fontSize: 14, bold: true, align: "center", color: ctrl ? C.accent4 : C.text1 });
    T(s, flow[i][2], { x: x + 0.08, y: 2.8, w: 1.4, h: 0.9, fontSize: 11.5, color: C.text2, align: "center" });
  }
  s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: 0.5, y: 3.95, w: 9.0, h: 0.85, rectRadius: 0.1, fill: { color: C.background2 }, line: { type: "none" }, objectName: "apres" });
  T(s, [{ text: "Après chaque recette : ", options: { bold: true } }, { text: "1) une autre recette avec ce produit   2) garder en favori   3) un autre produit. Commandes à tout moment : Mon profil, Mes favoris, Historique, Aide." }],
    { x: 0.75, y: 4.08, w: 8.5, h: 0.6, fontSize: 13, valign: "middle" });
  s.addNotes("Le parcours : accueil, profil en six questions, calcul des besoins, saisie du produit, contrôle de sécurité, puis la recette. Ensuite, l'utilisateur choisit la suite, et il peut utiliser des commandes à tout moment.");

  // ================= 14. Configuration =================
  s = slide("Sept réglages Zapier donnent au chatbot son rôle et son style", "Le chatbot");
  const cfg = [
    ["Réglage", "Mon choix"],
    ["Nom", "Scan & Cook"],
    ["Message d'accueil", "« Salut, moi c'est Scan & Cook ! Un bip, une recette. … On commence par ton profil ? »"],
    ["Directive", "7 rubriques : rôle, objectifs, audience, contexte, ton, règles et étapes, ressources"],
    ["Modèle d'IA", "Modèle inclus dans le plan gratuit de Zapier, sans clé API"],
    ["Réponses suggérées", "C'est parti · J'ai déjà un produit · Mes favoris · Aide"],
    ["Thème", "Vert #2E9E5B, accent orange #F28C28, logo Scan & Cook"],
    ["Partage", "Lien public, ouvert à tous"],
  ];
  s.addTable(cfg.map((r, ri) => r.map((c, ci) => tableCell(c, { bold: ri === 0 || ci === 0, fontSize: 12.5 }))),
    { x: 0.5, y: 1.5, w: 9.0, colW: [2.2, 6.8], rowH: 0.42, objectName: "configuration" });
  s.addNotes("La configuration Zapier en sept réglages : le nom, le message d'accueil, la directive organisée en sept rubriques, le modèle d'IA inclus dans le plan gratuit, les réponses suggérées, le thème aux couleurs de la marque et un lien public.");

  // ================= 15. Conditions =================
  s = slide("Des conditions et des personnalisations encadrent chaque réponse", "Le chatbot");
  const panel = (x, fill, head, headColor, rows, name) => {
    s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x, y: 1.5, w: 4.4, h: 3.4, rectRadius: 0.12, fill: { color: fill }, line: { type: "none" }, objectName: name });
    T(s, head, { x: x + 0.25, y: 1.7, w: 3.9, h: 0.35, fontSize: 15.5, bold: true, color: headColor });
    T(s, rows, { x: x + 0.25, y: 2.15, w: 3.95, h: 2.6, fontSize: 13, paraSpaceAfter: 8 });
  };
  panel(0.5, HEX.orangeLight, "Conditions : si… alors…", C.accent4, [
    ["Allergène ou ingrédient interdit", "alerte et confirmation avant la recette"],
    ["Produit non alimentaire", "refus poli"],
    ["Code-barres seul", "demande du nom du produit"],
    ["Produit avant le profil", "profil ou recette standard"],
    ["Hors sujet", "retour aux recettes"],
  ].flatMap(([a, b], k, arr) => [{ text: a, options: { bold: true } }, { text: " → " + b, options: { breakLine: k < arr.length - 1 } }]), "conditions");
  panel(5.1, C.accent5, "Personnalisations", C.accent3, [
    ["Calories", "objectif par repas calculé pour chaque profil"],
    ["Type de plat", "selon l'objectif choisi"],
    ["Budget", "maximum fixé par l'utilisateur"],
    ["Réponses libres", "chiffres ou mots acceptés"],
    ["Mémoire", "favoris et historique de la conversation"],
  ].flatMap(([a, b], k, arr) => [{ text: a + " : ", options: { bold: true } }, { text: b, options: { breakLine: k < arr.length - 1 } }]), "personnalisations");
  s.addNotes("Dans la directive, j'ai écrit des conditions de type si-alors, la plus importante étant l'alerte allergène avant toute recette, et des personnalisations : calories, type de plat, budget, réponses libres et mémoire des favoris.");

  // ================= 16. En action =================
  s = slide("Le chatbot en action", "Le chatbot");
  ["Accueil et profil", "Recette générée", "Alerte allergène"].forEach((cap, i) => {
    const x = 0.5 + i * 3.07;
    s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x, y: 1.4, w: 2.86, h: 2.85, rectRadius: 0.12, fill: { color: C.background2 }, line: { color: HEX.green, width: 1.25, dashType: "dash" }, objectName: "capture_" + (i + 1) });
    T(s, "Insérer ici la capture Zapier", { x: x + 0.2, y: 2.55, w: 2.46, h: 0.5, fontSize: 12, color: C.text2, align: "center", valign: "middle" });
    T(s, cap, { x, y: 4.33, w: 2.86, h: 0.3, fontSize: 14, bold: true, align: "center" });
  });
  T(s, [{ text: "Lien du chatbot : ", options: { bold: true, color: C.accent3 } }, { text: "coller ici le lien public Zapier" }], { x: 0.5, y: 4.75, w: 8.3, h: 0.3, fontSize: 13 });
  s.addNotes("Voici le chatbot en action : la création du profil, une recette générée et l'alerte allergène. Le lien du chatbot est en bas de la diapositive.");

  // ================= 17. Chatbot -> application =================
  s = slide("Le chatbot fait découvrir Scan & Cook, l'application prend le relais en magasin", "Le chatbot");
  phone(s, "camera.jpg", 0.6, 1.55, 3.1, "Scan avec la caméra");
  phone(s, "alerte.jpg", 2.4, 1.55, 3.1, "Alerte allergène");
  phone(s, "favoris.jpg", 4.2, 1.55, 3.1, "Mes recettes et favoris");
  T(s, [{ text: "Application complète : " }, { text: "scan-cook.vercel.app", options: { hyperlink: { url: "https://scan-cook.vercel.app" } } }],
    { x: 6.15, y: 1.5, w: 3.35, h: 0.55, fontSize: 14, bold: true, color: C.accent3 });
  T(s, "Pourquoi ce lien ?", { x: 6.15, y: 2.15, w: 3.35, h: 0.3, fontSize: 14, bold: true });
  T(s, [
    { text: "Le chatbot gratuit ne lit que du texte : l'application scanne le code-barres avec la caméra du téléphone", options: { bullet: true, breakLine: true } },
    { text: "L'application identifie le produit avec Open Food Facts, avec ses vraies valeurs nutritionnelles", options: { bullet: true, breakLine: true } },
    { text: "Les favoris restent enregistrés d'une visite à l'autre", options: { bullet: true } },
  ], { x: 6.15, y: 2.5, w: 3.35, h: 1.95, fontSize: 12, paraSpaceAfter: 5 });
  T(s, "Chatbot pour découvrir → application en magasin → Premium", { x: 6.15, y: 4.5, w: 3.35, h: 0.5, fontSize: 13, bold: true, color: C.accent3 });
  s.addNotes("Le chatbot Zapier est notre porte d'entrée : un simple lien, rien à installer. Mais sur le plan gratuit, il ne lit que du texte, ne consulte pas de base de produits et oublie tout à la fin de la conversation. Pour l'usage en magasin, j'ai donc développé l'application complète : elle scanne vraiment le code-barres, identifie le produit avec Open Food Facts et garde les favoris. Le chatbot fait découvrir le service, l'application le fait utiliser chaque jour, et c'est elle qui mène vers l'abonnement Premium.");

  // ================= 18. Conclusion =================
  pres.addSection({ title: "Conclusion" });
  s = pres.addSlide({ masterName: "VERT", sectionTitle: "Conclusion" });
  T(s, "NOTRE AVANTAGE CONCURRENTIEL", { x: 0.6, y: 0.55, w: 8.8, h: 0.3, fontSize: 12, bold: true, color: C.text1, charSpacing: 2 });
  T(s, "Le produit en main devient une recette sûre et adaptée, en un seul geste", { x: 0.6, y: 0.95, w: 8.8, h: 1.2, fontFace: H, fontSize: 30, bold: true, color: C.background1 });
  const adv = [
    ["LuZap", "Immédiat", "Au rayon, la recette arrive en quelques secondes"],
    ["LuTarget", "Personnalisé", "Objectif, métabolisme, régime, allergies et budget"],
    ["LuRepeat", "Fidélisant", "Chatbot pour découvrir, appli et Premium pour rester"],
  ];
  for (let i = 0; i < 3; i++) {
    const x = 0.6 + i * 3.0;
    await circleIcon(s, adv[i][0], x, 2.55, 0.62, C.background1, "#2E9E5B");
    T(s, adv[i][1], { x, y: 3.3, w: 2.7, h: 0.38, fontSize: 18, bold: true, fontFace: H, color: C.background1 });
    T(s, adv[i][2], { x, y: 3.72, w: 2.65, h: 0.65, fontSize: 13, color: C.accent5 });
  }
  T(s, "Merci ! Un bip, une recette.", { x: 0.6, y: 4.65, w: 8.8, h: 0.45, fontFace: H, fontSize: 20, bold: true, color: C.text1 });
  s.addNotes("Pour conclure : notre avantage, c'est de transformer le produit qu'on a en main en une recette sûre et adaptée, en un seul geste. Le chatbot fait découvrir le service sans installation, l'application et le Premium fidélisent. Merci !");

  await pres.writeFile({ fileName: OUT });
  await applyTheme(OUT, THEME);
  console.log("OK " + OUT);
})();
