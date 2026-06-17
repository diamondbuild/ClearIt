"use client";

import { AlertTriangle, ShieldAlert, Zap, Info, HelpCircle, CheckCircle } from "lucide-react";
import { Urgency } from "@/lib/types";
import { cn } from "@/lib/utils";

interface UrgencyBadgeProps {
  urgency: Urgency;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const urgencyConfig: Record<
  Urgency,
  {
    label: string;
    icon: React.ElementType;
    className: string;
  }
> = {
  low: {
    label: "Low Priority",
    icon: CheckCircle,
    className: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800",
  },
  medium: {
    label: "Medium Priority",
    icon: Info,
    className: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-800",
  },
  high: {
    label: "High Priority",
    icon: Zap,
    className: "bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-950/40 dark:text-orange-400 dark:border-orange-800",
  },
  possible_scam: {
    label: "Possible Scam",
    icon: ShieldAlert,
    className: "bg-red-50 text-red-700 border-red-200 dark:bg-red-950/40 dark:text-red-400 dark:border-red-800",
  },
  emergency: {
    label: "Emergency",
    icon: AlertTriangle,
    className: "bg-red-100 text-red-800 border-red-300 dark:bg-red-950/60 dark:text-red-300 dark:border-red-700",
  },
  unknown: {
    label: "Unknown",
    icon: HelpCircle,
    className: "bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700",
  },
};

const sizeClasses = {
  sm: "text-xs px-2 py-0.5 gap-1",
  md: "text-sm px-3 py-1 gap-1.5",
  lg: "text-base px-4 py-1.5 gap-2",
};

const iconSizes = {
  sm: 12,
  md: 14,
  lg: 16,
};

export function UrgencyBadge({ urgency, size = "md", className }: UrgencyBadgeProps) {
  const config = urgencyConfig[urgency] ?? urgencyConfig.unknown;
  const Icon = config.icon;

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border font-medium",
        sizeClasses[size],
        config.className,
        className
      )}
    >
      <Icon size={iconSizes[size]} className="flex-shrink-0" />
      {config.label}
    </span>
  );
}
