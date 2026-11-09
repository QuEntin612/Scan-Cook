"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import Scanner from "@/components/scan/Scanner";
import ProductCard from "@/components/scan/ProductCard";
import { IconInfo, IconScan } from "@/components/Icons";
import RecipeFlow from "@/components/recipe/RecipeFlow";
import { isBarcode, manualProduct, type Product } from "@/lib/product";
import { computeNeeds, fr, GOALS } from "@/lib/profile";
import { useProfile } from "@/lib/useProfile";
import { useHistory } from "@/lib/history";

type View =
  | { kind: "idle" }
  | { kind: "scanning" }
  | { kind: "loading"; code: string }
  | { kind: "found"; product: Product }
  | { kind: "notfound"; code: string; message: string }
  | { kind: "choose"; query: string; results: Product[]; searching: boolean; unavailable: boolean };

export default function ScanPage() {
  const { ready, profile } = useProfile();
  const [view, setView] = useState<View>({ kind: "idle" });
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [text, setText] = useState("");
  const requestId = useRef(0); // évite qu'une vieille réponse écrase une plus récente
  const { entries: recent } = useHistory();

  // À chaque changement d'écran, on remonte en haut de la page.
  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, [view.kind]);

  if (!ready) return <p className="muted loading">Chargement…</p>;
  if (!profile)
    return (
      <section className="card">
        <h1>Profil manquant</h1>
        <p className="muted">Réponds d&apos;abord au questionnaire, ça prend une minute.</p>
        <Link href="/" className="btn-primary">Commencer</Link>
      </section>
    );

  const needs = computeNeeds(profile);
  const goalLabel = GOALS.find((g) => g.value === profile.goal)?.label;

  // Recherche d'un produit par code-barres
  const lookup = async (code: string) => {
    const id = ++requestId.current;
    setView({ kind: "loading", code });
    try {
      const res = await fetch(`/api/product/${encodeURIComponent(code)}`);
      const data = (await res.json()) as { product?: Product; error?: string };
      if (id !== requestId.current) return;
      if (res.ok && data.product) setView({ kind: "found", product: data.product });
      else
        setView({
          kind: "notfound",
          code,
          message:
            res.status === 404
              ? `Le produit ${code} n'est pas dans la base Open Food Facts. Tape son nom ci-dessous, ça marche aussi.`
              : (data.error ?? "Une erreur est survenue."),
        });
    } catch {
      if (id !== requestId.current) return;
      setView({ kind: "notfound", code, message: "Pas de connexion internet ? Réessaie dans un instant." });
    }
  };

  // Recherche par nom ("pois chiches en boîte")
  const searchByName = async (query: string) => {
    const id = ++requestId.current;
    setView({ kind: "choose", query, results: [], searching: true, unavailable: false });
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
      const data = (await res.json()) as { products?: Product[]; unavailable?: boolean };
      if (id !== requestId.current) return;
      setView({ kind: "choose", query, results: data.products ?? [], searching: false, unavailable: !!data.unavailable });
    } catch {
      if (id !== requestId.current) return;
      setView({ kind: "choose", query, results: [], searching: false, unavailable: true });
    }
  };

  const submitManual = (e: React.FormEvent) => {
    e.preventDefault();
    const value = text.trim();
    if (!value) return;
    if (isBarcode(value)) lookup(value.replace(/\s/g, ""));
    else if (/^\d+$/.test(value.replace(/\s/g, "")))
      setView({ kind: "notfound", code: value, message: "Un code-barres compte 8 ou 13 chiffres. Vérifie-le." });
    else searchByName(value);
  };

  // Choisir un produit annule la recherche encore en cours (sinon sa réponse ramènerait la liste).
  const choose = (product: Product) => {
    requestId.current++;
    setView({ kind: "found", product });
  };

  const reset = () => {
    requestId.current++;
    setView({ kind: "idle" });
    setText("");
  };

  const manualForm = (
    <form className="card manual" onSubmit={submitManual}>
      <label htmlFor="manual" className="manual-label">
        Pas de caméra ou code illisible ?
      </label>
      <p className="step-note">Tape le code-barres ou simplement le nom du produit.</p>
      <div className="manual-row">
        <input
          id="manual"
          type="text"
          inputMode="search"
          autoComplete="off"
          enterKeyHint="search"
          placeholder="Ex. : pois chiches en boîte"
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
        <button type="submit" className="btn-small">Valider</button>
      </div>
    </form>
  );

  return (
    <div className="scan-page">
      {view.kind === "idle" && (
        <>
          <section className="card scan-hero">
            <p className="eyebrow">
              {goalLabel} · environ {fr(needs.perMeal)} kcal par repas
            </p>
            <h1>Un bip, une recette.</h1>
            <p className="muted">Scanne le code-barres d&apos;un produit, je te propose une recette adaptée.</p>
            <button
              type="button"
              className="btn-primary btn-scan"
              onClick={() => {
                setCameraError(null);
                setView({ kind: "scanning" });
              }}
            >
              <IconScan size={24} /> Scanner un produit
            </button>
          </section>
          {cameraError && (
            <p className="alert" role="alert">
              <IconInfo /> {cameraError}
            </p>
          )}
          {manualForm}
          {recent.length > 0 && (
            <section className="card" aria-labelledby="recent-title">
              <div className="recent-head">
                <h2 id="recent-title">Tes dernières recettes</h2>
                <Link href="/historique">Tout voir</Link>
              </div>
              <ul className="recent-list">
                {recent.slice(0, 3).map((e) => (
                  <li key={e.id}>
                    <span>{e.recipe.nom}</span>
                    <span className="muted">{fr(e.recipe.caloriesParPortion)} kcal</span>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </>
      )}

      {view.kind === "scanning" && (
        <Scanner
          onDetected={lookup}
          onCancel={reset}
          onError={(msg) => {
            setCameraError(msg);
            setView({ kind: "idle" });
          }}
        />
      )}

      {view.kind === "loading" && (
        <section className="card center" aria-busy="true">
          <div className="spinner" aria-hidden="true" />
          <p>Je cherche le produit {view.code}…</p>
        </section>
      )}

      {view.kind === "notfound" && (
        <>
          <p className="alert" role="alert">
            <IconInfo /> {view.message}
          </p>
          {manualForm}
          <button type="button" className="btn-secondary" onClick={reset}>
            Scanner un autre produit
          </button>
        </>
      )}

      {view.kind === "choose" && (
        <section className="card">
          <h2 className="h-small">Quel produit ?</h2>
          <ul className="choose-list">
            <li>
              <button type="button" className="choose-item" onClick={() => choose(manualProduct(view.query))}>
                <ProductCard product={manualProduct(view.query)} />
              </button>
            </li>
            {view.results.map((p) => (
              <li key={p.code ?? p.name}>
                <button type="button" className="choose-item" onClick={() => choose(p)}>
                  <ProductCard product={p} />
                </button>
              </li>
            ))}
          </ul>
          {view.searching && <p className="muted small">Je cherche d&apos;autres produits sur Open Food Facts…</p>}
          {!view.searching && view.unavailable && (
            <p className="muted small">La recherche Open Food Facts ne répond pas : choisis simplement ton produit tapé.</p>
          )}
          <button type="button" className="btn-secondary" onClick={reset}>
            Retour
          </button>
        </section>
      )}

      {view.kind === "found" && (
        <RecipeFlow product={view.product} profile={profile} onReset={reset} />
      )}
    </div>
  );
}
