"use client";

import Link from "next/link";
import { useState } from "react";
import RecipeCard from "@/components/recipe/RecipeCard";
import { IconClock, IconFlame, IconScan } from "@/components/Icons";
import { clearHistory, formatDate, removeFromHistory, useHistory } from "@/lib/history";
import { fr } from "@/lib/profile";

// Historique : les 10 dernières recettes générées.
export default function HistoriquePage() {
  const { ready, entries } = useHistory();
  const [openId, setOpenId] = useState<string | null>(null);

  if (!ready) return <p className="muted loading">Chargement…</p>;

  return (
    <div>
      <div className="intro">
        <h1>Mes recettes</h1>
        <p className="muted">Tes 10 dernières recettes, gardées sur ce téléphone.</p>
      </div>

      {entries.length === 0 ? (
        <section className="card center empty">
          <p><strong>Pas encore de recette.</strong></p>
          <p className="muted">Scanne ton premier produit : la recette s&apos;affichera ici.</p>
          <Link href="/scan" className="btn-primary"><IconScan /> Scanner un produit</Link>
        </section>
      ) : (
        <>
          <ul className="history">
            {entries.map((e) => {
              const open = openId === e.id;
              return (
                <li key={e.id} className="history-item">
                  <button
                    type="button"
                    className="history-head"
                    aria-expanded={open}
                    onClick={() => setOpenId(open ? null : e.id)}
                  >
                    <span className="history-thumb" aria-hidden="true">
                      {e.product.image ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={e.product.image} alt="" />
                      ) : (
                        <IconScan />
                      )}
                    </span>
                    <span className="history-text">
                      <span className="history-name">{e.recipe.nom}</span>
                      <span className="history-meta">
                        {e.product.name} · {formatDate(e.date)}
                      </span>
                      <span className="history-meta">
                        <IconClock size={14} /> {e.recipe.tempsTotal} min · <IconFlame size={14} /> {fr(e.recipe.caloriesParPortion)} kcal
                      </span>
                    </span>
                    <span className={`chevron${open ? " open" : ""}`} aria-hidden="true" />
                  </button>
                  {open && (
                    <div className="history-body">
                      <RecipeCard recipe={e.recipe} mode={e.mode} />
                      <button type="button" className="btn-link" onClick={() => removeFromHistory(e.id)}>
                        Supprimer cette recette
                      </button>
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
          <button
            type="button"
            className="btn-secondary"
            onClick={() => {
              if (window.confirm("Effacer tout l'historique ?")) clearHistory();
            }}
          >
            Effacer l&apos;historique
          </button>
        </>
      )}
    </div>
  );
}
