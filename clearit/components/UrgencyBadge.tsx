"use client";

import { ShieldAlert, AlertTriangle, Zap, CheckCircle, HelpCircle, Info } from "lucide-react";
import { Urgency } from "@/lib/types";
import { cn } from "@/lib/utils";

interface UrgencyBadgeProps {
  urgency: Urgency;
  size?: "sm" | "md";
  className?: string;
}

const config: Record<Urgency, { label: string; icon: React.ElementType; style: React.CSSProperties }> = {
  low: {
    label: "Low priority",
    icon: CheckCircle,
    style: { color: "var(--u-low-text)", background: "var(--u-low-bg)" },
  },
  medium: {
    label: "Medium",
    icon: Info,
    style: { color: "var(--u-med-text)", background: "var(--u-med-bg)" },
  },
  high: {
    label: "High priority",
    icon: Zap,
    style: { color: "var(--u-high-text)", background: "var(--u-high-bg)" },
  },
  possible_scam: {
    label: "Possible scam",
    icon: ShieldAlert,
    style: { color: "var(--u-scam-text)", background: "var(--u-scam-bg)" },
  },
  emergency: {
    label: "Emergency",
    icon: AlertTriangle,
    style: { color: "#fff", background: "#B91C1C" },
  },
  unknown: {
    label: "Unknown",
    icon: HelpCircle,
    style: { color: "var(--muted)", background: "var(--surface-2)" },
  },
};

const sizeClasses = {
  sm: "text-xs px-2.5 py-1 gap-1",
  md: "text-sm px-3 py-1.5 gap-1.5",
};

const iconSizes = { sm: 12, md: 14 };

export function UrgencyBadge({ urgency, size = "sm", className }: UrgencyBadgeProps) {
  const c = config[urgency] ?? config.unknown;
  const Icon = c.icon;
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full font-semibold",
        sizeClasses[size],
        className
      )}
      style={c.style}
    >
      <Icon size={iconSizes[size]} className="flex-shrink-0" strokeWidth={2.2} />
      {c.label}
    </span>
  );
}

export function UrgencyDot({ urgency }: { urgency: Urgency }) {
  const colors: Record<Urgency, string> = {
    low:          "var(--u-low-dot)",
    medium:       "var(--u-med-dot)",
    high:         "var(--u-high-dot)",
    possible_scam:"var(--u-scam-dot)",
    emergency:    "#B91C1C",
    unknown:      "var(--disabled)",
  };
  return (
    <span
      className="inline-block w-2.5 h-2.5 rounded-full flex-shrink-0"
      style={{ background: colors[urgency] ?? colors.unknown }}
    />
  );
}
