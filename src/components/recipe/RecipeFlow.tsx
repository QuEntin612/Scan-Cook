"use client";

import { useEffect, useState } from "react";
import ProductCard from "@/components/scan/ProductCard";
import RecipeCard from "@/components/recipe/RecipeCard";
import { IconInfo, IconRefresh, IconScan } from "@/components/Icons";
import { productWarnings } from "@/lib/allergens";
import type { Product } from "@/lib/product";
import type { Profile } from "@/lib/profile";
import type { RecipeResponse } from "@/lib/recipe";

type Attempt = { n: number; variant: number; exclude: string[] };

// Produit trouvé -> (alerte allergène éventuelle) -> recette.
export default function RecipeFlow({ product, profile, onReset }: { product: Product; profile: Profile; onReset: () => void }) {
  const warnings = productWarnings(product, profile.diets);
  const blocking = warnings.some((w) => w.level === "contient");
  const [confirmed, setConfirmed] = useState(!blocking);
  const [attempt, setAttempt] = useState<Attempt>({ n: 0, variant: 0, exclude: [] });
  const [result, setResult] = useState<{ n: number; data: RecipeResponse } | null>(null);
  const loading = confirmed && result?.n !== attempt.n;

  // Demande la recette au serveur à chaque nouvelle tentative.
  useEffect(() => {
    if (!confirmed) return;
    const ctrl = new AbortController();
    fetch("/api/recipe", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ profile, product, variant: attempt.variant, exclude: attempt.exclude }),
      signal: ctrl.signal,
    })
      .then((r) => r.json() as Promise<RecipeResponse>)
      .then((data) => setResult({ n: attempt.n, data }))
      .catch((e: unknown) => {
        if (e instanceof Error && e.name === "AbortError") return;
        setResult({ n: attempt.n, data: { ok: false, error: "Pas de connexion internet ? Réessaie dans un instant." } });
      });
    return () => ctrl.abort();
  }, [confirmed, attempt, profile, product]);

  const another = () => {
    const name = result?.data.ok ? result.data.recipe.nom : null;
    setAttempt((a) => ({ n: a.n + 1, variant: a.variant + 1, exclude: name ? [...a.exclude, name].slice(-5) : a.exclude }));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };
  const retry = () => setAttempt((a) => ({ ...a, n: a.n + 1 }));

  return (
    <>
      <section className="card">
        <p className="eyebrow">Produit trouvé</p>
        <ProductCard product={product} />
      </section>

      {warnings.length > 0 && (
        <section className="alert warn" role="alert">
          <p className="alert-title">
            <IconInfo /> Attention, d&apos;après tes réponses :
          </p>
          <ul>
            {warnings.map((w) => (
              <li key={w.text}>{w.text}</li>
            ))}
          </ul>
          {!confirmed && (
            <div className="alert-actions">
              <button type="button" className="btn-secondary" onClick={() => setConfirmed(true)}>
                Je comprends, proposer quand même
              </button>
            </div>
          )}
        </section>
      )}

      {loading && (
        <section className="card center" aria-busy="true" aria-live="polite">
          <div className="spinner" aria-hidden="true" />
          <p><strong>Je te prépare une recette…</strong></p>
        </section>
      )}

      {!loading && result && !result.data.ok && (
        <section className="alert" role="alert">
          <IconInfo />
          <div>
            <p className="alert-msg">{result.data.error}</p>
            <button type="button" className="btn-link" onClick={retry}>Réessayer</button>
          </div>
        </section>
      )}

      {!loading && result?.data.ok && <RecipeCard key={attempt.n} recipe={result.data.recipe} mode={result.data.mode} />}

      <div className="actions">
        {!loading && result?.data.ok && (
          <button type="button" className="btn-secondary" onClick={another}>
            <IconRefresh /> Une autre recette avec ce produit
          </button>
        )}
        <button type="button" className="btn-primary" onClick={onReset}>
          <IconScan /> Scanner un autre produit
        </button>
      </div>
    </>
  );
}
