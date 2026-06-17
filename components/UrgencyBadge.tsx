import { AlertTriangle, CheckCircle2, HelpCircle, ShieldAlert, Siren } from "lucide-react";
import type { ClearItUrgency } from "@/lib/types";
import { cn, titleCaseLabel } from "@/lib/utils";

const styles: Record<ClearItUrgency, string> = {
  low: "bg-teal-50 text-teal-700 ring-teal-100 dark:bg-teal-400/10 dark:text-teal-200 dark:ring-teal-300/20",
  medium: "bg-amber-50 text-amber-800 ring-amber-100 dark:bg-amber-400/10 dark:text-amber-200 dark:ring-amber-300/20",
  high: "bg-orange-50 text-orange-800 ring-orange-100 dark:bg-orange-400/10 dark:text-orange-200 dark:ring-orange-300/20",
  possible_scam: "bg-red-50 text-red-700 ring-red-100 dark:bg-red-500/10 dark:text-red-200 dark:ring-red-300/20",
  emergency: "bg-red-600 text-white ring-red-200 dark:bg-red-500 dark:text-white dark:ring-red-300/30",
  unknown: "bg-slate-100 text-slate-700 ring-slate-200 dark:bg-white/10 dark:text-slate-200 dark:ring-white/10",
};

const icons = {
  low: CheckCircle2,
  medium: AlertTriangle,
  high: AlertTriangle,
  possible_scam: ShieldAlert,
  emergency: Siren,
  unknown: HelpCircle,
} satisfies Record<ClearItUrgency, typeof CheckCircle2>;

export function UrgencyBadge({ urgency, className }: { urgency: ClearItUrgency; className?: string }) {
  const Icon = icons[urgency];

  return (
    <span className={cn("inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-black ring-1", styles[urgency], className)}>
      <Icon className="size-3.5" aria-hidden="true" />
      {titleCaseLabel(urgency)}
    </span>
  );
}
