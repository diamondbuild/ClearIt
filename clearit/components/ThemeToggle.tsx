"use client";

import { Moon, Sun } from "lucide-react";
import { useDarkMode } from "@/lib/theme";

/**
 * Compact light/dark toggle button. Shows the icon for the mode you'll switch
 * INTO (sun when dark, moon when light).
 */
export function ThemeToggle({ size = 36 }: { size?: number }) {
  const { dark, toggle, mounted } = useDarkMode();

  return (
    <button
      type="button"
      onClick={toggle}
      role="switch"
      aria-checked={dark}
      aria-label={dark ? "Switch to light mode" : "Switch to dark mode"}
      title={dark ? "Switch to light mode" : "Switch to dark mode"}
      className="rounded-xl flex items-center justify-center transition-all active:scale-90"
      style={{
        width: size,
        height: size,
        background: "var(--surface-2)",
        border: "1px solid var(--border)",
      }}
    >
      {/* Render a stable icon until mounted to avoid hydration mismatch */}
      {mounted && dark ? (
        <Sun size={18} style={{ color: "var(--ink)" }} strokeWidth={2.2} />
      ) : (
        <Moon size={18} style={{ color: "var(--ink)" }} strokeWidth={2.2} />
      )}
    </button>
  );
}
