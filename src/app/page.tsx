// Page d'accueil provisoire (étape 1). Le questionnaire arrivera à l'étape 2.
export default function Home() {
  return (
    <section className="card hero">
      <h1>
        Scan <span className="amp">&amp;</span> Cook
      </h1>
      <p className="slogan">Un bip, une recette.</p>
      <p className="muted">
        Étape 1 terminée : le projet fonctionne. Le questionnaire arrive à
        l&apos;étape 2.
      </p>
    </section>
  );
}
