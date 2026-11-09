import Link from "next/link";
import Logo from "./Logo";
import { IconUser } from "./Icons";

// En-tête affiché en haut de toutes les pages.
export default function Header() {
  return (
    <header className="site-header">
      <div className="header-inner">
        <Link href="/" className="brand" aria-label="Scan & Cook, accueil">
          <Logo size={46} />
          <span className="brand-name">
            Scan <span className="amp">&amp;</span> Cook
          </span>
        </Link>
        <Link href="/profil" className="header-link">
          <IconUser />
          <span>Mon profil</span>
        </Link>
      </div>
    </header>
  );
}
