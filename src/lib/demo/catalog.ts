// Catalogue d'ingrédients du mode démo (sans IA).
// Valeurs nutritionnelles pour 100 g (ou 100 ml) et prix moyens constatés en supermarché français.

export type Tag =
  | "gluten"
  | "lait"
  | "oeuf"
  | "poisson"
  | "fruits-a-coque"
  | "arachides"
  | "viande"
  | "porc"
  | "animal"
  | "alcool";

export type CatalogItem = {
  id: string;
  nom: string; // affiché dans la liste de courses
  art: string; // avec article, utilisé dans les étapes : "les courgettes"
  court: string; // sans article, utilisé dans les titres : "courgette"
  g: number; // grammes par portion
  kcal: number;
  p: number; // protéines
  c: number; // glucides
  f: number; // lipides
  prix: number; // € pour 100 g
  tags?: Tag[];
  piece?: { g: number; one: string; many: string }; // affichage à l'unité ("2 œufs")
  ml?: boolean; // liquide : affichage en ml
  fixe?: { label: string; prix: number }; // petite quantité fixe (épices, ail...)
  crudite?: boolean; // se mange cru (salades)
};

const I = (x: CatalogItem) => x;

export const CATALOG: Record<string, CatalogItem> = {
  // ----- Féculents (poids cru) -----
  riz: I({ id: "riz", nom: "Riz basmati", art: "le riz", court: "riz", g: 70, kcal: 350, p: 7.5, c: 77, f: 1, prix: 0.3 }),
  pates: I({ id: "pates", nom: "Pâtes complètes", art: "les pâtes", court: "pâtes", g: 75, kcal: 350, p: 13, c: 64, f: 2.5, prix: 0.25, tags: ["gluten"] }),
  semoule: I({ id: "semoule", nom: "Semoule complète", art: "la semoule", court: "semoule", g: 70, kcal: 350, p: 12, c: 68, f: 2, prix: 0.3, tags: ["gluten"] }),
  quinoa: I({ id: "quinoa", nom: "Quinoa", art: "le quinoa", court: "quinoa", g: 65, kcal: 368, p: 14, c: 64, f: 6, prix: 1.0 }),
  pdt: I({ id: "pdt", nom: "Pommes de terre", art: "les pommes de terre", court: "pommes de terre", g: 250, kcal: 77, p: 2, c: 17, f: 0.1, prix: 0.2 }),
  patate: I({ id: "patate", nom: "Patate douce", art: "la patate douce", court: "patate douce", g: 200, kcal: 86, p: 1.6, c: 20, f: 0.1, prix: 0.35 }),
  pain: I({ id: "pain", nom: "Pain complet", art: "le pain", court: "pain complet", g: 70, kcal: 247, p: 13, c: 41, f: 3.4, prix: 0.5, tags: ["gluten"], piece: { g: 35, one: "tranche", many: "tranches" } }),
  galettes: I({ id: "galettes", nom: "Galettes de riz soufflé", art: "les galettes de riz", court: "galettes de riz", g: 30, kcal: 380, p: 8, c: 80, f: 3, prix: 1.2, piece: { g: 10, one: "galette", many: "galettes" } }),

  // ----- Légumes -----
  courgette: I({ id: "courgette", nom: "Courgettes", art: "les courgettes", court: "courgette", g: 150, kcal: 17, p: 1.2, c: 3, f: 0.3, prix: 0.3, crudite: true }),
  poivron: I({ id: "poivron", nom: "Poivron rouge", art: "le poivron", court: "poivron", g: 110, kcal: 26, p: 1, c: 6, f: 0.3, prix: 0.45, crudite: true, piece: { g: 160, one: "poivron rouge", many: "poivrons rouges" } }),
  epinards: I({ id: "epinards", nom: "Épinards (surgelés)", art: "les épinards", court: "épinards", g: 120, kcal: 23, p: 2.9, c: 3.6, f: 0.4, prix: 0.5 }),
  tomates: I({ id: "tomates", nom: "Tomates", art: "les tomates", court: "tomates", g: 150, kcal: 18, p: 0.9, c: 3.9, f: 0.2, prix: 0.35, crudite: true }),
  carottes: I({ id: "carottes", nom: "Carottes", art: "les carottes", court: "carottes", g: 120, kcal: 41, p: 0.9, c: 10, f: 0.2, prix: 0.15, crudite: true }),
  brocoli: I({ id: "brocoli", nom: "Brocoli (surgelé)", art: "le brocoli", court: "brocoli", g: 150, kcal: 34, p: 2.8, c: 7, f: 0.4, prix: 0.4 }),
  champignons: I({ id: "champignons", nom: "Champignons de Paris", art: "les champignons", court: "champignons", g: 120, kcal: 22, p: 3.1, c: 3.3, f: 0.3, prix: 0.5 }),
  haricotsverts: I({ id: "haricotsverts", nom: "Haricots verts (surgelés)", art: "les haricots verts", court: "haricots verts", g: 150, kcal: 31, p: 1.8, c: 7, f: 0.2, prix: 0.35 }),
  concombre: I({ id: "concombre", nom: "Concombre", art: "le concombre", court: "concombre", g: 120, kcal: 15, p: 0.7, c: 3.6, f: 0.1, prix: 0.25, crudite: true, piece: { g: 300, one: "concombre", many: "concombres" } }),
  salade: I({ id: "salade", nom: "Salade verte", art: "la salade", court: "salade", g: 50, kcal: 15, p: 1.4, c: 2.9, f: 0.2, prix: 0.7, crudite: true }),
  aubergine: I({ id: "aubergine", nom: "Aubergine", art: "l'aubergine", court: "aubergine", g: 150, kcal: 25, p: 1, c: 6, f: 0.2, prix: 0.4 }),
  butternut: I({ id: "butternut", nom: "Courge butternut", art: "la courge", court: "butternut", g: 200, kcal: 45, p: 1, c: 12, f: 0.1, prix: 0.3 }),
  oignon: I({ id: "oignon", nom: "Oignon", art: "l'oignon", court: "oignon", g: 50, kcal: 40, p: 1.1, c: 9, f: 0.1, prix: 0.25, piece: { g: 100, one: "oignon", many: "oignons" } }),

  // ----- Protéines -----
  oeufs: I({ id: "oeufs", nom: "Œufs", art: "les œufs", court: "œuf", g: 55, kcal: 143, p: 12.6, c: 0.7, f: 9.5, prix: 0.5, tags: ["oeuf", "animal"], piece: { g: 55, one: "œuf", many: "œufs" } }),
  poulet: I({ id: "poulet", nom: "Blanc de poulet", art: "le poulet", court: "poulet", g: 120, kcal: 110, p: 23, c: 0, f: 1.5, prix: 1.3, tags: ["viande", "animal"] }),
  thon: I({ id: "thon", nom: "Thon au naturel (boîte)", art: "le thon", court: "thon", g: 80, kcal: 116, p: 26, c: 0, f: 1, prix: 1.6, tags: ["poisson", "animal"] }),
  tofu: I({ id: "tofu", nom: "Tofu ferme", art: "le tofu", court: "tofu", g: 100, kcal: 144, p: 15, c: 2, f: 8.7, prix: 1.0 }),
  poischiches: I({ id: "poischiches", nom: "Pois chiches (boîte)", art: "les pois chiches", court: "pois chiches", g: 120, kcal: 120, p: 7, c: 15, f: 2.6, prix: 0.3 }),
  lentilles: I({ id: "lentilles", nom: "Lentilles vertes cuites (bocal)", art: "les lentilles", court: "lentilles", g: 120, kcal: 100, p: 8, c: 13, f: 0.5, prix: 0.45 }),
  haricotsrouges: I({ id: "haricotsrouges", nom: "Haricots rouges (boîte)", art: "les haricots rouges", court: "haricots rouges", g: 120, kcal: 110, p: 8, c: 14, f: 0.5, prix: 0.3 }),
  feta: I({ id: "feta", nom: "Feta", art: "la feta", court: "feta", g: 30, kcal: 264, p: 14, c: 4, f: 21, prix: 1.4, tags: ["lait", "animal"] }),
  mozzarella: I({ id: "mozzarella", nom: "Mozzarella", art: "la mozzarella", court: "mozzarella", g: 50, kcal: 250, p: 18, c: 2, f: 19, prix: 1.0, tags: ["lait", "animal"] }),
  emmental: I({ id: "emmental", nom: "Emmental râpé", art: "le fromage râpé", court: "emmental", g: 25, kcal: 380, p: 28, c: 0, f: 29, prix: 1.0, tags: ["lait", "animal"] }),

  // ----- Matières grasses, sauces -----
  huile: I({ id: "huile", nom: "Huile d'olive", art: "l'huile d'olive", court: "huile d'olive", g: 8, kcal: 900, p: 0, c: 0, f: 100, prix: 1.0, fixe: { label: "1 c. à soupe", prix: 0.15 } }),
  coco: I({ id: "coco", nom: "Lait de coco léger", art: "le lait de coco", court: "lait de coco", g: 100, kcal: 90, p: 0.6, c: 2, f: 8.5, prix: 0.6, ml: true }),
  creme: I({ id: "creme", nom: "Crème légère", art: "la crème", court: "crème", g: 40, kcal: 195, p: 3, c: 4, f: 18, prix: 0.6, tags: ["lait", "animal"], ml: true }),
  yaourtgrec: I({ id: "yaourtgrec", nom: "Yaourt grec", art: "le yaourt grec", court: "sauce yaourt", g: 60, kcal: 120, p: 5, c: 4, f: 10, prix: 0.5, tags: ["lait", "animal"] }),
  soja: I({ id: "soja", nom: "Sauce soja", art: "la sauce soja", court: "sauce soja", g: 10, kcal: 60, p: 6, c: 5, f: 0, prix: 1.0, tags: ["gluten"], fixe: { label: "2 c. à soupe", prix: 0.2 } }),
  citron: I({ id: "citron", nom: "Citron", art: "le citron", court: "citron", g: 30, kcal: 29, p: 1, c: 9, f: 0.3, prix: 0.6, piece: { g: 60, one: "citron", many: "citrons" } }),
  tomatesconcassees: I({ id: "tomatesconcassees", nom: "Tomates concassées (boîte)", art: "les tomates concassées", court: "tomate", g: 120, kcal: 25, p: 1.2, c: 4, f: 0.2, prix: 0.3 }),

  // ----- Aromates et épices (petites quantités) -----
  ail: I({ id: "ail", nom: "Ail", art: "l'ail", court: "ail", g: 3, kcal: 0, p: 0, c: 0, f: 0, prix: 0, fixe: { label: "1 gousse", prix: 0.1 } }),
  curry: I({ id: "curry", nom: "Curry en poudre", art: "le curry", court: "curry", g: 2, kcal: 0, p: 0, c: 0, f: 0, prix: 0, fixe: { label: "1 c. à café", prix: 0.15 } }),
  cumin: I({ id: "cumin", nom: "Cumin", art: "le cumin", court: "cumin", g: 2, kcal: 0, p: 0, c: 0, f: 0, prix: 0, fixe: { label: "1 c. à café", prix: 0.15 } }),
  paprika: I({ id: "paprika", nom: "Paprika fumé", art: "le paprika", court: "paprika", g: 2, kcal: 0, p: 0, c: 0, f: 0, prix: 0, fixe: { label: "1 c. à café", prix: 0.15 } }),
  herbes: I({ id: "herbes", nom: "Herbes de Provence", art: "les herbes de Provence", court: "herbes", g: 1, kcal: 0, p: 0, c: 0, f: 0, prix: 0, fixe: { label: "1 c. à café", prix: 0.1 } }),
  gingembre: I({ id: "gingembre", nom: "Gingembre en poudre", art: "le gingembre", court: "gingembre", g: 1, kcal: 0, p: 0, c: 0, f: 0, prix: 0, fixe: { label: "1/2 c. à café", prix: 0.15 } }),
  persil: I({ id: "persil", nom: "Persil frais", art: "le persil", court: "persil", g: 5, kcal: 0, p: 0, c: 0, f: 0, prix: 0, fixe: { label: "1 petit bouquet", prix: 0.8 } }),
  cannelle: I({ id: "cannelle", nom: "Cannelle", art: "la cannelle", court: "cannelle", g: 1, kcal: 0, p: 0, c: 0, f: 0, prix: 0, fixe: { label: "1 pincée", prix: 0.05 } }),

  // ----- Petit-déjeuner, sucré -----
  avoine: I({ id: "avoine", nom: "Flocons d'avoine", art: "les flocons d'avoine", court: "avoine", g: 50, kcal: 370, p: 13, c: 60, f: 7, prix: 0.3, tags: ["gluten"] }),
  floconsriz: I({ id: "floconsriz", nom: "Flocons de riz", art: "les flocons de riz", court: "flocons de riz", g: 50, kcal: 360, p: 7, c: 80, f: 1, prix: 0.6 }),
  farine: I({ id: "farine", nom: "Farine de blé", art: "la farine", court: "farine", g: 45, kcal: 350, p: 10, c: 72, f: 1.2, prix: 0.12, tags: ["gluten"] }),
  farineriz: I({ id: "farineriz", nom: "Farine de riz", art: "la farine de riz", court: "farine de riz", g: 45, kcal: 360, p: 6, c: 80, f: 1, prix: 0.5 }),
  lait: I({ id: "lait", nom: "Lait demi-écrémé", art: "le lait", court: "lait", g: 180, kcal: 46, p: 3.3, c: 4.8, f: 1.6, prix: 0.1, tags: ["lait", "animal"], ml: true }),
  boissonsoja: I({ id: "boissonsoja", nom: "Boisson au soja", art: "la boisson au soja", court: "boisson soja", g: 180, kcal: 39, p: 3.3, c: 1, f: 1.8, prix: 0.2, ml: true }),
  boissonamande: I({ id: "boissonamande", nom: "Boisson à l'amande", art: "la boisson à l'amande", court: "boisson amande", g: 180, kcal: 24, p: 0.5, c: 3, f: 1.1, prix: 0.25, tags: ["fruits-a-coque"], ml: true }),
  skyr: I({ id: "skyr", nom: "Skyr nature", art: "le skyr", court: "skyr", g: 150, kcal: 60, p: 11, c: 4, f: 0.2, prix: 0.45, tags: ["lait", "animal"] }),
  yaourtsoja: I({ id: "yaourtsoja", nom: "Yaourt au soja nature", art: "le yaourt au soja", court: "yaourt soja", g: 125, kcal: 45, p: 4, c: 2, f: 2.2, prix: 0.4 }),
  banane: I({ id: "banane", nom: "Bananes", art: "la banane", court: "banane", g: 110, kcal: 89, p: 1.1, c: 23, f: 0.3, prix: 0.25, piece: { g: 120, one: "banane", many: "bananes" } }),
  fruitsrouges: I({ id: "fruitsrouges", nom: "Fruits rouges (surgelés)", art: "les fruits rouges", court: "fruits rouges", g: 80, kcal: 45, p: 1, c: 8, f: 0.3, prix: 0.9 }),
  pomme: I({ id: "pomme", nom: "Pommes", art: "la pomme", court: "pomme", g: 120, kcal: 52, p: 0.3, c: 14, f: 0.2, prix: 0.3, piece: { g: 150, one: "pomme", many: "pommes" } }),
  graines: I({ id: "graines", nom: "Graines de courge", art: "les graines de courge", court: "graines", g: 12, kcal: 560, p: 30, c: 10, f: 45, prix: 1.5 }),
  amandes: I({ id: "amandes", nom: "Amandes", art: "les amandes", court: "amandes", g: 15, kcal: 600, p: 21, c: 6, f: 52, prix: 1.6, tags: ["fruits-a-coque"] }),
  cacahuete: I({ id: "cacahuete", nom: "Beurre de cacahuète", art: "le beurre de cacahuète", court: "beurre de cacahuète", g: 15, kcal: 600, p: 25, c: 15, f: 50, prix: 1.0, tags: ["arachides"] }),
  miel: I({ id: "miel", nom: "Miel", art: "le miel", court: "miel", g: 8, kcal: 304, p: 0.3, c: 82, f: 0, prix: 1.2, tags: ["animal"], fixe: { label: "1 c. à soupe", prix: 0.2 } }),
};

// Listes d'ingrédients par rôle, du plus courant au plus original.
export const POOLS = {
  feculent: ["riz", "pates", "quinoa", "semoule", "pdt", "patate"],
  feculentFroid: ["quinoa", "riz", "pates", "semoule"],
  feculentCurry: ["riz", "quinoa", "patate"],
  pain: ["pain", "galettes"],
  legume: ["courgette", "poivron", "brocoli", "champignons", "epinards", "haricotsverts", "carottes", "aubergine", "butternut", "tomates"],
  crudite: ["tomates", "concombre", "carottes", "poivron", "salade"],
  legumeSoupe: ["butternut", "carottes", "courgette", "brocoli", "epinards"],
  proteine: ["oeufs", "poulet", "thon", "tofu", "poischiches", "lentilles", "haricotsrouges"],
  proteineVege: ["poischiches", "tofu", "oeufs", "lentilles", "haricotsrouges"],
  fromage: ["mozzarella", "emmental", "feta"],
  sauceBowl: ["yaourtgrec", "citron", "soja"],
  aromate: ["ail", "herbes", "cumin", "paprika", "persil"],
  epiceExotique: ["curry", "gingembre", "cumin", "paprika"],
  flocons: ["avoine", "floconsriz"],
  farine: ["farine", "farineriz"],
  liquide: ["lait", "boissonsoja", "boissonamande"],
  laitier: ["skyr", "yaourtsoja"],
  fruit: ["banane", "fruitsrouges", "pomme"],
  topping: ["graines", "amandes", "cacahuete"],
  oeufOuBanane: ["oeufs", "banane"],
} as const;

export type PoolName = keyof typeof POOLS;
