"use client";

import { useEffect, useState } from "react";

const STORAGE_KEY = "clearit_theme";

export function isDark(): boolean {
  if (typeof document === "undefined") return false;
  return document.documentElement.classList.contains("dark");
}

export function applyTheme(dark: boolean) {
  if (typeof document === "undefined") return;
  document.documentElement.classList.toggle("dark", dark);
  try {
    localStorage.setItem(STORAGE_KEY, dark ? "dark" : "light");
  } catch {
    // storage unavailable — ignore
  }
}

/**
 * Light/dark theme hook. The actual class is applied before hydration by the
 * inline script in layout.tsx, so we read it back here to stay in sync.
 */
export function useDarkMode() {
  const [dark, setDark] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setDark(isDark());
    setMounted(true);
  }, []);

  const toggle = () => {
    const next = !isDark();
    applyTheme(next);
    setDark(next);
  };

  const set = (value: boolean) => {
    applyTheme(value);
    setDark(value);
  };

  return { dark, toggle, set, mounted };
}
