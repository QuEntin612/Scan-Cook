"use client";

import { useMemo, useSyncExternalStore } from "react";
import type { Recipe } from "./recipe";

// Deux listes de recettes gardées dans le navigateur (localStorage) :
// - l'HISTORIQUE : les 10 dernières recettes générées (les plus anciennes disparaissent) ;
// - les FAVORIS : les recettes choisies avec le cœur, gardées jusqu'à ce qu'on les retire.

export type HistoryEntry = {
  id: string;
  date: string; // ISO
  mode: "claude" | "demo";
  product: { name: string; brand?: string; image?: string; code?: string };
  recipe: Recipe;
};

const NOT_READY = "__pas_encore_lu__";
const EMPTY = "[]";

function parse(raw: string): HistoryEntry[] {
  try {
    const data = JSON.parse(raw);
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

// Fabrique une liste sauvegardée sous une clé donnée, avec un nombre maximum d'éléments.
function createListStore(key: string, max: number) {
  const event = `${key}-change`;

  const read = (): string => {
    try {
      return localStorage.getItem(key) ?? EMPTY;
    } catch {
      return EMPTY;
    }
  };

  const write = (entries: HistoryEntry[]) => {
    try {
      localStorage.setItem(key, JSON.stringify(entries.slice(0, max)));
      window.dispatchEvent(new Event(event));
    } catch {
      // Stockage plein ou indisponible : on ignore, l'appli continue de marcher.
    }
  };

  const subscribe = (cb: () => void) => {
    window.addEventListener("storage", cb);
    window.addEventListener(event, cb);
    return () => {
      window.removeEventListener("storage", cb);
      window.removeEventListener(event, cb);
    };
  };

  return {
    list: () => parse(read()),
    add: (entry: HistoryEntry) => write([entry, ...parse(read()).filter((e) => e.id !== entry.id)]),
    remove: (id: string) => write(parse(read()).filter((e) => e.id !== id)),
    clear: () => write([]),
    useList() {
      const raw = useSyncExternalStore(subscribe, read, () => NOT_READY);
      const ready = raw !== NOT_READY;
      const entries = useMemo(() => (ready ? parse(raw) : []), [raw, ready]);
      return { ready, entries };
    },
  };
}

const history = createListStore("scancook.history", 10);
const favorites = createListStore("scancook.favorites", 50);

// ----- Historique -----
export function addToHistory(entry: Omit<HistoryEntry, "id" | "date">): HistoryEntry {
  const full: HistoryEntry = {
    ...entry,
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    date: new Date().toISOString(),
  };
  history.add(full);
  return full;
}
export const removeFromHistory = history.remove;
export const clearHistory = history.clear;
export const useHistory = history.useList;

// ----- Favoris -----
export const addToFavorites = favorites.add;
export const removeFromFavorites = favorites.remove;
export const useFavorites = favorites.useList;

export function formatDate(iso: string) {
  return new Date(iso).toLocaleString("fr-FR", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });
}
