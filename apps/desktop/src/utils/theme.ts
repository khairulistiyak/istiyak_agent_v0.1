export const curatedThemes = [
  { id: "zen-dark", name: "Zen Dark", color: "#ffffff" },
  { id: "cursor-dark", name: "Cursor Dark", color: "#38bdf8" },
  { id: "cyber-dark", name: "Cyber Dark", color: "#06b6d4" },
  { id: "matrix-green", name: "Matrix Green", color: "#00ff46" },
  { id: "dracula-purple", name: "Dracula Purple", color: "#ff79c6" },
  { id: "nordic-ice", name: "Nordic Ice", color: "#88c0d0" },
  { id: "solarized-amber", name: "Solarized Amber", color: "#b58900" }
];

export const themes: Record<string, Record<string, string>> = {
  "zen-dark": {
    "--cyber-dark": "#08090a",
    "--cyber-card": "#0f1013",
    "--cyber-card-border": "#16181d",
    "--cyber-glow": "transparent",
    "--cyber-primary": "#ffffff",
    "--cyber-secondary": "#10b981",
    "--cyber-accent": "#5f8aa8",
    "--cyber-text-primary": "#ffffff",
    "--cyber-text-secondary": "#88888c",
    "--cyber-text-muted": "#44444a",
  },
  "cursor-dark": {
    "--cyber-dark": "#18181c",
    "--cyber-card": "#1e1e24",
    "--cyber-card-border": "#2e2e32",
    "--cyber-glow": "transparent",
    "--cyber-primary": "#38bdf8",
    "--cyber-secondary": "#818cf8",
    "--cyber-accent": "#34d399",
    "--cyber-text-primary": "#f3f4f6",
    "--cyber-text-secondary": "#9ca3af",
    "--cyber-text-muted": "#4b5563",
  },
  "cyber-dark": {
    "--cyber-dark": "#07080d",
    "--cyber-card": "#12141c",
    "--cyber-card-border": "#1f222f",
    "--cyber-glow": "transparent",
    "--cyber-primary": "#06b6d4",
    "--cyber-secondary": "#8b5cf6",
    "--cyber-accent": "#10b981",
    "--cyber-text-primary": "#f3f4f6",
    "--cyber-text-secondary": "#a1a1aa",
    "--cyber-text-muted": "#52525b",
  },
  "matrix-green": {
    "--cyber-dark": "#020b05",
    "--cyber-card": "#041209",
    "--cyber-card-border": "#0d3a1b",
    "--cyber-glow": "transparent",
    "--cyber-primary": "#00ff46",
    "--cyber-secondary": "#00aa30",
    "--cyber-accent": "#39ff14",
    "--cyber-text-primary": "#e6ffe9",
    "--cyber-text-secondary": "#80ff9c",
    "--cyber-text-muted": "#1a662c",
  },
  "dracula-purple": {
    "--cyber-dark": "#282a36",
    "--cyber-card": "#222430",
    "--cyber-card-border": "#3a3d52",
    "--cyber-glow": "transparent",
    "--cyber-primary": "#ff79c6",
    "--cyber-secondary": "#bd93f9",
    "--cyber-accent": "#50fa7b",
    "--cyber-text-primary": "#f8f8f2",
    "--cyber-text-secondary": "#6272a4",
    "--cyber-text-muted": "#44475a",
  },
  "nordic-ice": {
    "--cyber-dark": "#2e3440",
    "--cyber-card": "#242933",
    "--cyber-card-border": "#3b4252",
    "--cyber-glow": "transparent",
    "--cyber-primary": "#88c0d0",
    "--cyber-secondary": "#81a1c1",
    "--cyber-accent": "#a3be8c",
    "--cyber-text-primary": "#eceff4",
    "--cyber-text-secondary": "#d8dee9",
    "--cyber-text-muted": "#4c566a",
  },
  "solarized-amber": {
    "--cyber-dark": "#002b36",
    "--cyber-card": "#073642",
    "--cyber-card-border": "#0b4c5c",
    "--cyber-glow": "transparent",
    "--cyber-primary": "#b58900",
    "--cyber-secondary": "#cb4b16",
    "--cyber-accent": "#859900",
    "--cyber-text-primary": "#fdf6e3",
    "--cyber-text-secondary": "#93a1a1",
    "--cyber-text-muted": "#586e75",
  }
};

export function injectTheme(themeName: string): void {
  const themeProps = themes[themeName] || themes["cyber-dark"];
  const root = document.documentElement;
  Object.entries(themeProps).forEach(([variable, val]) => {
    root.style.setProperty(variable, val);
  });
}
