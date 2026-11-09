"use client";

import { useState } from "react";
import { IconBulb, IconCheck, IconClock, IconWallet, IconFlame, IconInfo, IconUsers } from "@/components/Icons";
import { fr } from "@/lib/profile";
import type { Recipe } from "@/lib/recipe";
import type { HistoryEntry } from "@/lib/history";
import FavoriteButton from "./FavoriteButton";

// Fiche recette : nom, badges, macros, liste de courses à cocher, étapes, astuce.
export default function RecipeCard({ recipe, mode, entry }: { recipe: Recipe; mode: "claude" | "demo"; entry?: HistoryEntry }) {
  const [checked, setChecked] = useState<Record<string, boolean>>({});
  const { proteines, glucides, lipides } = recipe.macros;
  // Part de chaque macro dans les calories (1 g protéines/glucides = 4 kcal, 1 g lipides = 9 kcal).
  const kp = proteines * 4, kc = glucides * 4, kf = lipides * 9;
  const sum = kp + kc + kf || 1;
  const toggle = (key: string) => setChecked((c) => ({ ...c, [key]: !c[key] }));

  return (
    <article className="card recipe">
      <p className="eyebrow">{mode === "claude" ? "Recette créée par Claude" : "Recette du mode démo"}</p>
      <div className="recipe-head">
        <h2 className="recipe-title">{recipe.nom}</h2>
        {entry && <FavoriteButton entry={entry} />}
      </div>

      <ul className="badges" aria-label="En bref">
        <li className="badge"><IconClock /> {recipe.tempsTotal} min</li>
        <li className="badge"><IconFlame /> {fr(recipe.caloriesParPortion)} kcal<span className="badge-sub">/portion</span></li>
        <li className="badge"><IconWallet /> {fr(recipe.budget, recipe.budget % 1 ? 2 : 0)} €</li>
        <li className="badge"><IconUsers /> {recipe.portions} {recipe.portions > 1 ? "portions" : "portion"}</li>
      </ul>

      <section aria-labelledby="macros-title" className="macros">
        <h3 id="macros-title" className="h-section">Par portion</h3>
        <div className="macro-bar" role="img" aria-label={`Protéines ${proteines} g, glucides ${glucides} g, lipides ${lipides} g`}>
          <span className="m-p" style={{ width: `${(kp / sum) * 100}%` }} />
          <span className="m-c" style={{ width: `${(kc / sum) * 100}%` }} />
          <span className="m-f" style={{ width: `${(kf / sum) * 100}%` }} />
        </div>
        <ul className="macro-legend">
          <li><span className="dot m-p" aria-hidden="true" />Protéines <strong>{fr(proteines)} g</strong></li>
          <li><span className="dot m-c" aria-hidden="true" />Glucides <strong>{fr(glucides)} g</strong></li>
          <li><span className="dot m-f" aria-hidden="true" />Lipides <strong>{fr(lipides)} g</strong></li>
        </ul>
      </section>

      <section aria-labelledby="courses-title">
        <h3 id="courses-title" className="h-section">Liste de courses</h3>
        <p className="list-label">Déjà dans ton panier</p>
        <ul className="shop-list">
          {recipe.enMain.map((i, k) => (
            <li key={`m${k}`} className="shop-item in-hand">
              <span className="shop-check on" aria-hidden="true"><IconCheck size={16} /></span>
              <span className="shop-name">{i.nom}</span>
              <span className="shop-qty">{i.quantite}</span>
            </li>
          ))}
        </ul>
        {recipe.aAcheter.length > 0 && (
          <>
            <p className="list-label">À acheter en plus</p>
            <ul className="shop-list">
              {recipe.aAcheter.map((i, k) => {
                const key = `a${k}`;
                return (
                  <li key={key}>
                    <label className={`shop-item${checked[key] ? " done" : ""}`}>
                      <input type="checkbox" checked={!!checked[key]} onChange={() => toggle(key)} />
                      <span className={`shop-check${checked[key] ? " on" : ""}`} aria-hidden="true">
                        {checked[key] && <IconCheck size={16} />}
                      </span>
                      <span className="shop-name">{i.nom}</span>
                      <span className="shop-qty">{i.quantite}</span>
                    </label>
                  </li>
                );
              })}
            </ul>
          </>
        )}
      </section>

      <section aria-labelledby="etapes-title">
        <h3 id="etapes-title" className="h-section">Préparation</h3>
        <ol className="steps">
          {recipe.etapes.map((e, k) => (
            <li key={k}>
              <span className="step-n" aria-hidden="true">{k + 1}</span>
              <span>{e.replace(/^\s*\d+[.)]\s*/, "")}</span>
            </li>
          ))}
        </ol>
      </section>

      <p className="tip"><IconBulb /> <span>{recipe.astuce}</span></p>
      <p className="disclaimer"><IconInfo /> Calories, macros et prix sont des estimations.</p>
    </article>
  );
}
