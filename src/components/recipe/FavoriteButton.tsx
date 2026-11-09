"use client";

import { IconHeart } from "@/components/Icons";
import { addToFavorites, removeFromFavorites, useFavorites, type HistoryEntry } from "@/lib/history";

// Bouton cœur : ajoute ou retire la recette des favoris.
export default function FavoriteButton({ entry, withLabel = false }: { entry: HistoryEntry; withLabel?: boolean }) {
  const { entries } = useFavorites();
  const isFav = entries.some((e) => e.id === entry.id);
  const label = isFav ? "Retirer des favoris" : "Ajouter aux favoris";

  return (
    <button
      type="button"
      className={`fav-btn${isFav ? " on" : ""}${withLabel ? " with-label" : ""}`}
      aria-pressed={isFav}
      aria-label={withLabel ? undefined : label}
      title={label}
      onClick={() => (isFav ? removeFromFavorites(entry.id) : addToFavorites(entry))}
    >
      <IconHeart filled={isFav} />
      {withLabel && <span>{isFav ? "Dans tes favoris" : "Ajouter aux favoris"}</span>}
    </button>
  );
}
