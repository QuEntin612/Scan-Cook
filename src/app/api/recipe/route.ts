import { z } from "zod";
import { claudeRecipe } from "@/lib/claude";
import { demoRecipe } from "@/lib/demo/engine";
import type { Product } from "@/lib/product";
import { DEFAULT_PROFILE, DIETS, type Profile } from "@/lib/profile";
import type { RecipeResponse } from "@/lib/recipe";

// POST /api/recipe : reçoit le profil + le produit, renvoie une recette.
// - Avec une clé ANTHROPIC_API_KEY (dans .env.local ou sur Vercel) : recette générée par Claude.
// - Sans clé : recette du mode démo, gratuite.

const BodySchema = z.object({
  profile: z.object({
    goal: z.enum(["perte", "masse", "maintien", "curiosite"]),
    sex: z.enum(["femme", "homme"]),
    age: z.number().min(14).max(80),
    weight: z.number().min(35).max(160),
    height: z.number().min(130).max(215),
    activity: z.enum(["sedentaire", "leger", "modere", "tres"]),
    diets: z.array(z.enum(DIETS.map((d) => d.value) as [string, ...string[]])).max(11),
    budget: z.number().min(2).max(30),
  }),
  product: z.object({
    source: z.enum(["off", "manuel"]),
    code: z.string().max(20).optional(),
    name: z.string().trim().min(1).max(200),
    brand: z.string().max(200).optional(),
    quantity: z.string().max(100).optional(),
    image: z.string().max(500).optional(),
    nutriments: z.record(z.string(), z.number().optional()),
    allergens: z.array(z.string().max(80)).max(50),
    traces: z.array(z.string().max(80)).max(50),
    analysis: z.array(z.string().max(80)).max(50),
    categories: z.array(z.string().max(120)).max(80),
    ingredientsText: z.string().max(5000).optional(),
  }),
  variant: z.number().int().min(0).max(1000).default(0),
  exclude: z.array(z.string().max(200)).max(20).default([]),
});

export async function POST(req: Request) {
  let body: z.infer<typeof BodySchema>;
  try {
    body = BodySchema.parse(await req.json());
  } catch {
    return Response.json({ ok: false, error: "Demande invalide." } satisfies RecipeResponse, { status: 400 });
  }
  const profile = { ...DEFAULT_PROFILE, ...body.profile } as Profile;
  const product = body.product as Product;

  if (process.env.ANTHROPIC_API_KEY) {
    const result = await claudeRecipe(profile, product, body.exclude);
    if (result.ok) return Response.json({ ok: true, recipe: result.recipe, mode: "claude" } satisfies RecipeResponse);
    if (!result.retryWithDemo) return Response.json({ ok: false, error: result.error } satisfies RecipeResponse);
    // Claude indisponible : on bascule sur le mode démo pour que l'appli marche quand même.
  }

  const demo = demoRecipe(profile, product, body.variant);
  if (!demo.ok) return Response.json({ ok: false, error: demo.error } satisfies RecipeResponse);
  return Response.json({ ok: true, recipe: demo.recipe, mode: "demo" } satisfies RecipeResponse);
}
