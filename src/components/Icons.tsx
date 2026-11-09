// Petites icônes SVG (pas d'emojis dans l'interface).
type P = { size?: number };
const base = (size: number) => ({
  width: size,
  height: size,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 2,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  "aria-hidden": true,
});

export const IconScale = ({ size = 26 }: P) => (
  <svg {...base(size)}><path d="M4 7h16l-1.5 12a2 2 0 0 1-2 1.8H7.5a2 2 0 0 1-2-1.8z" /><path d="M9 11l3 2 3-4" /></svg>
);
export const IconMuscle = ({ size = 26 }: P) => (
  <svg {...base(size)}><path d="M6 9v6M18 9v6M3 11v2M21 11v2M6 12h12" /></svg>
);
export const IconBalance = ({ size = 26 }: P) => (
  <svg {...base(size)}><path d="M12 4v16M5 20h14M5 8h14M5 8l-2.5 6a2.5 2.5 0 0 0 5 0zM19 8l-2.5 6a2.5 2.5 0 0 0 5 0z" /></svg>
);
export const IconSpark = ({ size = 26 }: P) => (
  <svg {...base(size)}><path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8z" /><path d="M19 17l.7 1.8 1.8.7-1.8.7L19 22l-.7-1.8-1.8-.7 1.8-.7z" /></svg>
);
export const IconCheck = ({ size = 18 }: P) => (
  <svg {...base(size)}><path d="M5 12.5l4.5 4.5L19 7.5" /></svg>
);
export const IconUser = ({ size = 22 }: P) => (
  <svg {...base(size)}><circle cx="12" cy="8" r="4" /><path d="M4 21c0-4 3.6-6.5 8-6.5s8 2.5 8 6.5" /></svg>
);
export const IconScan = ({ size = 22 }: P) => (
  <svg {...base(size)}><path d="M3 7V5a2 2 0 0 1 2-2h2M17 3h2a2 2 0 0 1 2 2v2M21 17v2a2 2 0 0 1-2 2h-2M7 21H5a2 2 0 0 1-2-2v-2M7 8v8M10 8v8M14 8v8M17 8v8" /></svg>
);
export const IconInfo = ({ size = 18 }: P) => (
  <svg {...base(size)}><circle cx="12" cy="12" r="9" /><path d="M12 11v5M12 8h.01" /></svg>
);
