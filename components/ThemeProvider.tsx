"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { getSettings, saveSettings } from "@/lib/storage/history";

type Theme = "light" | "dark";

type ThemeContextValue = {
  theme: Theme;
  toggleTheme: () => void;
  seniorMode: boolean;
  setSeniorMode: (value: boolean) => void;
};

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>("light");
  const [seniorMode, setSeniorModeState] = useState(false);

  useEffect(() => {
    const stored = window.localStorage.getItem("clearit:theme") as Theme | null;
    const prefersDark =
      window.matchMedia &&
      window.matchMedia("(prefers-color-scheme: dark)").matches;
    const initial: Theme = stored ?? (prefersDark ? "dark" : "light");
    setTheme(initial);
    setSeniorModeState(getSettings().seniorMode);
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    if (theme === "dark") root.classList.add("dark");
    else root.classList.remove("dark");
    window.localStorage.setItem("clearit:theme", theme);
  }, [theme]);

  useEffect(() => {
    const body = document.body;
    if (seniorMode) body.classList.add("senior-mode");
    else body.classList.remove("senior-mode");
  }, [seniorMode]);

  const toggleTheme = () =>
    setTheme((t) => (t === "dark" ? "light" : "dark"));

  const setSeniorMode = (value: boolean) => {
    setSeniorModeState(value);
    saveSettings({ seniorMode: value });
  };

  return (
    <ThemeContext.Provider
      value={{ theme, toggleTheme, seniorMode, setSeniorMode }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    return {
      theme: "light",
      toggleTheme: () => {},
      seniorMode: false,
      setSeniorMode: () => {},
    };
  }
  return ctx;
}
