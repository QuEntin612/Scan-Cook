import Link from "next/link";

export default function NotFound() {
  return (
    <section className="card center">
      <h1>Page introuvable</h1>
      <p className="muted">Cette page n&apos;existe pas (ou plus).</p>
      <Link href="/scan" className="btn-primary">Retour au scan</Link>
    </section>
  );
}
