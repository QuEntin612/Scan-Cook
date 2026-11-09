"use client";

import Link from "next/link";
import { computeNeeds, fr, GOALS } from "@/lib/profile";
import { useProfile } from "@/lib/useProfile";

// Écran de scan : provisoire à l'étape 2, la caméra arrive à l'étape 3.
export default function ScanPage() {
  const { ready, profile } = useProfile();
  if (!ready) return <p className="muted loading">Chargement…</p>;
  if (!profile)
    return (
      <section className="card">
        <h1>Profil manquant</h1>
        <p className="muted">Réponds d&apos;abord au questionnaire.</p>
        <Link href="/" className="btn-primary">Commencer</Link>
      </section>
    );
  const needs = computeNeeds(profile);
  return (
    <section className="card hero">
      <h1>Profil enregistré</h1>
      <p className="muted">
        Objectif : {GOALS.find((g) => g.value === profile.goal)?.label} — environ{" "}
        <strong>{fr(needs.perMeal)} kcal</strong> par repas.
      </p>
      <p className="muted">Le scan du code-barres arrive à l&apos;étape 3.</p>
      <Link href="/profil" className="btn-secondary">Modifier mon profil</Link>
    </section>
  );
}
