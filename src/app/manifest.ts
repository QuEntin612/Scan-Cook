import type { MetadataRoute } from "next";

// Permet d'"ajouter à l'écran d'accueil" le site comme une vraie appli.
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Scan & Cook",
    short_name: "Scan & Cook",
    description: "Un bip, une recette.",
    start_url: "/",
    display: "standalone",
    background_color: "#F6F8F5",
    theme_color: "#2E9E5B",
    lang: "fr",
    icons: [
      { src: "/icon.svg", sizes: "any", type: "image/svg+xml" },
      { src: "/apple-icon.png", sizes: "180x180", type: "image/png" },
    ],
  };
}
