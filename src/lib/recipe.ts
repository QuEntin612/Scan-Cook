import { z } from "zod";

// Format d'une recette, partagé par le mode démo et le mode Claude.
// zod vérifie que les données ont exactement cette forme.

export const IngredientSchema = z.object({
  nom: z.string().describe("Nom de l'ingrédient, ex. « Courgette »"),
  quantite: z.string().describe("Quantité pour toute la recette, ex. « 200 g », « 2 », « 1 c. à soupe »"),
});

export const RecipeSchema = z.object({
  nom: z.string().describe("Nom de la recette"),
  tempsTotal: z.number().int().describe("Temps total préparation + cuisson, en minutes"),
  portions: z.number().int().describe("Nombre de portions"),
  caloriesParPortion: z.number().int().describe("Calories par portion (kcal)"),
  macros: z
    .object({
      proteines: z.number().describe("Protéines par portion, en grammes"),
      glucides: z.number().describe("Glucides par portion, en grammes"),
      lipides: z.number().describe("Lipides par portion, en grammes"),
    })
    .describe("Macronutriments par portion"),
  enMain: z.array(IngredientSchema).describe("Ingrédients déjà en main : le produit scanné"),
  aAcheter: z.array(IngredientSchema).describe("Ingrédients à acheter en plus"),
  budget: z.number().describe("Budget estimé de toute la recette, en euros"),
  etapes: z.array(z.string()).describe("Étapes de préparation, dans l'ordre, sans numéro au début"),
  astuce: z.string().describe("Une phrase d'astuce adaptée à l'objectif de l'utilisateur"),
});

// Réponse attendue de Claude : soit une recette, soit une erreur (produit non alimentaire...).
export const RecipeAnswerSchema = z.object({
  statut: z.enum(["recette", "erreur"]).describe("« erreur » seulement si le produit n'est pas un aliment"),
  messageErreur: z
    .string()
    .nullable()
    .describe("Si statut = erreur : message gentil expliquant le problème. Sinon null."),
  recette: RecipeSchema.nullable().describe("La recette si statut = recette, sinon null"),
});

export type Recipe = z.infer<typeof RecipeSchema>;
export type Ingredient = z.infer<typeof IngredientSchema>;

// Ce que renvoie notre route /api/recipe au navigateur.
export type RecipeResponse =
  | { ok: true; recipe: Recipe; mode: "claude" | "demo" }
  | { ok: false; error: string };
