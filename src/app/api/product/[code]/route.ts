import { fromOpenFoodFacts, isBarcode, OFF_FIELDS } from "@/lib/product";

// GET /api/product/3017620422003 -> infos du produit depuis Open Food Facts.
// On passe par notre serveur pour envoyer un "User-Agent" identifiant l'appli, comme le demande Open Food Facts.
export async function GET(_req: Request, ctx: RouteContext<"/api/product/[code]">) {
  const { code: rawCode } = await ctx.params;
  const code = rawCode.replace(/\s/g, "");
  if (!isBarcode(code)) {
    return Response.json({ error: "Code-barres invalide : il faut 8 ou 13 chiffres." }, { status: 400 });
  }
  try {
    const res = await fetch(
      `https://world.openfoodfacts.org/api/v2/product/${code}.json?fields=${OFF_FIELDS}`,
      {
        headers: { "User-Agent": "ScanAndCook/0.1 (projet ecole)" },
        signal: AbortSignal.timeout(10000),
      },
    );
    if (res.status === 404) {
      return Response.json({ error: "Produit introuvable." }, { status: 404 });
    }
    if (!res.ok) throw new Error(`Open Food Facts a répondu ${res.status}`);
    const data = (await res.json()) as { status?: number; product?: Record<string, unknown> };
    const product = data.status === 1 && data.product ? fromOpenFoodFacts({ code, ...data.product }) : null;
    if (!product) return Response.json({ error: "Produit introuvable." }, { status: 404 });
    return Response.json({ product });
  } catch (e) {
    console.error("Erreur Open Food Facts", e);
    return Response.json(
      { error: "Open Food Facts ne répond pas. Réessaie ou tape le nom du produit." },
      { status: 502 },
    );
  }
}
