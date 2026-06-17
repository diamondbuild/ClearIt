import {
  ShieldAlert,
  AlertTriangle,
  CheckCircle2,
  AlertCircle,
  Siren,
  HelpCircle,
} from "lucide-react";
import { Urgency } from "@/lib/types";
import { urgencyLabel, cn } from "@/lib/utils";

const styles: Record<
  Urgency,
  { className: string; Icon: typeof ShieldAlert }
> = {
  low: {
    className:
      "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-300 dark:border-emerald-500/30",
    Icon: CheckCircle2,
  },
  medium: {
    className:
      "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/10 dark:text-amber-300 dark:border-amber-500/30",
    Icon: AlertCircle,
  },
  high: {
    className:
      "bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-500/10 dark:text-orange-300 dark:border-orange-500/30",
    Icon: AlertTriangle,
  },
  possible_scam: {
    className:
      "bg-red-50 text-red-700 border-red-200 dark:bg-red-500/10 dark:text-red-300 dark:border-red-500/30",
    Icon: ShieldAlert,
  },
  emergency: {
    className:
      "bg-red-600 text-white border-red-700 dark:bg-red-600 dark:text-white dark:border-red-500",
    Icon: Siren,
  },
  unknown: {
    className:
      "bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-500/10 dark:text-slate-300 dark:border-slate-500/30",
    Icon: HelpCircle,
  },
};

export function UrgencyBadge({
  urgency,
  size = "md",
}: {
  urgency: Urgency;
  size?: "sm" | "md";
}) {
  const { className, Icon } = styles[urgency] ?? styles.unknown;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border font-semibold",
        size === "sm" ? "px-2.5 py-0.5 text-xs" : "px-3 py-1 text-sm",
        className,
      )}
    >
      <Icon className={size === "sm" ? "h-3.5 w-3.5" : "h-4 w-4"} />
      {urgencyLabel(urgency)}
    </span>
  );
}
