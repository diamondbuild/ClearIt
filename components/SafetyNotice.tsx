import { AlertTriangle, Siren } from "lucide-react";

type SafetyNoticeProps = {
  urgency: "low" | "medium" | "high" | "possible_scam" | "emergency" | "unknown";
  warnings: string[];
};

export const SafetyNotice = ({ urgency, warnings }: SafetyNoticeProps) => {
  if (urgency === "emergency") {
    return (
      <div className="mb-4 rounded-2xl border border-red-300 bg-red-100 p-4 text-red-900 shadow-sm">
        <div className="flex items-start gap-3">
          <Siren className="mt-0.5 shrink-0" size={18} />
          <p className="text-sm font-semibold">
            This may require immediate attention. Contact the appropriate emergency service,
            official sender, or qualified professional.
          </p>
        </div>
      </div>
    );
  }

  if (!warnings.length) return null;

  return (
    <section className="clearit-card border-rose-200 bg-rose-50/90">
      <div className="mb-3 flex items-center gap-2 text-rose-700">
        <AlertTriangle size={18} />
        <h3 className="text-sm font-semibold uppercase tracking-wide">Watch out for</h3>
      </div>
      <ul className="space-y-2 text-sm text-rose-800">
        {warnings.map((warning) => (
          <li key={warning} className="flex gap-2">
            <span aria-hidden>•</span>
            <span>{warning}</span>
          </li>
        ))}
      </ul>
    </section>
  );
};
