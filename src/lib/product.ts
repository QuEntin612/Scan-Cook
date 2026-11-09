// Le "produit" tel que l'appli le manipule, quelle que soit sa source.

export type Nutriments = {
  kcal?: number;
  proteins?: number;
  carbs?: number;
  fat?: number;
  sugars?: number;
  fiber?: number;
  salt?: number;
};

export type Product = {
  source: "off" | "manuel"; // off = trouvé sur Open Food Facts, manuel = nom tapé à la main
  code?: string;
  name: string;
  brand?: string;
  quantity?: string;
  image?: string;
  nutriments: Nutriments; // pour 100 g
  allergens: string[]; // ex. ["en:milk", "en:nuts"]
  traces: string[];
  analysis: string[]; // ex. ["en:non-vegan", "en:vegetarian"]
  categories: string[];
  ingredientsText?: string;
};

// Champs demandés à Open Food Facts (on ne télécharge que ce qui sert).
export const OFF_FIELDS = [
  "code",
  "product_name",
  "product_name_fr",
  "generic_name_fr",
  "brands",
  "quantity",
  "image_front_small_url",
  "image_front_url",
  "nutriments",
  "allergens_tags",
  "traces_tags",
  "ingredients_analysis_tags",
  "categories_tags",
  "ingredients_text_fr",
  "ingredients_text",
].join(",");

type OffRaw = Record<string, unknown>;

const num = (v: unknown) => (typeof v === "number" && Number.isFinite(v) ? Math.round(v * 10) / 10 : undefined);
const str = (v: unknown) => (typeof v === "string" && v.trim() ? v.trim() : undefined);
const arr = (v: unknown) => (Array.isArray(v) ? v.filter((x): x is string => typeof x === "string") : []);

// Transforme la réponse brute d'Open Food Facts en Product propre.
export function fromOpenFoodFacts(raw: OffRaw): Product | null {
  const name = str(raw.product_name_fr) ?? str(raw.product_name) ?? str(raw.generic_name_fr);
  if (!name) return null;
  const n = (raw.nutriments ?? {}) as Record<string, unknown>;
  const brand = str(raw.brands)?.split(",")[0].trim();
  return {
    source: "off",
    code: str(raw.code),
    name,
    brand,
    quantity: str(raw.quantity)?.replace(/\s+e$/, ""), // "400 g e" -> "400 g"
    image: str(raw.image_front_small_url) ?? str(raw.image_front_url),
    nutriments: {
      kcal: num(n["energy-kcal_100g"]),
      proteins: num(n.proteins_100g),
      carbs: num(n.carbohydrates_100g),
      fat: num(n.fat_100g),
      sugars: num(n.sugars_100g),
      fiber: num(n.fiber_100g),
      salt: num(n.salt_100g),
    },
    allergens: arr(raw.allergens_tags),
    traces: arr(raw.traces_tags),
    analysis: arr(raw.ingredients_analysis_tags),
    categories: arr(raw.categories_tags),
    ingredientsText: str(raw.ingredients_text_fr) ?? str(raw.ingredients_text),
  };
}

// Produit créé à partir d'un simple nom ("pois chiches en boîte").
export function manualProduct(name: string): Product {
  return {
    source: "manuel",
    name: name.trim(),
    nutriments: {},
    allergens: [],
    traces: [],
    analysis: [],
    categories: [],
  };
}

// Un code-barres EAN-8 / EAN-13 (on tolère aussi UPC à 12 chiffres et 14 chiffres).
export function isBarcode(text: string) {
  return /^\d{8}$|^\d{12,14}$/.test(text.replace(/\s/g, ""));
}
