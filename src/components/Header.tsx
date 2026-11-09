import Link from "next/link";
import Logo from "./Logo";

// En-tête affiché en haut de toutes les pages.
export default function Header() {
  return (
    <header className="site-header">
      <div className="header-inner">
        <Link href="/scan" className="brand" aria-label="Scan & Cook, accueil">
          <Logo size={46} />
          <span className="brand-name">
            Scan <span className="amp">&amp;</span> Cook
          </span>
        </Link>
        <span className="header-slogan" aria-hidden="true">Un bip, une recette.</span>
      </div>
    </header>
  );
}
