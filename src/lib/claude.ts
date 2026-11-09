import Anthropic from "@anthropic-ai/sdk";
import { betaZodOutputFormat } from "@anthropic-ai/sdk/helpers/beta/zod";
import { productWarnings } from "./allergens";
import type { Product } from "./product";
import { ACTIVITIES, computeNeeds, DIETS, GOALS, type Profile } from "./profile";
import { RecipeAnswerSchema, type Recipe } from "./recipe";

// =====================================================================
// MODE CLAUDE : génération de la recette par l'IA d'Anthropic.
// Ce fichier n'est utilisé QUE côté serveur (dans /api/recipe) :
// la clé ANTHROPIC_API_KEY n'est jamais envoyée au navigateur.
// =====================================================================

export const CLAUDE_MODEL = "claude-sonnet-5-5"; // le modèle Claude Sonnet le plus récent

export const SYSTEM_PROMPT = `Tu es Scan & Cook, un coach cuisine bienveillant. Réponds toujours en français et tutoie l'utilisateur.

Ta mission : à partir d'un produit scanné en supermarché et du profil de l'utilisateur, propose UNE recette.

Règles :
- La recette DOIT utiliser le produit scanné comme ingrédient principal.
- Respecte strictement le régime et les allergies de l'utilisateur. En cas de doute sur un ingrédient, ne l'utilise pas.
- Respecte le budget maximum et vise l'objectif calorique par repas (calories par portion).
- Perte de poids : plats rassasiants, riches en protéines et en légumes. Prise de masse : plats riches en protéines et en calories. Maintien : plats équilibrés. Curiosité culinaire : recettes originales et variées.
- Ingrédients faciles à trouver en supermarché français, prix réalistes en euros.
- Calories, macronutriments et prix sont des estimations cohérentes : calcule-les à partir des quantités.
- Ne donne jamais de conseil médical.
- Si le produit scanné n'est pas un aliment (lessive, cosmétique, nourriture pour animaux...), réponds avec statut "erreur" et un message clair et gentil.
- Si le produit contient un allergène déclaré par l'utilisateur, commence l'astuce par un avertissement clair (l'appli a déjà prévenu l'utilisateur, qui a choisi de continuer).
- "enMain" contient uniquement le produit scanné avec la quantité utilisée. "aAcheter" contient tout le reste.
- Les étapes sont courtes, claires et dans l'ordre, sans numéro au début.`;

function describe(profile: Profile, product: Product, exclude: string[]) {
  const needs = computeNeeds(profile);
  const goal = GOALS.find((g) => g.value === profile.goal)?.label;
  const activity = ACTIVITIES.find((a) => a.value === profile.activity)?.label;
  const diets = profile.diets.filter((d) => d !== "aucun").map((d) => DIETS.find((x) => x.value === d)?.label);
  const n = product.nutriments;
  const warnings = productWarnings(product, profile.diets).map((w) => w.text);

  return `PROFIL
- Objectif : ${goal}
- ${profile.sex === "homme" ? "Homme" : "Femme"}, ${profile.age} ans, ${profile.weight} kg, ${profile.height} cm, ${activity}
- Régime et allergies : ${diets.length ? diets.join(", ") : "aucun"}
- Budget maximum pour la recette : ${profile.budget} €
- Objectif calorique par repas : environ ${needs.perMeal} kcal par portion

PRODUIT SCANNÉ
- Nom : ${product.name}${product.brand ? ` (${product.brand})` : ""}${product.quantity ? `, ${product.quantity}` : ""}
- Pour 100 g : ${n.kcal ?? "?"} kcal, protéines ${n.proteins ?? "?"} g, glucides ${n.carbs ?? "?"} g, lipides ${n.fat ?? "?"} g
- Allergènes déclarés : ${product.allergens.join(", ") || "aucun connu"}
- Ingrédients : ${product.ingredientsText?.slice(0, 600) ?? "inconnus"}
- Catégories : ${product.categories.slice(-4).join(", ") || "inconnues"}
${warnings.length ? `\nALERTES (le produit ne correspond pas au profil) : ${warnings.join(" ")}` : ""}
${exclude.length ? `\nPropose une recette DIFFÉRENTE de celles-ci : ${exclude.join(" ; ")}.` : ""}`;
}

export type ClaudeResult =
  | { ok: true; recipe: Recipe }
  | { ok: false; error: string; retryWithDemo: boolean };

export async function claudeRecipe(profile: Profile, product: Product, exclude: string[]): Promise<ClaudeResult> {
  const client = new Anthropic(); // lit automatiquement ANTHROPIC_API_KEY

  try {
    const response = await client.beta.messages.parse(
      {
        model: CLAUDE_MODEL,
        max_tokens: 16000,
        system: SYSTEM_PROMPT,
        messages: [{ role: "user", content: describe(profile, product, exclude) }],
        // Effort "low" : réponse rapide, c'est le cœur de l'appli ("le bip, puis la recette tout de suite").
        output_config: { effort: "low", format: betaZodOutputFormat(RecipeAnswerSchema) },
        // Si Claude refuse de répondre pour une raison de sécurité, l'API réessaie toute seule avec un autre modèle.
        betas: ["server-side-fallback-2026-07-01"],
        fallbacks: "default",
      },
      { timeout: 60_000 },
    );

    if (response.stop_reason === "refusal") {
      return { ok: false, error: "Je ne peux pas proposer de recette avec ce produit.", retryWithDemo: false };
    }
    if (response.stop_reason === "max_tokens") {
      return { ok: false, error: "La recette était trop longue, réessaie.", retryWithDemo: true };
    }
    const answer = response.parsed_output;
    if (!answer) return { ok: false, error: "Réponse illisible.", retryWithDemo: true };
    if (answer.statut === "erreur" || !answer.recette) {
      return { ok: false, error: answer.messageErreur ?? "Ce produit ne semble pas être un aliment.", retryWithDemo: false };
    }
    return { ok: true, recipe: answer.recette };
  } catch (error) {
    // Erreurs typées du SDK : on les journalise côté serveur, l'utilisateur reçoit un message simple.
    if (error instanceof Anthropic.AuthenticationError) console.error("Clé API Anthropic invalide.");
    else if (error instanceof Anthropic.RateLimitError) console.error("Limite de requêtes Anthropic atteinte.");
    else if (error instanceof Anthropic.APIError) console.error(`Erreur API Anthropic ${error.status}:`, error.message);
    else console.error("Erreur pendant l'appel à Claude :", error);
    return { ok: false, error: "Claude ne répond pas pour le moment.", retryWithDemo: true };
  }
}
