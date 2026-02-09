import { defineStore } from "pinia";

export type Theme = "light" | "dark";

const STORAGE_KEY = "clazino_theme";

export function applyThemeClass(theme: Theme) {
  const root = document.documentElement;
  if (theme === "dark") root.classList.add("dark");
  else root.classList.remove("dark");
}

export const useThemeStore = defineStore("theme", {
  state: (): { theme: Theme } => ({
    theme: (() => {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored === "light" ? "light" : "dark";
    })(),
  }),
  actions: {
    setTheme(t: Theme) {
      this.theme = t;
      applyThemeClass(t);
      localStorage.setItem(STORAGE_KEY, t);
    },
    toggleTheme() {
      const next = this.theme === "dark" ? "light" : "dark";
      this.setTheme(next);
    },
  },
});
