"use client";

import Questionnaire from "@/components/questionnaire/Questionnaire";
import { DEFAULT_PROFILE } from "@/lib/profile";
import { useProfile } from "@/lib/useProfile";

// "Mon profil" : le même questionnaire, pré-rempli avec les réponses enregistrées.
export default function ProfilPage() {
  const { ready, raw, profile } = useProfile();
  if (!ready) return <p className="muted loading">Chargement…</p>;
  return <Questionnaire key={raw ?? "nouveau"} initial={profile ?? DEFAULT_PROFILE} isEdit={!!profile} />;
}
