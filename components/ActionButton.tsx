"use client";

import { forwardRef } from "react";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

type Variant = "primary" | "secondary" | "ghost" | "danger";

type ActionButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  icon?: LucideIcon;
  fullWidth?: boolean;
};

const variants: Record<Variant, string> = {
  primary:
    "bg-primary text-primary-foreground shadow-glow hover:brightness-110 active:brightness-95",
  secondary:
    "bg-card text-foreground border border-border hover:bg-muted active:bg-muted",
  ghost: "bg-transparent text-foreground hover:bg-muted",
  danger:
    "bg-red-50 text-red-700 border border-red-200 hover:bg-red-100 dark:bg-red-500/10 dark:text-red-300 dark:border-red-500/30",
};

export const ActionButton = forwardRef<HTMLButtonElement, ActionButtonProps>(
  function ActionButton(
    {
      variant = "secondary",
      icon: Icon,
      fullWidth,
      className,
      children,
      ...props
    },
    ref,
  ) {
    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center gap-2 rounded-2xl px-4 py-3 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-50",
          fullWidth && "w-full",
          variants[variant],
          className,
        )}
        {...props}
      >
        {Icon ? <Icon className="h-4.5 w-4.5" /> : null}
        {children}
      </button>
    );
  },
);
