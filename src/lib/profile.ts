// Tout ce qui concerne le profil : types, valeurs par défaut, calculs et sauvegarde.

export type Goal = "perte" | "masse" | "maintien" | "curiosite";
export type Sex = "femme" | "homme";
export type Activity = "sedentaire" | "leger" | "modere" | "tres";
export type Diet =
  | "aucun"
  | "vegetarien"
  | "vegan"
  | "sans-gluten"
  | "sans-lactose"
  | "halal"
  | "sans-porc"
  | "arachides"
  | "fruits-a-coque"
  | "oeufs"
  | "poissons";

export type Profile = {
  goal: Goal;
  sex: Sex;
  age: number;
  weight: number;
  height: number;
  activity: Activity;
  diets: Diet[];
  budget: number;
};

export const GOALS: { value: Goal; label: string; hint: string }[] = [
  { value: "perte", label: "Perte de poids", hint: "Rassasiant et léger" },
  { value: "masse", label: "Prise de masse musculaire", hint: "Riche en protéines" },
  { value: "maintien", label: "Maintien", hint: "Équilibré au quotidien" },
  { value: "curiosite", label: "Curiosité culinaire", hint: "Original et varié" },
];

export const ACTIVITIES: { value: Activity; label: string; hint: string; factor: number }[] = [
  { value: "sedentaire", label: "Sédentaire", hint: "Peu ou pas de sport", factor: 1.2 },
  { value: "leger", label: "Légèrement actif", hint: "1 à 3 séances par semaine", factor: 1.375 },
  { value: "modere", label: "Modérément actif", hint: "3 à 5 séances par semaine", factor: 1.55 },
  { value: "tres", label: "Très actif", hint: "6 séances ou plus par semaine", factor: 1.725 },
];

export const DIETS: { value: Diet; label: string }[] = [
  { value: "aucun", label: "Aucun" },
  { value: "vegetarien", label: "Végétarien" },
  { value: "vegan", label: "Vegan" },
  { value: "sans-gluten", label: "Sans gluten" },
  { value: "sans-lactose", label: "Sans lactose" },
  { value: "halal", label: "Halal" },
  { value: "sans-porc", label: "Sans porc" },
  { value: "arachides", label: "Arachides" },
  { value: "fruits-a-coque", label: "Fruits à coque" },
  { value: "oeufs", label: "Œufs" },
  { value: "poissons", label: "Poissons et fruits de mer" },
];

export const DEFAULT_PROFILE: Profile = {
  goal: "maintien",
  sex: "femme",
  age: 25,
  weight: 65,
  height: 170,
  activity: "leger",
  diets: ["aucun"],
  budget: 8,
};

// ----- Calculs (formule de Mifflin-St Jeor) -----

export type Needs = { bmr: number; daily: number; perMeal: number };

export function computeNeeds(p: Profile): Needs {
  const base = 10 * p.weight + 6.25 * p.height - 5 * p.age;
  const bmr = p.sex === "homme" ? base + 5 : base - 161;
  const factor = ACTIVITIES.find((a) => a.value === p.activity)?.factor ?? 1.2;
  let daily = bmr * factor;
  if (p.goal === "perte") daily -= 400;
  if (p.goal === "masse") daily += 300;
  const perMeal = Math.round(daily / 3 / 10) * 10;
  return { bmr: Math.round(bmr), daily: Math.round(daily), perMeal };
}

// ----- Sauvegarde dans le navigateur (localStorage) -----

const KEY = "scancook.profile";
const EVENT = "scancook-profile-change";

export function saveProfile(p: Profile) {
  try {
    localStorage.setItem(KEY, JSON.stringify(p));
    window.dispatchEvent(new Event(EVENT));
  } catch {
    // Stockage indisponible (navigation privée...) : on ignore.
  }
}

// Renvoie le texte brut sauvegardé (ou null). Utilisé avec useSyncExternalStore.
export function readProfileRaw(): string | null {
  try {
    return localStorage.getItem(KEY);
  } catch {
    return null;
  }
}

export function subscribeProfile(callback: () => void) {
  window.addEventListener("storage", callback);
  window.addEventListener(EVENT, callback);
  return () => {
    window.removeEventListener("storage", callback);
    window.removeEventListener(EVENT, callback);
  };
}

export function parseProfile(raw: string | null): Profile | null {
  if (!raw) return null;
  try {
    const data = JSON.parse(raw) as Partial<Profile>;
    return { ...DEFAULT_PROFILE, ...data };
  } catch {
    return null;
  }
}

// Formate un nombre à la française : 72.5 -> "72,5", 2150 -> "2 150".
export function fr(n: number, decimals = 0) {
  return n.toLocaleString("fr-FR", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}
