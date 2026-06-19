"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "@/components/ThemeProvider";
import { cn } from "@/lib/utils";

/**
 * Simple, accessible light/dark toggle. Shows the icon for the mode you'll
 * switch INTO (sun in dark mode, moon in light mode).
 */
export function ThemeToggle({ className }: { className?: string }) {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";

  return (
    <button
      type="button"
      onClick={toggleTheme}
      role="switch"
      aria-checked={isDark}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      title={isDark ? "Switch to light mode" : "Switch to dark mode"}
      className={cn(
        "flex h-9 w-9 items-center justify-center rounded-xl border border-border bg-card text-muted-foreground transition hover:text-foreground active:scale-95",
        className,
      )}
    >
      {isDark ? (
        <Sun className="h-4.5 w-4.5" />
      ) : (
        <Moon className="h-4.5 w-4.5" />
      )}
    </button>
  );
}
