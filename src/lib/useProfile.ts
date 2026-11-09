"use client";

import { useMemo, useSyncExternalStore } from "react";
import { parseProfile, readProfileRaw, subscribeProfile } from "./profile";

const NOT_READY = "__pas_encore_lu__";

// Lit le profil sauvegardé dans le navigateur.
// "ready" vaut false pendant le tout premier affichage (le serveur n'a pas accès au localStorage).
export function useProfile() {
  const raw = useSyncExternalStore<string | null>(
    subscribeProfile,
    readProfileRaw,
    () => NOT_READY,
  );
  const ready = raw !== NOT_READY;
  const profile = useMemo(() => (ready ? parseProfile(raw) : null), [raw, ready]);
  return { ready, raw: ready ? raw : null, profile };
}
