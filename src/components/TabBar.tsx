"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { IconBook, IconScan, IconUser } from "./Icons";

const TABS = [
  { href: "/scan", label: "Scanner", icon: <IconScan size={24} /> },
  { href: "/historique", label: "Mes recettes", icon: <IconBook size={24} /> },
  { href: "/profil", label: "Mon profil", icon: <IconUser size={24} /> },
];

// Barre de navigation en bas de l'écran, comme une appli mobile.
export default function TabBar() {
  const path = usePathname();
  if (path === "/") return null; // pas pendant le premier questionnaire
  return (
    <nav className="tabbar" aria-label="Navigation principale">
      {TABS.map((t) => {
        const active = path.startsWith(t.href);
        return (
          <Link key={t.href} href={t.href} className={`tab${active ? " active" : ""}`} aria-current={active ? "page" : undefined}>
            {t.icon}
            <span>{t.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
