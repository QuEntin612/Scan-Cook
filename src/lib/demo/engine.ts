import type { Product } from "../product";
import { computeNeeds, type Diet, type Goal, type Profile } from "../profile";
import type { Ingredient, Recipe } from "../recipe";
import { CATALOG, POOLS, type CatalogItem, type PoolName, type Tag } from "./catalog";
import { detectFamily, FAMILY_INFO, type Family } from "./families";

// =====================================================================
// Moteur de recettes du MODE DÉMO : gratuit, sans IA, sans clé API.
// Il assemble une recette à partir du produit, d'un "style" de plat
// et d'ingrédients compatibles avec le régime, puis ajuste les quantités
// pour viser l'objectif calorique et le budget.
// =====================================================================

type Role =
  | "feculent" | "legume" | "proteine" | "gras" | "aromate" | "sauce" | "fromage"
  | "pain" | "flocons" | "farine" | "liquide" | "laitier" | "fruit" | "topping" | "liant";

type Slot = { role: Role; pool: PoolName | string[]; count?: number; opt?: boolean };

type Pick = { item: CatalogItem; g: number; role: Role; opt: boolean };

type Ctx = {
  P: string; // nom court du produit : "pois chiches"
  Part: string; // avec article : "les pois chiches"
  family: Family;
  goal: Goal;
  picks: Pick[];
};

type Style = {
  id: string;
  sweet: boolean;
  time: number;
  slots: Slot[];
  needs?: Tag; // ex. l'omelette a besoin d'œufs
  title: (c: Ctx) => string;
  steps: (c: Ctx) => string[];
};

// ---------- Petits outils de français ----------
const startsVowel = (s: string) => /^[aeiouyhéèêœ]/i.test(s);
const de = (s: string) => (startsVowel(s) ? `d'${s}` : `de ${s}`);
const joinFr = (xs: string[]) =>
  xs.length <= 1 ? (xs[0] ?? "") : `${xs.slice(0, -1).join(", ")} et ${xs[xs.length - 1]}`;
const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

const FEMININ = /^(cr[èe]me|semoule|farine|p[âa]te|sauce|confiture|compote|courgette|tomate|carotte|salade|soupe|pur[ée]e|boisson|mozzarella|feta|ricotta|dinde|escalope|aubergine|betterave|banane|pomme|poire|fraise|framboise|mangue|orange|brioche|baguette|galette|tortilla|quiche|pizza|lentille|f[èe]ve|polenta|crevette|sardine|truite|dorade|noix|viande|saucisse|cuisse|blanquette|ratatouille|coquillette|tagliatelle|lasagne|courge|patate|cl[ée]mentine|p[êe]che|cerise|prune|datte|ciboulette|chips)\b/i;

const COMMON_WORD = /^(riz|quinoa|semoule|boulgour|lentilles|tofu|skyr|yaourts?|lait|beurre|farine|thon|saumon|poulet|jambon|lardons|courgettes?|tomates?|carottes?|[ée]pinards|brocolis?|champignons|haricots|p[âa]tes|spaghetti|penne|[œo]e?ufs|bananes?|pommes?|fraises|avoine|muesli|granola|feta|mozzarella|emmental|comt[ée]|houmous|gnocchis?|polenta|couscous|ratatouille|compote|confiture|miel|chocolat|sardines|maquereaux|crevettes|surimi|steak|dinde|baguette|pain)$/i;

// Nom court du produit, utilisable dans une phrase : "Pois chiches - Boîte 265g" -> "pois chiches".
function shortName(product: Product) {
  let n = product.name.split(/ - | – |,|\(|\//)[0];
  n = n.replace(/\s+(en (bo[îi]te|conserve|bocal|sachet)|au naturel|surgel[ée]e?s?|bio)\b/gi, "").replace(/\bn°\s?\d+/gi, "").replace(/\b\d+([.,]\d+)?\s?(g|kg|ml|cl|l|x)\b/gi, "").replace(/\s+/g, " ").trim() || product.name;
  // Un seul mot qui n'est pas un aliment courant = sans doute une marque ("Nutella") : on garde la majuscule.
  const single = !n.includes(" ");
  if (single && !COMMON_WORD.test(n)) return n;
  return /^[A-ZÀ-Ý][a-zà-ÿ]/.test(n) ? n.charAt(0).toLowerCase() + n.slice(1) : n;
}

function withArticle(name: string) {
  if (/s$|x$/i.test(name.split(" ")[0])) return `les ${name}`;
  if (startsVowel(name)) return `l'${name}`;
  return FEMININ.test(name) ? `la ${name}` : `le ${name}`;
}

const arts = (ps: Pick[]) => joinFr(ps.map((p) => p.item.art));
const courts = (ps: Pick[]) => ps.map((p) => p.item.court);

// ---------- Rôle du produit dans le plat ----------
const PRODUCT_ROLE: Record<Family, Role> = {
  "non-alimentaire": "proteine", boisson: "proteine",
  legumineuse: "proteine", feculent: "feculent", pain: "pain", volaille: "proteine", viande: "proteine",
  porc: "proteine", poisson: "proteine", oeuf: "proteine", tofu: "proteine", laitier: "laitier",
  fromage: "fromage", sucre: "topping", cereales: "flocons", fruit: "fruit", legume: "legume",
  sauce: "sauce", autre: "proteine",
};

// Comment préparer le produit, selon sa famille.
function prepProduct(c: Ctx): string | null {
  const P = c.Part;
  switch (c.family) {
    case "legumineuse": return `Rince et égoutte ${P} s'ils sortent d'une boîte (sinon, fais-les cuire selon le paquet).`;
    case "volaille":
    case "viande":
    case "porc": return `Coupe ${P} en morceaux et fais-les dorer 6 à 8 minutes à la poêle avec un filet d'huile, jusqu'à ce que ce soit bien cuit à cœur. Réserve.`;
    case "poisson": return `Prépare ${P} : émietté s'il est en boîte, ou cuit 3 à 4 minutes de chaque côté à la poêle s'il est frais.`;
    case "tofu": return `Coupe ${P} en cubes et fais-les dorer 5 minutes à la poêle.`;
    case "legume": return `Lave ${P} et coupe-les en morceaux (s'ils sont surgelés, utilise-les directement).`;
    case "feculent": return /pommes? de terre|patate|gnocchi/i.test(c.P)
      ? `Fais cuire ${P} 15 minutes dans l'eau bouillante salée (ou selon le paquet), puis égoutte.`
      : `Fais cuire ${P} dans une grande casserole d'eau bouillante salée, selon le temps indiqué sur le paquet, puis égoutte.`;
    default: return null;
  }
}

function cookFeculent(p: Pick | undefined): string | null {
  if (!p) return null;
  const a = p.item.art;
  switch (p.item.id) {
    case "semoule": return `Verse ${a} dans un saladier, couvre d'eau bouillante salée à hauteur, couvre 5 minutes puis égraine à la fourchette.`;
    case "pdt":
    case "patate": return `Épluche ${a}, coupe-les en cubes et fais-les cuire 15 minutes dans l'eau bouillante salée.`;
    default: return `Fais cuire ${a} dans une casserole d'eau bouillante salée, selon le temps indiqué sur le paquet, puis égoutte.`;
  }
}

// Préparation d'une protéine d'appoint (pas le produit scanné).
function prepProtein(p: Pick | undefined, cut = "en deux"): string | null {
  if (!p) return null;
  const a = p.item.art;
  switch (p.item.id) {
    case "oeufs": return `Fais cuire ${a} 9 minutes dans l'eau bouillante (œufs durs), puis écale-les et coupe-les ${cut}.`;
    case "poulet": return `Coupe ${a} en morceaux et fais-le dorer 6 à 8 minutes à la poêle avec un filet d'huile, jusqu'à ce qu'il soit bien cuit à cœur.`;
    case "tofu": return `Coupe ${a} en cubes et fais-le dorer 5 minutes à la poêle.`;
    case "thon": return `Égoutte et émiette ${a}.`;
    default: return `Rince et égoutte ${a}.`;
  }
}

const get = (c: Ctx, role: Role) => c.picks.filter((p) => p.role === role);
const one = (c: Ctx, role: Role) => get(c, role)[0];
const isProtein = (f: Family) => ["legumineuse", "volaille", "viande", "porc", "poisson", "oeuf", "tofu", "autre"].includes(f);

// ---------- Les styles de plats ----------
const STYLES: Record<string, Style> = {
  poelee: {
    id: "poelee", sweet: false, time: 25,
    slots: [
      { role: "feculent", pool: "feculent" },
      { role: "legume", pool: "legume", count: 2 },
      { role: "proteine", pool: "proteine" },
      { role: "gras", pool: ["huile"] },
      { role: "aromate", pool: "aromate", count: 2 },
    ],
    title: (c) => `Poêlée ${de(joinFr([c.P, ...courts(get(c, "legume"))].slice(0, 3)))}`,
    steps: (c) => {
      const legs = get(c, "legume"), prot = one(c, "proteine"), fec = one(c, "feculent");
      return [
        cookFeculent(fec),
        prepProduct(c),
        prot?.item.id !== "oeufs" ? prepProtein(prot) : null,
        legs.length ? `Lave et coupe ${arts(legs)} en petits morceaux.` : null,
        `Fais chauffer ${one(c, "gras")?.item.art ?? "un filet d'huile"} dans une grande poêle à feu moyen, puis ajoute ${arts(get(c, "aromate"))} pendant 1 minute.`,
        legs.length ? `Ajoute ${arts(legs)} et laisse cuire 8 à 10 minutes en remuant de temps en temps.` : null,
        prot?.item.id === "oeufs" ? `Pousse les légumes sur le côté, casse ${prot.item.art} dans la poêle et brouille-les 2 minutes.` : prot ? `Ajoute ${prot.item.art} et laisse cuire encore 3 minutes.` : null,
        !["volaille", "viande", "porc", "tofu", "feculent"].includes(c.family) ? `Ajoute ${c.Part} et réchauffe 3 minutes.` : `Remets ${c.Part} dans la poêle et mélange bien.`,
        `Sale, poivre et sers bien chaud${fec ? ` avec ${fec.item.art}` : ""}.`,
      ].filter(Boolean) as string[];
    },
  },
  bowl: {
    id: "bowl", sweet: false, time: 20,
    slots: [
      { role: "feculent", pool: "feculentFroid" },
      { role: "legume", pool: "crudite", count: 2 },
      { role: "proteine", pool: "proteine" },
      { role: "sauce", pool: "sauceBowl" },
      { role: "gras", pool: ["huile"] },
      { role: "topping", pool: ["graines", "amandes"], opt: true },
    ],
    title: (c) => `Bowl ${de(joinFr([c.P, one(c, "feculent")?.item.court, ...courts(get(c, "legume"))].filter(Boolean).slice(0, 3) as string[]))}`,
    steps: (c) => {
      const legs = get(c, "legume"), sauce = one(c, "sauce"), top = one(c, "topping"), prot = one(c, "proteine");
      return [
        cookFeculent(one(c, "feculent")),
        prepProduct(c),
        prepProtein(prot),
        legs.length ? `Lave et coupe ${arts(legs)} en dés ou en fines tranches.` : null,
        sauce?.item.id === "yaourtgrec" ? `Prépare la sauce : mélange le yaourt grec avec un peu de sel, de poivre et un filet d'huile d'olive.`
          : sauce?.item.id === "soja" ? `Prépare la sauce : mélange la sauce soja avec l'huile d'olive.`
          : `Prépare la sauce : mélange le jus du citron avec l'huile d'olive, du sel et du poivre.`,
        `Dans deux grands bols, dispose côte à côte ${c.Part}, ${joinFr([one(c, "feculent")?.item.art, ...legs.map((l) => l.item.art), prot?.item.art].filter(Boolean) as string[])}.`,
        `Verse la sauce${top ? ` et parsème ${top.item.art}` : ""}. C'est prêt !`,
      ].filter(Boolean) as string[];
    },
  },
  curry: {
    id: "curry", sweet: false, time: 30,
    slots: [
      { role: "feculent", pool: "feculentCurry" },
      { role: "legume", pool: ["oignon"] },
      { role: "legume", pool: ["epinards", "courgette", "poivron", "butternut", "brocoli"] },
      { role: "proteine", pool: ["poischiches", "tofu", "lentilles", "haricotsrouges", "poulet"] },
      { role: "sauce", pool: ["coco"] },
      { role: "gras", pool: ["huile"] },
      { role: "aromate", pool: ["curry"] },
      { role: "aromate", pool: ["ail", "gingembre"] },
    ],
    title: (c) => `Curry ${de(c.P)} au lait de coco`,
    steps: (c) => {
      const legs = get(c, "legume"), prot = one(c, "proteine");
      return [
        cookFeculent(one(c, "feculent")),
        prepProduct(c),
        `Émince ${arts(legs)}.`,
        `Dans une sauteuse, fais chauffer l'huile d'olive puis fais revenir ${arts(legs)} 5 minutes avec ${arts(get(c, "aromate"))}.`,
        `Verse le lait de coco, ajoute ${joinFr([c.Part, prot?.item.art].filter(Boolean) as string[])} et laisse mijoter 10 à 12 minutes à feu doux.`,
        `Goûte, ajuste le sel et sers avec ${one(c, "feculent")?.item.art ?? "un peu de pain"}.`,
      ].filter(Boolean) as string[];
    },
  },
  salade: {
    id: "salade", sweet: false, time: 15,
    slots: [
      { role: "feculent", pool: "feculentFroid" },
      { role: "legume", pool: "crudite", count: 3 },
      { role: "proteine", pool: "proteine" },
      { role: "fromage", pool: ["feta", "mozzarella"], opt: true },
      { role: "sauce", pool: ["citron"] },
      { role: "gras", pool: ["huile"] },
      { role: "aromate", pool: ["persil", "herbes"] },
    ],
    title: (c) => `Salade complète ${de(joinFr([c.P, ...courts(get(c, "legume"))].slice(0, 3)))}`,
    steps: (c) => {
      const legs = get(c, "legume"), prot = one(c, "proteine"), fro = one(c, "fromage");
      return [
        cookFeculent(one(c, "feculent")) ? `${cookFeculent(one(c, "feculent"))} Laisse refroidir.` : null,
        prepProduct(c),
        prepProtein(prot, "en quartiers"),
        `Lave et coupe ${arts(legs)} en petits morceaux.`,
        `Prépare la vinaigrette : le jus du citron, l'huile d'olive, sel et poivre.`,
        `Dans un saladier, mélange tout : ${joinFr([c.Part, ...legs.map((l) => l.item.art), prot?.item.art, one(c, "feculent")?.item.art].filter(Boolean) as string[])}.`,
        `Ajoute la vinaigrette, ${fro ? `${fro.item.art} en morceaux et ` : ""}${one(c, "aromate")?.item.art ?? "des herbes"}, puis mélange.`,
      ].filter(Boolean) as string[];
    },
  },
  soupe: {
    id: "soupe", sweet: false, time: 35,
    slots: [
      { role: "legume", pool: ["oignon"] },
      { role: "legume", pool: "legumeSoupe" },
      { role: "feculent", pool: ["pdt"] },
      { role: "sauce", pool: ["creme", "coco"], opt: true },
      { role: "gras", pool: ["huile"] },
      { role: "aromate", pool: ["cumin", "curry", "herbes"] },
      { role: "pain", pool: "pain", opt: true },
    ],
    title: (c) => `Velouté ${de(c.P)} et ${get(c, "legume")[1]?.item.court ?? get(c, "legume")[0]?.item.court ?? "légumes"}`,
    steps: (c) => {
      const legs = get(c, "legume"), pain = one(c, "pain"), sauce = one(c, "sauce");
      return [
        prepProduct(c),
        `Épluche et coupe en morceaux ${arts([...legs, ...get(c, "feculent")])}.`,
        `Dans une grande casserole, fais revenir le tout 3 minutes dans l'huile d'olive avec ${one(c, "aromate")?.item.art ?? "une épice"}.`,
        `Ajoute ${c.Part}, couvre d'eau à hauteur, sale et laisse cuire 20 minutes à petit feu.`,
        `Mixe finement${sauce ? ` en ajoutant ${sauce.item.art}` : ""}. Ajoute un peu d'eau si c'est trop épais.`,
        `Sers bien chaud${pain ? ` avec ${pain.item.art}` : ""}.`,
      ].filter(Boolean) as string[];
    },
  },
  gratin: {
    id: "gratin", sweet: false, time: 40,
    slots: [
      { role: "legume", pool: ["courgette", "brocoli", "epinards", "aubergine", "butternut"] },
      { role: "feculent", pool: ["pdt", "pates", "patate"] },
      { role: "sauce", pool: ["creme", "tomatesconcassees"] },
      { role: "fromage", pool: "fromage" },
      { role: "aromate", pool: ["ail", "herbes"] },
    ],
    title: (c) => `Gratin ${de(c.P)} et ${one(c, "legume")?.item.court ?? "légumes"}`,
    steps: (c) => {
      const leg = one(c, "legume"), fro = one(c, "fromage");
      return [
        `Préchauffe le four à 200 °C.`,
        cookFeculent(one(c, "feculent")),
        prepProduct(c),
        leg ? `Coupe ${leg.item.art} en morceaux et fais-les précuire 5 minutes à la poêle (ou au micro-ondes).` : null,
        `Dans un plat à gratin, mélange ${joinFr([c.Part, leg?.item.art, one(c, "feculent")?.item.art].filter(Boolean) as string[])} avec ${one(c, "sauce")?.item.art ?? "un peu de sauce tomate"} et ${arts(get(c, "aromate"))}. Sale et poivre.`,
        fro ? `Recouvre avec ${fro.item.art}.` : `Parsème de chapelure ou de graines.`,
        `Enfourne 20 minutes, jusqu'à ce que le dessus soit doré.`,
      ].filter(Boolean) as string[];
    },
  },
  omelette: {
    id: "omelette", sweet: false, time: 15, needs: "oeuf",
    slots: [
      { role: "proteine", pool: ["oeufs"] },
      { role: "legume", pool: ["champignons", "epinards", "poivron", "courgette", "tomates"], count: 2 },
      { role: "fromage", pool: "fromage", opt: true },
      { role: "gras", pool: ["huile"] },
      { role: "aromate", pool: ["persil", "herbes"] },
      { role: "pain", pool: "pain", opt: true },
    ],
    title: (c) => c.family === "oeuf"
      ? `Omelette ${joinFr(courts(get(c, "legume")))}`
      : `Omelette ${de(c.P)} et ${one(c, "legume")?.item.court ?? "herbes"}`,
    steps: (c) => {
      const legs = get(c, "legume"), fro = one(c, "fromage"), pain = one(c, "pain");
      const eggs = c.family === "oeuf" ? c.Part : "les œufs";
      return [
        c.family !== "oeuf" ? prepProduct(c) : null,
        legs.length ? `Coupe ${arts(legs)} en petits morceaux et fais-les revenir 5 minutes à la poêle avec l'huile d'olive.` : null,
        `Dans un bol, bats ${eggs} avec ${one(c, "aromate")?.item.art ?? "des herbes"}, du sel et du poivre.`,
        `Verse les œufs dans la poêle${c.family !== "oeuf" ? ` et ajoute ${c.Part}` : ""}. Laisse cuire 4 à 5 minutes à feu moyen.`,
        fro ? `Ajoute ${fro.item.art}, plie l'omelette en deux et laisse fondre 1 minute.` : `Plie l'omelette en deux.`,
        `Sers aussitôt${pain ? ` avec ${pain.item.art}` : ""}.`,
      ].filter(Boolean) as string[];
    },
  },
  tartines: {
    id: "tartines", sweet: false, time: 10,
    slots: [
      { role: "pain", pool: "pain" },
      { role: "legume", pool: ["tomates", "concombre", "salade", "poivron"], count: 2 },
      { role: "proteine", pool: ["oeufs", "thon", "poischiches", "tofu"] },
      { role: "sauce", pool: ["yaourtgrec", "citron"] },
      { role: "aromate", pool: ["herbes", "persil"] },
    ],
    title: (c) => `Tartines ${de(joinFr([c.P, ...courts(get(c, "legume"))].slice(0, 3)))}`,
    steps: (c) => {
      const legs = get(c, "legume"), prot = one(c, "proteine");
      return [
        prepProduct(c),
        prepProtein(prot, "en rondelles"),
        `Fais griller ${one(c, "pain")?.item.art ?? "le pain"}.`,
        `Lave et coupe ${arts(legs)} en fines tranches.`,
        `Tartine ${one(c, "sauce")?.item.id === "yaourtgrec" ? "le yaourt grec" : "un filet de citron et d'huile"} sur le pain, puis garnis avec ${joinFr([c.Part, prot?.item.art, ...legs.map((l) => l.item.art)].filter(Boolean) as string[])}.`,
        `Parsème ${one(c, "aromate")?.item.art ?? "d'herbes"} et déguste.`,
      ].filter(Boolean) as string[];
    },
  },
  porridge: {
    id: "porridge", sweet: true, time: 10,
    slots: [
      { role: "flocons", pool: "flocons" },
      { role: "liquide", pool: "liquide" },
      { role: "fruit", pool: "fruit" },
      { role: "topping", pool: "topping", opt: true },
      { role: "aromate", pool: ["cannelle"] },
    ],
    title: (c) => `Porridge ${c.P} et ${one(c, "fruit")?.item.court ?? "cannelle"}`,
    steps: (c) => {
      const fruit = one(c, "fruit"), top = one(c, "topping");
      return [
        `Dans une petite casserole, verse ${joinFr([one(c, "flocons")?.item.art ?? c.Part, one(c, "liquide")?.item.art ?? "le lait"])} et la cannelle.`,
        `Fais chauffer 4 à 5 minutes à feu doux en remuant, jusqu'à ce que ce soit crémeux.`,
        fruit ? `Pendant ce temps, coupe ${fruit.item.art} en morceaux.` : null,
        `Verse le porridge dans un bol et ajoute ${joinFr([c.family === "cereales" || c.family === "laitier" && c.P.includes("lait") ? null : c.Part, fruit?.item.art, top?.item.art].filter(Boolean) as string[])}.`,
      ].filter(Boolean) as string[];
    },
  },
  pancakes: {
    id: "pancakes", sweet: true, time: 25,
    slots: [
      { role: "farine", pool: "farine" },
      { role: "liant", pool: "oeufOuBanane" },
      { role: "liquide", pool: "liquide" },
      { role: "fruit", pool: "fruit" },
      { role: "gras", pool: ["huile"] },
    ],
    title: (c) => `Pancakes ${c.P} et ${one(c, "fruit")?.item.court ?? "fruits"}`,
    steps: (c) => {
      const liant = one(c, "liant"), fruit = one(c, "fruit");
      return [
        `Dans un saladier, mélange ${one(c, "farine")?.item.art ?? "la farine"} avec une pincée de sel${c.family === "cereales" ? ` et ${c.Part} mixés` : ""}.`,
        liant?.item.id === "banane" ? `Écrase la banane à la fourchette et ajoute-la.` : `Ajoute ${liant?.item.art ?? "les œufs"} et mélange.`,
        `Verse ${one(c, "liquide")?.item.art ?? "le lait"} petit à petit en fouettant, jusqu'à obtenir une pâte lisse et épaisse.`,
        `Fais chauffer une poêle légèrement huilée et verse une petite louche de pâte. Retourne au bout de 2 minutes, quand des bulles apparaissent.`,
        `Sers les pancakes avec ${joinFr([c.family === "cereales" ? null : c.Part, fruit?.item.art].filter(Boolean) as string[])}.`,
      ].filter(Boolean) as string[];
    },
  },
  bolSucre: {
    id: "bolSucre", sweet: true, time: 5,
    slots: [
      { role: "laitier", pool: "laitier" },
      { role: "fruit", pool: "fruit" },
      { role: "flocons", pool: "flocons" },
      { role: "topping", pool: "topping", opt: true },
    ],
    title: (c) => `Bol gourmand ${c.P} et ${one(c, "fruit")?.item.court ?? "fruits"}`,
    steps: (c) => {
      const fruit = one(c, "fruit"), top = one(c, "topping");
      return [
        fruit ? `Coupe ${fruit.item.art} en morceaux.` : null,
        `Dans un bol, verse ${one(c, "laitier")?.item.art ?? c.Part}.`,
        `Ajoute par-dessus ${joinFr([c.family === "laitier" ? null : c.Part, fruit?.item.art, one(c, "flocons")?.item.art, top?.item.art].filter(Boolean) as string[])}.`,
        `Déguste tout de suite, ou prépare-le la veille et garde-le au frais.`,
      ].filter(Boolean) as string[];
    },
  },
};

const FAMILY_STYLES: Record<Family, string[]> = {
  "non-alimentaire": [], boisson: [],
  legumineuse: ["curry", "salade", "bowl", "soupe"],
  feculent: ["poelee", "salade", "bowl", "gratin"],
  pain: ["tartines"],
  volaille: ["poelee", "bowl", "curry", "salade"],
  viande: ["poelee", "bowl", "salade"],
  porc: ["poelee", "salade", "omelette"],
  poisson: ["salade", "bowl", "poelee"],
  tofu: ["poelee", "curry", "bowl"],
  oeuf: ["omelette", "bowl", "salade"],
  laitier: ["bolSucre", "porridge", "pancakes"],
  fromage: ["gratin", "salade", "tartines", "omelette"],
  sucre: ["porridge", "pancakes", "bolSucre"],
  cereales: ["porridge", "bolSucre", "pancakes"],
  fruit: ["bolSucre", "porridge", "pancakes"],
  legume: ["poelee", "soupe", "gratin", "curry", "omelette"],
  sauce: ["bowl", "poelee"],
  autre: ["bowl", "poelee", "salade"],
};

// Styles préférés selon l'objectif (les premiers sont proposés en premier).
const GOAL_PREF: Record<Goal, string[]> = {
  perte: ["salade", "soupe", "poelee", "omelette", "bowl", "bolSucre", "curry", "porridge", "tartines", "gratin", "pancakes"],
  masse: ["bowl", "curry", "poelee", "gratin", "pancakes", "porridge", "omelette", "salade", "tartines", "bolSucre", "soupe"],
  maintien: ["poelee", "bowl", "salade", "curry", "omelette", "porridge", "bolSucre", "soupe", "gratin", "tartines", "pancakes"],
  curiosite: ["curry", "bowl", "pancakes", "gratin", "soupe", "salade", "poelee", "porridge", "omelette", "bolSucre", "tartines"],
};

// ---------- Régime : étiquettes interdites ----------
function bannedTags(diets: Diet[]): Set<Tag> {
  const b = new Set<Tag>();
  const add = (...t: Tag[]) => t.forEach((x) => b.add(x));
  for (const d of diets) {
    if (d === "vegetarien") add("viande", "porc", "poisson");
    if (d === "vegan") add("viande", "porc", "poisson", "lait", "oeuf", "animal");
    if (d === "sans-gluten") add("gluten");
    if (d === "sans-lactose") add("lait");
    if (d === "halal") add("porc", "alcool");
    if (d === "sans-porc") add("porc");
    if (d === "arachides") add("arachides");
    if (d === "fruits-a-coque") add("fruits-a-coque");
    if (d === "oeufs") add("oeuf");
    if (d === "poissons") add("poisson");
  }
  return b;
}

const norm = (s: string) => s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/œ/g, "oe");

function hash(s: string) {
  let h = 0;
  for (const ch of s) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  return h;
}

const GOAL_FACTOR: Record<Goal, Partial<Record<Role, number>>> = {
  perte: { legume: 1.4, feculent: 0.6, gras: 0.6, fromage: 0.7 },
  masse: { feculent: 1.35, proteine: 1.3, flocons: 1.3 },
  maintien: {},
  curiosite: {},
};

const TIPS: Record<Goal, string[]> = {
  perte: [
    "Commence ton assiette par les légumes : ils calent bien pour peu de calories.",
    "Prépare une double portion et garde-la pour demain midi : pratique, et pas de grignotage.",
    "Les protéines de ce plat t'aident à tenir jusqu'au prochain repas sans fringale.",
  ],
  masse: [
    "Ajoute une poignée de graines ou un œuf pour encore plus de protéines.",
    "Mange ce plat dans les 2 heures qui suivent ta séance pour bien récupérer.",
    "Les jours d'entraînement intense, augmente un peu la portion de féculents.",
  ],
  maintien: [
    "Varie les légumes selon la saison : c'est meilleur et moins cher.",
    "Une assiette équilibrée, c'est une moitié de légumes, un quart de féculents et un quart de protéines.",
    "Ce plat se garde 2 jours au frais dans une boîte hermétique.",
  ],
  curiosite: [
    "Change d'épice à chaque fois : cumin, paprika fumé ou gingembre transforment complètement le plat.",
    "Ajoute des herbes fraîches au dernier moment pour un maximum de parfum.",
    "Tente une touche acidulée (citron, vinaigre) juste avant de servir : ça réveille tout le plat.",
  ],
};

// ---------- Affichage des quantités ----------
const round = (g: number) => (g < 30 ? Math.max(5, Math.round(g / 5) * 5) : Math.round(g / 10) * 10);

function qty(item: CatalogItem, totalG: number): string {
  if (item.fixe) return item.fixe.label;
  if (item.piece) {
    const n = Math.max(1, Math.round(totalG / item.piece.g));
    return `${n} ${n > 1 ? item.piece.many : item.piece.one}`;
  }
  return `${round(totalG)} ${item.ml ? "ml" : "g"}`;
}

function cost(item: CatalogItem, totalG: number) {
  if (item.fixe) return item.fixe.prix;
  if (item.piece) return (Math.max(1, Math.round(totalG / item.piece.g)) * item.piece.g * item.prix) / 100;
  return (totalG * item.prix) / 100;
}

// =====================================================================
export type DemoResult = { ok: true; recipe: Recipe } | { ok: false; error: string };

export function demoRecipe(profile: Profile, product: Product, variant = 0): DemoResult {
  const family = detectFamily(product);
  if (family === "non-alimentaire") {
    return { ok: false, error: `Oups, « ${product.name} » ne se mange pas ! Scanne plutôt un aliment et je te trouve une recette.` };
  }
  if (family === "boisson") {
    return { ok: false, error: `« ${product.name} » est une boisson : difficile d'en faire le cœur d'une recette. Scanne plutôt un aliment !` };
  }

  const banned = bannedTags(profile.diets);
  const halal = profile.diets.includes("halal");
  const goal = profile.goal;
  const target = computeNeeds(profile).perMeal;
  const seed = hash(norm(product.name)) + variant * 7;

  // 1) Choix du style
  const allowed = FAMILY_STYLES[family].filter((id) => {
    const s = STYLES[id];
    return !s.needs || family === "oeuf" || !banned.has(s.needs);
  });
  const pref = GOAL_PREF[goal];
  const ordered = [...allowed].sort((a, b) => pref.indexOf(a) - pref.indexOf(b));
  const style = STYLES[ordered[variant % ordered.length]];

  // 2) Choix des ingrédients
  const productRole = PRODUCT_ROLE[family];
  const productNorm = norm(product.name);
  const used = new Set<string>();
  const picks: Pick[] = [];
  let roleSkipped = false;

  style.slots.forEach((slot, si) => {
    if (!roleSkipped && slot.role === productRole) {
      // Le produit scanné prend cette place (une seule fois).
      roleSkipped = true;
      if ((slot.count ?? 1) <= 1) return;
      slot = { ...slot, count: (slot.count ?? 1) - 1 };
    }
    if (slot.opt && goal === "perte" && ["topping", "fromage", "pain", "sauce"].includes(slot.role)) return; // perte de poids : on allège
    if (slot.role === "proteine" && isProtein(family)) return;

    const ids = typeof slot.pool === "string" ? [...POOLS[slot.pool]] : slot.pool;
    let candidates = ids
      .map((id) => CATALOG[id])
      .filter((it) => !(it.tags ?? []).some((t) => banned.has(t)))
      .filter((it) => !used.has(it.id))
      .filter((it) => !productNorm.includes(norm(it.court)) && !norm(it.court).includes(productNorm));
    if (slot.role === "aromate" && goal === "curiosite") {
      const exo = POOLS.epiceExotique.map((id) => CATALOG[id]).filter((it) => !used.has(it.id));
      if (exo.length) candidates = exo;
    }
    if (!candidates.length) return;

    const count = Math.min(slot.count ?? 1, candidates.length);
    for (let k = 0; k < count; k++) {
      // Rotation déterministe : le même produit donne la même recette, "une autre" en donne une nouvelle.
      const idx = (seed + si * 3 + k) % candidates.length;
      const it = candidates.splice(idx, 1)[0];
      used.add(it.id);
      const nom = halal && it.tags?.includes("viande") ? `${it.nom} halal` : it.nom;
      picks.push({ item: { ...it, nom }, g: it.g * (GOAL_FACTOR[goal][slot.role] ?? 1), role: slot.role, opt: !!slot.opt });
    }
  });

  // Prise de masse : un petit plus protéiné si possible.
  if (goal === "masse" && !style.sweet && !picks.some((p) => p.role === "topping")) {
    const extra = ["graines", "feta", "amandes"].map((id) => CATALOG[id]).find((it) => !(it.tags ?? []).some((t) => banned.has(t)) && !used.has(it.id));
    if (extra) picks.push({ item: extra, g: extra.g, role: "topping", opt: true });
  }

  // 3) Le produit scanné
  const info = FAMILY_INFO[family];
  const n = product.nutriments;
  const pk = n.kcal ?? info.kcal;
  const prodNut = { kcal: pk, p: n.proteins ?? info.p, c: n.carbs ?? info.c, f: n.fat ?? info.f };
  let prodG = info.g;
  if (family === "feculent" && pk < 150) prodG = 220; // pommes de terre, gnocchis, féculents déjà cuits
  if (family === "laitier" && /\blait\b|boisson/i.test(product.name)) prodG = 200;
  prodG *= GOAL_FACTOR[goal][productRole] ?? 1;

  // 4) Ajustement des quantités pour viser l'objectif calorique par repas
  const kcalOf = (g: number, k: number) => (g * k) / 100;
  const total = () => picks.reduce((s, p) => s + kcalOf(p.g, p.item.kcal), 0) + kcalOf(prodG, prodNut.kcal);
  const scalableRoles: Role[] = ["feculent", "proteine", "flocons", "farine", "pain", "laitier", "liquide"];
  const productScalable = !["sucre", "sauce", "fromage", "legume"].includes(family);
  const scalableKcal = () =>
    picks.filter((p) => scalableRoles.includes(p.role)).reduce((s, p) => s + kcalOf(p.g, p.item.kcal), 0) +
    (productScalable ? kcalOf(prodG, prodNut.kcal) : 0);
  const sk = scalableKcal();
  if (sk > 0) {
    const factor = Math.min(2.2, Math.max(0.55, 1 + (target - total()) / sk));
    picks.forEach((p) => { if (scalableRoles.includes(p.role)) p.g *= factor; });
    if (productScalable) prodG *= factor;
  }
  // Les produits très riches (pâte à tartiner, sauce, fromage) restent en petite quantité.
  if (family === "sucre") prodG = Math.min(prodG, 25);

  // 5) Budget : on retire les ingrédients facultatifs si on dépasse
  const portions = style.sweet ? 1 : 2;
  const productPrice = () => (prodG * portions * info.prix) / 100;
  const budget = () => picks.reduce((s, p) => s + cost(p.item, p.g * portions), 0) + productPrice();
  while (budget() > profile.budget && picks.some((p) => p.opt)) {
    const i = picks.findIndex((p) => p.opt);
    picks.splice(i, 1);
  }

  // 6) Calcul final des macros par portion
  let kcal = kcalOf(prodG, prodNut.kcal), p = (prodG * prodNut.p) / 100, c = (prodG * prodNut.c) / 100, f = (prodG * prodNut.f) / 100;
  for (const x of picks) {
    kcal += kcalOf(x.g, x.item.kcal);
    p += (x.g * x.item.p) / 100;
    c += (x.g * x.item.c) / 100;
    f += (x.g * x.item.f) / 100;
  }

  const P = shortName(product);
  const ctx: Ctx = { P, Part: withArticle(P), family, goal, picks };

  const enMain: Ingredient[] = [{
    nom: [product.name, product.brand].filter(Boolean).join(" — "),
    quantite: family === "oeuf" ? String(Math.max(1, Math.round((prodG * portions) / 55))) : `${round(prodG * portions)} g`,
  }];
  const aAcheter: Ingredient[] = picks.map((x) => {
    const pc = x.item.piece;
    if (pc && norm(x.item.nom).includes(norm(pc.one))) {
      // Ex. "Œufs" + "2 œufs" -> on affiche simplement "2" à côté de "Œufs" / "Œuf".
      const n = Math.max(1, Math.round((x.g * portions) / pc.g));
      return { nom: cap(n > 1 ? pc.many : pc.one) + x.item.nom.slice(pc.one.length).replace(/^s\b/, ""), quantite: String(n) };
    }
    return { nom: x.item.nom, quantite: qty(x.item, x.g * portions) };
  });

  const finalBudget = Math.round(budget() * 10) / 10;
  const tips = TIPS[goal];
  let astuce = tips[(seed + variant) % tips.length];
  if (finalBudget > profile.budget) {
    astuce = `Ce plat dépasse un peu ton budget (${profile.budget} €) : utilise des légumes surgelés, c'est moins cher. ${astuce}`;
  }

  return {
    ok: true,
    recipe: {
      nom: cap(style.title(ctx)),
      tempsTotal: style.time,
      portions,
      caloriesParPortion: Math.round(kcal / 10) * 10,
      macros: { proteines: Math.round(p), glucides: Math.round(c), lipides: Math.round(f) },
      enMain,
      aAcheter,
      budget: finalBudget,
      etapes: style.steps(ctx),
      astuce,
    },
  };
}
