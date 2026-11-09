import type { Product } from "../product";

// Reconnaît la "famille" d'un produit à partir de son nom et de ses catégories Open Food Facts.

export type Family =
  | "non-alimentaire"
  | "boisson"
  | "legumineuse"
  | "feculent"
  | "pain"
  | "volaille"
  | "viande"
  | "porc"
  | "poisson"
  | "oeuf"
  | "tofu"
  | "laitier"
  | "fromage"
  | "sucre"
  | "cereales"
  | "fruit"
  | "legume"
  | "sauce"
  | "autre";

// L'ordre compte : la première règle qui correspond l'emporte.
const RULES: [Family, RegExp][] = [
  ["non-alimentaire", /shampo|lessive|dentifrice|savon|gel douche|d[ée]odorant|liquide vaisselle|[ée]ponge|nettoyant|javel|couche|lingette|litière|croquettes|p[âa]t[ée]e pour|cosm[ée]tique|cr[èe]me (solaire|hydratante|de jour)|non.food|pet.food|beauty/],
  ["pain", /\b(pain|baguette|wrap|tortilla|pita|brioche|biscotte)s?\b|breads/],
  ["feculent", /p[âa]tes|spaghetti|penne|tagliatelle|fusilli|macaroni|coquillette|lasagne|riz\b|semoule|couscous|quinoa|boulgour|pommes? de terre|gnocchi|nouilles|polenta|patate|pastas|rices|potatoes/],
  ["legumineuse", /pois chiche|lentille|haricots? (rouges?|blancs?|noirs?|coco)|flageolet|f[èe]ves?\b|houmous|hummus|chickpea|lentils|pulses|legumes.and.their.products|kidney/],
  ["tofu", /tofu|tempeh|seitan|prot[ée]ines? de soja/],
  ["volaille", /poulet|dinde|chicken|turkey|volaille|poultry/],
  ["porc", /jambon|lardon|\bporc\b|saucisse|chorizo|bacon|pork|ham\b/],
  ["viande", /b[œo]e?uf|steak|hach[ée]|\bveau\b|agneau|beef|meats/],
  ["poisson", /thon|saumon|sardine|maquereau|cabillaud|colin|crevette|poisson|surimi|tuna|salmon|fish|seafood/],
  ["oeuf", /\b[œo]e?ufs?\b|\beggs?\b/],
  ["sucre", /nutella|p[âa]te à tartiner|confiture|chocolat|\bmiel\b|biscuit|cookie|g[âa]teau|bonbon|\bsucre\b|caramel|spreads|confectioner|sweet.snacks|desserts/],
  ["cereales", /flocons|avoine|muesli|granola|corn ?flakes|c[ée]r[ée]ales|breakfast.cereals/],
  ["fromage", /fromage(?! blanc)|emmental|mozzarella|feta|comt[ée]|ch[èe]vre|parmesan|cheddar|camembert|ricotta|raclette|cheeses/],
  ["laitier", /yaourt|yogourt|yogurt|skyr|fromage blanc|faisselle|petit[- ]suisse|\blait\b|boisson (au soja|à l'amande|d'avoine|végétale)|cr[èe]me fra[îi]che|dairies|milks/],
  ["boisson", /\bjus\b|soda|cola|\beau\b|sirop|bi[èe]re|\bvin\b|caf[ée]|\bth[ée]\b|limonade|beverages|waters|alcoholic/],
  ["sauce", /sauce|ketchup|mayonnaise|moutarde|pesto|vinaigrette|\bhuile\b|[ée]pice|bouillon|condiment|\bsel\b|vinaigre/],
  ["fruit", /\bpommes?\b|banane|fraise|framboise|myrtille|mangue|ananas|poire|orange|cl[ée]mentine|abricot|p[êe]che|compote|\bfruits?\b|fruits.based/],
  ["legume", /courgette|tomate|[ée]pinard|carotte|brocoli|poivron|champignon|haricots? verts?|petits pois|ma[ïi]s|l[ée]gume|ratatouille|aubergine|\bchou|poireau|salade|concombre|avocat|potiron|butternut|betterave|vegetables/],
];

export function detectFamily(product: Product): Family {
  const match = (text: string) => RULES.find(([, re]) => re.test(text.toLowerCase()))?.[0];

  // 1) D'abord le nom du produit, le plus fiable.
  const byName = match(product.name);
  if (byName) return byName;
  // 2) Puis les catégories, de la plus précise (à la fin de la liste) à la plus générale.
  for (const tag of [...product.categories].reverse()) {
    const byTag = match(tag.replace(/^[a-z]{2}:/, "").replace(/-/g, " "));
    if (byTag) return byTag;
  }

  // Rien de reconnu : on devine avec les valeurs nutritionnelles.
  const n = product.nutriments;
  if (n.proteins !== undefined && n.proteins >= 15) return "autre";
  if (n.sugars !== undefined && n.sugars >= 25) return "sucre";
  if (n.carbs !== undefined && n.carbs >= 45) return "feculent";
  if (n.kcal !== undefined && n.kcal < 60) return "legume";
  return "autre";
}

type FamilyInfo = {
  g: number; // portion de produit par personne (en grammes)
  prix: number; // prix moyen pour 100 g
  kcal: number;
  p: number;
  c: number;
  f: number;
};

// Valeurs par défaut quand Open Food Facts ne donne pas d'infos (ou produit tapé à la main).
export const FAMILY_INFO: Record<Family, FamilyInfo> = {
  "non-alimentaire": { g: 0, prix: 0, kcal: 0, p: 0, c: 0, f: 0 },
  boisson: { g: 0, prix: 0, kcal: 0, p: 0, c: 0, f: 0 },
  legumineuse: { g: 120, prix: 0.3, kcal: 120, p: 7, c: 15, f: 2.6 },
  feculent: { g: 75, prix: 0.3, kcal: 350, p: 12, c: 70, f: 2 },
  pain: { g: 70, prix: 0.5, kcal: 260, p: 9, c: 49, f: 3 },
  volaille: { g: 125, prix: 1.3, kcal: 110, p: 23, c: 0, f: 1.5 },
  viande: { g: 120, prix: 1.5, kcal: 200, p: 20, c: 0, f: 13 },
  porc: { g: 80, prix: 1.2, kcal: 150, p: 19, c: 1, f: 8 },
  poisson: { g: 100, prix: 1.5, kcal: 120, p: 22, c: 0, f: 3 },
  oeuf: { g: 110, prix: 0.5, kcal: 143, p: 12.6, c: 0.7, f: 9.5 },
  tofu: { g: 100, prix: 1.0, kcal: 144, p: 15, c: 2, f: 8.7 },
  laitier: { g: 150, prix: 0.35, kcal: 60, p: 5, c: 5, f: 2 },
  fromage: { g: 35, prix: 1.2, kcal: 330, p: 22, c: 1, f: 27 },
  sucre: { g: 20, prix: 0.8, kcal: 500, p: 6, c: 60, f: 25 },
  cereales: { g: 50, prix: 0.4, kcal: 370, p: 12, c: 62, f: 7 },
  fruit: { g: 120, prix: 0.4, kcal: 55, p: 0.7, c: 13, f: 0.2 },
  legume: { g: 180, prix: 0.4, kcal: 30, p: 1.5, c: 5, f: 0.3 },
  sauce: { g: 25, prix: 0.8, kcal: 200, p: 2, c: 10, f: 17 },
  autre: { g: 100, prix: 0.6, kcal: 150, p: 6, c: 15, f: 7 },
};
