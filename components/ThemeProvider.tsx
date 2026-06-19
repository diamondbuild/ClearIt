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

function getInitialTheme(): Theme {
  // The inline script in <head> applies the correct class before hydration,
  // so we read it back here to keep React state in sync and avoid a flash.
  if (typeof document !== "undefined") {
    return document.documentElement.classList.contains("dark")
      ? "dark"
      : "light";
  }
  return "light";
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>(getInitialTheme);
  const [seniorMode, setSeniorModeState] = useState(false);

  useEffect(() => {
    setSeniorModeState(getSettings().seniorMode);
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    if (theme === "dark") root.classList.add("dark");
    else root.classList.remove("dark");
    try {
      window.localStorage.setItem("clearit:theme", theme);
    } catch {
      // storage unavailable — ignore
    }
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
