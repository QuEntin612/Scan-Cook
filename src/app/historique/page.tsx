"use client";

import Link from "next/link";
import { useState } from "react";
import RecipeCard from "@/components/recipe/RecipeCard";
import FavoriteButton from "@/components/recipe/FavoriteButton";
import { IconClock, IconFlame, IconHeart, IconScan } from "@/components/Icons";
import {
  clearHistory,
  formatDate,
  removeFromFavorites,
  removeFromHistory,
  useFavorites,
  useHistory,
  type HistoryEntry,
} from "@/lib/history";
import { fr } from "@/lib/profile";

type Tab = "favoris" | "historique";

// "Mes recettes" : les favoris (gardés) et l'historique (10 dernières).
export default function MesRecettesPage() {
  const history = useHistory();
  const favorites = useFavorites();
  const [chosenTab, setChosenTab] = useState<Tab | null>(null);

  if (!history.ready || !favorites.ready) return <p className="muted loading">Chargement…</p>;

  // Par défaut : les favoris s'il y en a, sinon l'historique.
  const tab: Tab = chosenTab ?? (favorites.entries.length ? "favoris" : "historique");

  return (
    <div>
      <div className="intro">
        <h1>Mes recettes</h1>
      </div>

      <div className="segmented" role="tablist" aria-label="Choisir la liste">
        <button type="button" role="tab" id="tab-favoris" aria-controls="panel" aria-selected={tab === "favoris"} onClick={() => setChosenTab("favoris")}>
          <IconHeart size={18} filled={tab === "favoris"} /> Favoris ({favorites.entries.length})
        </button>
        <button type="button" role="tab" id="tab-historique" aria-controls="panel" aria-selected={tab === "historique"} onClick={() => setChosenTab("historique")}>
          <IconClock size={18} /> Historique ({history.entries.length})
        </button>
      </div>

      <div id="panel" role="tabpanel" aria-labelledby={`tab-${tab}`}>
        {tab === "favoris" ? (
          <>
            <p className="muted list-intro">Les recettes que tu as gardées avec le cœur. Elles restent ici jusqu&apos;à ce que tu les retires.</p>
            {favorites.entries.length === 0 ? (
              <section className="card center empty">
                <p><strong>Aucun favori pour l&apos;instant.</strong></p>
                <p className="muted">
                  Touche le cœur <IconHeart size={16} /> sur une recette qui te plaît pour la garder ici.
                </p>
                {history.entries.length > 0 && (
                  <button type="button" className="btn-secondary" onClick={() => setChosenTab("historique")}>
                    Voir mon historique
                  </button>
                )}
              </section>
            ) : (
              <EntryList entries={favorites.entries} removeLabel="Retirer des favoris" onRemove={removeFromFavorites} />
            )}
          </>
        ) : (
          <>
            <p className="muted list-intro">Tes 10 dernières recettes. Touche le cœur pour garder celles qui te plaisent.</p>
            {history.entries.length === 0 ? (
              <section className="card center empty">
                <p><strong>Pas encore de recette.</strong></p>
                <p className="muted">Scanne ton premier produit : la recette s&apos;affichera ici.</p>
                <Link href="/scan" className="btn-primary"><IconScan /> Scanner un produit</Link>
              </section>
            ) : (
              <>
                <EntryList entries={history.entries} removeLabel="Supprimer de l'historique" onRemove={removeFromHistory} />
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => {
                    if (window.confirm("Effacer tout l'historique ? Tes favoris seront conservés.")) clearHistory();
                  }}
                >
                  Effacer l&apos;historique
                </button>
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}

function EntryList({ entries, removeLabel, onRemove }: { entries: HistoryEntry[]; removeLabel: string; onRemove: (id: string) => void }) {
  const [openId, setOpenId] = useState<string | null>(null);
  return (
    <ul className="history">
      {entries.map((e) => {
        const open = openId === e.id;
        return (
          <li key={e.id} className="history-item">
            <div className="history-row">
              <button type="button" className="history-head" aria-expanded={open} onClick={() => setOpenId(open ? null : e.id)}>
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
              <FavoriteButton entry={e} />
            </div>
            {open && (
              <div className="history-body">
                <RecipeCard recipe={e.recipe} mode={e.mode} />
                <button type="button" className="btn-link" onClick={() => onRemove(e.id)}>
                  {removeLabel}
                </button>
              </div>
            )}
          </li>
        );
      })}
    </ul>
  );
}
