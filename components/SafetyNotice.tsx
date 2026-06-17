import { AlertTriangle, ShieldAlert } from "lucide-react";
import type { ClearItUrgency } from "@/lib/types";
import { cn } from "@/lib/utils";

export function SafetyNotice({ urgency, warnings }: { urgency: ClearItUrgency; warnings: string[] }) {
  if (urgency !== "emergency" && warnings.length === 0) {
    return null;
  }

  const emergency = urgency === "emergency";
  const Icon = emergency ? ShieldAlert : AlertTriangle;

  return (
    <section
      className={cn(
        "rounded-[1.75rem] border p-4",
        emergency
          ? "border-red-200 bg-red-600 text-white shadow-xl shadow-red-600/20"
          : "border-amber-200 bg-amber-50 text-amber-950 dark:border-amber-300/20 dark:bg-amber-400/10 dark:text-amber-100",
      )}
    >
      <div className="flex gap-3">
        <Icon className="mt-0.5 size-5 shrink-0" aria-hidden="true" />
        <div>
          <h3 className="font-black">{emergency ? "This may require immediate attention." : "Watch out for this"}</h3>
          {emergency ? (
            <p className="mt-1 text-sm leading-6 text-white/90">
              Contact the appropriate emergency service, official sender, or qualified professional.
            </p>
          ) : null}
          {warnings.length ? (
            <ul className="mt-2 space-y-1 text-sm leading-6">
              {warnings.map((warning) => (
                <li key={warning}>• {warning}</li>
              ))}
            </ul>
          ) : null}
        </div>
      </div>
    </section>
  );
}
