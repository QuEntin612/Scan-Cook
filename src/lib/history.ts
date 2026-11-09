"use client";

import { useMemo, useSyncExternalStore } from "react";
import type { Recipe } from "./recipe";

// Historique des 10 dernières recettes, gardé dans le navigateur (localStorage).

export type HistoryEntry = {
  id: string;
  date: string; // ISO
  mode: "claude" | "demo";
  product: { name: string; brand?: string; image?: string; code?: string };
  recipe: Recipe;
};

const KEY = "scancook.history";
const EVENT = "scancook-history-change";
const MAX = 10;
const EMPTY = "[]";

function read(): string {
  try {
    return localStorage.getItem(KEY) ?? EMPTY;
  } catch {
    return EMPTY;
  }
}

function write(entries: HistoryEntry[]) {
  try {
    localStorage.setItem(KEY, JSON.stringify(entries));
    window.dispatchEvent(new Event(EVENT));
  } catch {
    // Stockage plein ou indisponible : on ignore, l'appli continue de marcher.
  }
}

function parse(raw: string): HistoryEntry[] {
  try {
    const data = JSON.parse(raw);
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

export function addToHistory(entry: Omit<HistoryEntry, "id" | "date">) {
  const list = parse(read());
  const full: HistoryEntry = { ...entry, id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`, date: new Date().toISOString() };
  write([full, ...list].slice(0, MAX));
}

export function removeFromHistory(id: string) {
  write(parse(read()).filter((e) => e.id !== id));
}

export function clearHistory() {
  write([]);
}

function subscribe(cb: () => void) {
  window.addEventListener("storage", cb);
  window.addEventListener(EVENT, cb);
  return () => {
    window.removeEventListener("storage", cb);
    window.removeEventListener(EVENT, cb);
  };
}

const NOT_READY = "__pas_encore_lu__";

export function useHistory() {
  const raw = useSyncExternalStore(subscribe, read, () => NOT_READY);
  const ready = raw !== NOT_READY;
  const entries = useMemo(() => (ready ? parse(raw) : []), [raw, ready]);
  return { ready, entries };
}

export function formatDate(iso: string) {
  return new Date(iso).toLocaleString("fr-FR", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });
}
