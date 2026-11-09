"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Slider from "./Slider";
import {
  ACTIVITIES,
  DIETS,
  GOALS,
  computeNeeds,
  fr,
  saveProfile,
  type Diet,
  type Goal,
  type Profile,
} from "@/lib/profile";
import { IconBalance, IconCheck, IconInfo, IconMuscle, IconScale, IconSpark } from "@/components/Icons";

const GOAL_ICONS: Record<Goal, React.ReactNode> = {
  perte: <IconScale />,
  masse: <IconMuscle />,
  maintien: <IconBalance />,
  curiosite: <IconSpark />,
};

type Props = { initial: Profile; isEdit: boolean };

export default function Questionnaire({ initial, isEdit }: Props) {
  const router = useRouter();
  const [p, setP] = useState<Profile>(initial);
  const set = <K extends keyof Profile>(key: K, value: Profile[K]) =>
    setP((prev) => ({ ...prev, [key]: value }));

  // "Aucun" se désélectionne dès qu'on choisit autre chose, et revient si plus rien n'est coché.
  const toggleDiet = (d: Diet) => {
    setP((prev) => {
      let next: Diet[];
      if (d === "aucun") next = ["aucun"];
      else if (prev.diets.includes(d)) next = prev.diets.filter((x) => x !== d);
      else next = [...prev.diets.filter((x) => x !== "aucun"), d];
      return { ...prev, diets: next.length ? next : ["aucun"] };
    });
  };

  const needs = computeNeeds(p);

  const submit = () => {
    saveProfile(p);
    router.push("/scan");
  };

  return (
    <div className="questionnaire">
      <div className="intro">
        <h1>{isEdit ? "Mon profil" : "Faisons connaissance"}</h1>
        <p className="muted">
          {isEdit
            ? "Modifie tes réponses quand tu veux."
            : "6 questions, une seule fois. Rien à taper, tout se fait au doigt."}
        </p>
      </div>

      {/* 1. Objectif */}
      <fieldset className="card step">
        <legend className="step-title"><span className="step-num">1</span>Ton objectif</legend>
        <div className="choice-grid">
          {GOALS.map((g) => (
            <button
              key={g.value}
              type="button"
              className="choice big"
              aria-pressed={p.goal === g.value}
              onClick={() => set("goal", g.value)}
            >
              <span className="choice-icon">{GOAL_ICONS[g.value]}</span>
              <span className="choice-label">{g.label}</span>
              <span className="choice-hint">{g.hint}</span>
            </button>
          ))}
        </div>
      </fieldset>

      {/* 2. Sexe */}
      <fieldset className="card step">
        <legend className="step-title"><span className="step-num">2</span>Sexe</legend>
        <p className="step-note">Utilisé uniquement pour le calcul de tes besoins.</p>
        <div className="choice-row">
          {(["femme", "homme"] as const).map((s) => (
            <button
              key={s}
              type="button"
              className="choice"
              aria-pressed={p.sex === s}
              onClick={() => set("sex", s)}
            >
              <span className="choice-label">{s === "femme" ? "Femme" : "Homme"}</span>
            </button>
          ))}
        </div>
      </fieldset>

      {/* 3. Chiffres */}
      <fieldset className="card step">
        <legend className="step-title"><span className="step-num">3</span>Tes chiffres</legend>
        <Slider id="age" label="Âge" unit="ans" min={14} max={80} step={1} value={p.age} onChange={(v) => set("age", v)} />
        <Slider id="weight" label="Poids" unit="kg" min={35} max={160} step={0.5} value={p.weight} onChange={(v) => set("weight", v)} />
        <Slider id="height" label="Taille" unit="cm" min={130} max={215} step={1} value={p.height} onChange={(v) => set("height", v)} />
      </fieldset>

      {/* 4. Activité */}
      <fieldset className="card step">
        <legend className="step-title"><span className="step-num">4</span>Activité physique</legend>
        <div className="choice-list">
          {ACTIVITIES.map((a) => (
            <button
              key={a.value}
              type="button"
              className="choice wide"
              aria-pressed={p.activity === a.value}
              onClick={() => set("activity", a.value)}
            >
              <span className="choice-text">
                <span className="choice-label">{a.label}</span>
                <span className="choice-hint">{a.hint}</span>
              </span>
              <span className="radio-dot" aria-hidden="true" />
            </button>
          ))}
        </div>
      </fieldset>

      {/* 5. Régime et allergies */}
      <fieldset className="card step">
        <legend className="step-title"><span className="step-num">5</span>Régime et allergies</legend>
        <p className="step-note">Plusieurs choix possibles.</p>
        <div className="chips">
          {DIETS.map((d) => {
            const on = p.diets.includes(d.value);
            return (
              <button
                key={d.value}
                type="button"
                className="chip"
                aria-pressed={on}
                onClick={() => toggleDiet(d.value)}
              >
                {on && <IconCheck size={16} />}
                {d.label}
              </button>
            );
          })}
        </div>
      </fieldset>

      {/* 6. Budget */}
      <fieldset className="card step">
        <legend className="step-title"><span className="step-num">6</span>Budget par recette</legend>
        <Slider id="budget" label="Budget maximum" unit="€" min={2} max={30} step={1} value={p.budget} onChange={(v) => set("budget", v)} />
      </fieldset>

      {/* Calcul en direct */}
      <section className="card needs" aria-live="polite" aria-labelledby="needs-title">
        <h2 id="needs-title">Tes besoins estimés</h2>
        <div className="needs-grid">
          <div className="need">
            <span className="need-value">{fr(needs.bmr)}</span>
            <span className="need-unit">kcal</span>
            <span className="need-label">Métabolisme de base</span>
          </div>
          <div className="need">
            <span className="need-value">{fr(needs.daily)}</span>
            <span className="need-unit">kcal</span>
            <span className="need-label">Besoins par jour</span>
          </div>
          <div className="need highlight">
            <span className="need-value">{fr(needs.perMeal)}</span>
            <span className="need-unit">kcal</span>
            <span className="need-label">Objectif par repas</span>
          </div>
        </div>
        <p className="disclaimer">
          <IconInfo /> Ce sont des estimations, pas un avis médical.
        </p>
      </section>

      <button type="button" className="btn-primary" onClick={submit}>
        {isEdit ? "Enregistrer et scanner" : "C'est parti, je scanne !"}
      </button>
    </div>
  );
}
