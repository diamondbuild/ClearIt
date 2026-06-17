import { AlertTriangle, ShieldAlert, Siren } from "lucide-react";

import type { ClearItUrgency } from "@/lib/types";
import { cn, urgencyLabelMap, urgencyStyleMap } from "@/lib/utils";

type UrgencyBadgeProps = {
  urgency: ClearItUrgency;
};

export const UrgencyBadge = ({ urgency }: UrgencyBadgeProps) => {
  const icon =
    urgency === "possible_scam" ? (
      <ShieldAlert size={14} />
    ) : urgency === "emergency" ? (
      <Siren size={14} />
    ) : urgency === "high" ? (
      <AlertTriangle size={14} />
    ) : null;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ring-1 ring-inset",
        urgencyStyleMap[urgency],
      )}
    >
      {icon}
      {urgencyLabelMap[urgency]}
    </span>
  );
};
