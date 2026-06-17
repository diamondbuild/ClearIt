import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";

type ActionButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode;
  variant?: "primary" | "secondary" | "danger" | "ghost";
};

export function ActionButton({ children, className, variant = "primary", ...props }: ActionButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl px-5 py-3 text-sm font-extrabold transition focus:outline-none focus:ring-4 disabled:cursor-not-allowed disabled:opacity-55",
        variant === "primary" &&
          "bg-blue-700 text-white shadow-xl shadow-blue-700/20 hover:bg-blue-800 focus:ring-blue-200 dark:bg-blue-500 dark:hover:bg-blue-400 dark:focus:ring-blue-400/20",
        variant === "secondary" &&
          "border border-slate-200 bg-white text-slate-800 shadow-sm hover:bg-slate-50 focus:ring-slate-200 dark:border-white/10 dark:bg-white/10 dark:text-white dark:hover:bg-white/15 dark:focus:ring-white/10",
        variant === "danger" &&
          "bg-red-600 text-white shadow-xl shadow-red-600/20 hover:bg-red-700 focus:ring-red-200 dark:focus:ring-red-400/20",
        variant === "ghost" &&
          "text-slate-600 hover:bg-slate-100 focus:ring-slate-200 dark:text-slate-300 dark:hover:bg-white/10 dark:focus:ring-white/10",
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}
