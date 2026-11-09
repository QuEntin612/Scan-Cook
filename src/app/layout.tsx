import type { Metadata, Viewport } from "next";
import { Inter, Space_Grotesk } from "next/font/google";
import Header from "@/components/Header";
import TabBar from "@/components/TabBar";
import "./globals.css";

// Polices Google Fonts : Inter pour le texte, Space Grotesk (700) pour les titres.
const inter = Inter({ variable: "--font-inter", subsets: ["latin"] });
const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
  weight: "700",
});

export const metadata: Metadata = {
  title: "Scan & Cook — Un bip, une recette.",
  description:
    "Scanne un produit de supermarché et reçois une recette adaptée à ton objectif nutritionnel.",
  appleWebApp: { title: "Scan & Cook", capable: true, statusBarStyle: "default" },
};

export const viewport: Viewport = {
  themeColor: "#2E9E5B",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover", // pour bien gérer l'encoche des iPhone
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="fr" className={`${inter.variable} ${spaceGrotesk.variable}`}>
      <body>
        <Header />
        <main className="container">{children}</main>
        <TabBar />
      </body>
    </html>
  );
}
