import type { NextRequest } from "next/server";
import { fromOpenFoodFacts, OFF_FIELDS, type Product } from "@/lib/product";

// GET /api/search?q=pois chiches -> jusqu'à 5 produits correspondants sur Open Food Facts.
export async function GET(req: NextRequest) {
  const q = (req.nextUrl.searchParams.get("q") ?? "").trim().slice(0, 80);
  if (q.length < 2) return Response.json({ products: [] });
  const url = new URL("https://world.openfoodfacts.org/cgi/search.pl");
  url.search = new URLSearchParams({
    search_terms: q,
    search_simple: "1",
    action: "process",
    json: "1",
    page_size: "8",
    lc: "fr",
    fields: OFF_FIELDS,
  }).toString();
  try {
    // La recherche d'Open Food Facts est parfois surchargée : on retente une fois.
    let res = await fetch(url, {
      headers: { "User-Agent": "ScanAndCook/0.1 (projet ecole)" },
      signal: AbortSignal.timeout(8000),
    });
    if (res.status >= 500) {
      await new Promise((r) => setTimeout(r, 600));
      res = await fetch(url, {
        headers: { "User-Agent": "ScanAndCook/0.1 (projet ecole)" },
        signal: AbortSignal.timeout(8000),
      });
    }
    if (!res.ok) throw new Error(`Open Food Facts a répondu ${res.status}`);
    const data = (await res.json()) as { products?: Record<string, unknown>[] };
    const products = (data.products ?? [])
      .map(fromOpenFoodFacts)
      .filter((p): p is Product => p !== null)
      .slice(0, 5);
    return Response.json({ products });
  } catch (e) {
    console.error("Recherche Open Food Facts indisponible", e);
    return Response.json({ products: [], unavailable: true });
  }
}
