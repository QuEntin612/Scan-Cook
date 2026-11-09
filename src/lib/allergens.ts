import type { Diet } from "./profile";
import type { Product } from "./product";

// Correspondance entre les choix de l'utilisateur et les étiquettes d'allergènes d'Open Food Facts.
const ALLERGEN_TAGS: Partial<Record<Diet, { tags: string[]; label: string }>> = {
  arachides: { tags: ["en:peanuts"], label: "des arachides" },
  "fruits-a-coque": { tags: ["en:nuts"], label: "des fruits à coque" },
  oeufs: { tags: ["en:eggs"], label: "des œufs" },
  poissons: { tags: ["en:fish", "en:crustaceans", "en:molluscs"], label: "du poisson ou des fruits de mer" },
  "sans-gluten": { tags: ["en:gluten"], label: "du gluten" },
  "sans-lactose": { tags: ["en:milk"], label: "du lait (lactose)" },
};

const PORK_WORDS = /\b(porc|lard|lardons?|jambon|saindoux|g[ée]latine de porc|chorizo|bacon|pancetta)\b/i;
const ALCOHOL_WORDS = /\b(vin|alcool|rhum|bi[èe]re|cognac|liqueur)\b/i;

export type Warning = { level: "contient" | "traces" | "doute"; text: string };

// Renvoie la liste des alertes à afficher AVANT de proposer une recette.
export function productWarnings(product: Product, diets: Diet[]): Warning[] {
  const out: Warning[] = [];
  for (const d of diets) {
    const rule = ALLERGEN_TAGS[d];
    if (!rule) continue;
    if (product.allergens.some((t) => rule.tags.includes(t))) {
      out.push({ level: "contient", text: `Ce produit contient ${rule.label}.` });
    } else if (product.traces.some((t) => rule.tags.includes(t))) {
      out.push({ level: "traces", text: `Ce produit peut contenir des traces ${rule.label.replace(/^d(es|u) /, "de ")}.` });
    }
  }
  const a = product.analysis;
  if (diets.includes("vegan") && a.includes("en:non-vegan")) {
    out.push({ level: "contient", text: "Ce produit n'est pas vegan." });
  } else if (diets.includes("vegan") && a.includes("en:maybe-vegan")) {
    out.push({ level: "doute", text: "Ce produit n'est peut-être pas vegan." });
  }
  if ((diets.includes("vegetarien") || diets.includes("vegan")) && a.includes("en:non-vegetarian")) {
    out.push({ level: "contient", text: "Ce produit n'est pas végétarien." });
  }
  const ingredients = product.ingredientsText ?? "";
  if ((diets.includes("sans-porc") || diets.includes("halal")) && PORK_WORDS.test(ingredients + " " + product.name)) {
    out.push({ level: "contient", text: "Ce produit semble contenir du porc." });
  }
  if (diets.includes("halal") && ALCOHOL_WORDS.test(ingredients)) {
    out.push({ level: "doute", text: "Ce produit semble contenir de l'alcool." });
  }
  return out;
}
