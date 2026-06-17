"use client";

import { cn } from "@/lib/utils";

interface ActionButtonProps {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  variant?: "primary" | "secondary" | "ghost";
  fullWidth?: boolean;
  disabled?: boolean;
  className?: string;
}

export function ActionButton({
  icon,
  label,
  onClick,
  variant = "secondary",
  fullWidth = false,
  disabled = false,
  className,
}: ActionButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold transition-all duration-200 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed",
        variant === "primary" &&
          "text-white shadow-md hover:shadow-lg",
        variant === "secondary" &&
          "border hover:shadow-sm",
        variant === "ghost" &&
          "hover:opacity-80",
        fullWidth && "w-full",
        className
      )}
      style={
        variant === "primary"
          ? {
              background: "var(--primary)",
              color: "white",
            }
          : variant === "secondary"
          ? {
              background: "var(--card)",
              color: "var(--foreground)",
              borderColor: "var(--border)",
            }
          : {
              color: "var(--muted-foreground)",
            }
      }
    >
      {icon}
      {label}
    </button>
  );
}
