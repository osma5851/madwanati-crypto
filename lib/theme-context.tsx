"use client";

import { createContext, useContext, useEffect, useState } from "react";

type Theme = "dark" | "light";

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType>({
  theme: "dark",
  toggleTheme: () => {},
});

// Color tokens for each theme
const THEMES = {
  dark: {
    "--t-bg": "#09090b",
    "--t-bg2": "#111113",
    "--t-bg3": "#18181b",
    "--t-bg4": "#0a0a0c",
    "--t-fg": "#fafafa",
    "--t-fg2": "#a1a1aa",
    "--t-fg3": "#71717a",
    "--t-fg4": "#52525b",
    "--t-fg5": "#3f3f46",
    "--t-border": "#27272a",
    "--t-border2": "#1a1a1e",
    "--t-card": "#111113",
    "--t-nav": "rgba(9,9,11,0.8)",
  },
  light: {
    "--t-bg": "#fafafa",
    "--t-bg2": "#ffffff",
    "--t-bg3": "#f4f4f5",
    "--t-bg4": "#f4f4f5",
    "--t-fg": "#09090b",
    "--t-fg2": "#3f3f46",
    "--t-fg3": "#52525b",
    "--t-fg4": "#71717a",
    "--t-fg5": "#a1a1aa",
    "--t-border": "#e4e4e7",
    "--t-border2": "#e4e4e7",
    "--t-card": "#ffffff",
    "--t-nav": "rgba(255,255,255,0.85)",
  },
};

function applyTheme(theme: Theme) {
  const html = document.documentElement;
  html.classList.toggle("light", theme === "light");
  const tokens = THEMES[theme];
  Object.entries(tokens).forEach(([key, value]) => {
    html.style.setProperty(key, value);
  });
  // Also set body background directly for inline-style pages
  document.body.style.background = tokens["--t-bg"];
  document.body.style.color = tokens["--t-fg"];
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>("dark");

  useEffect(() => {
    const stored = localStorage.getItem("theme") as Theme | null;
    const t = stored || "dark";
    setTheme(t);
    applyTheme(t);
  }, []);

  const toggleTheme = () => {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    localStorage.setItem("theme", next);
    applyTheme(next);
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
