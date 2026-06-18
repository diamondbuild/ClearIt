"use client";

import { AlertTriangle, ShieldAlert } from "lucide-react";
import { Urgency } from "@/lib/types";

interface SafetyNoticeProps {
  urgency: Urgency;
  warnings: string[];
  disclaimer: string;
}

export function SafetyNotice({ urgency, warnings, disclaimer }: SafetyNoticeProps) {
  const isScam = urgency === "possible_scam";
  const isEmergency = urgency === "emergency";

  if (!isScam && !isEmergency && warnings.length === 0 && !disclaimer) return null;

  const primaryWarning = warnings.filter(w => !w.includes("Do not click links"))[0];

  return (
    <div className="flex flex-col gap-3">
      {/* Emergency banner */}
      {isEmergency && (
        <div className="rounded-2xl p-4 flex items-start gap-3"
          style={{ background: "#B91C1C", border: "1.5px solid #991B1B" }}>
          <div className="w-9 h-9 rounded-[10px] flex items-center justify-center flex-shrink-0"
            style={{ background: "rgba(255,255,255,.2)" }}>
            <AlertTriangle size={18} className="text-white" strokeWidth={2.2} />
          </div>
          <div>
            <p className="text-sm font-bold text-white">This may require immediate attention.</p>
            <p className="text-xs text-white/80 mt-1">Contact emergency services, the official sender, or a qualified professional.</p>
          </div>
        </div>
      )}

      {/* Scam notice */}
      {isScam && (
        <div className="rounded-2xl p-4 flex items-start gap-3"
          style={{ background: "#FCEAE8", border: "1.5px solid #F4B5AE" }}>
          <div className="w-9 h-9 rounded-[10px] flex items-center justify-center flex-shrink-0"
            style={{ background: "var(--u-scam-dot)" }}>
            <ShieldAlert size={18} className="text-white" strokeWidth={2.2} />
          </div>
          <div>
            <p className="text-sm font-bold" style={{ color: "#A01E19" }}>
              Don&apos;t click the link or call the number.
            </p>
            <p className="text-xs mt-1" style={{ color: "#B5403A" }}>
              Open your bank&apos;s official app or use the number on the back of your card.
            </p>
          </div>
        </div>
      )}

      {/* Other warnings */}
      {primaryWarning && (
        <div className="rounded-2xl p-4 flex items-start gap-3"
          style={{ background: "var(--u-high-bg)", border: "1.5px solid var(--u-high-dot)" }}>
          <div className="w-9 h-9 rounded-[10px] flex items-center justify-center flex-shrink-0"
            style={{ background: "var(--u-high-dot)" }}>
            <AlertTriangle size={18} className="text-white" strokeWidth={2.2} />
          </div>
          <p className="text-sm font-medium" style={{ color: "var(--u-high-text)" }}>
            {primaryWarning}
          </p>
        </div>
      )}

      {/* Disclaimer */}
      {disclaimer && (
        <p className="text-xs leading-relaxed px-1" style={{ color: "var(--muted)" }}>
          {disclaimer}
        </p>
      )}
    </div>
  );
}
