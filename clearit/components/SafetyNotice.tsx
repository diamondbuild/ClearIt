"use client";

import { AlertTriangle, ShieldAlert } from "lucide-react";
import { motion } from "framer-motion";
import { Urgency } from "@/lib/types";

interface SafetyNoticeProps {
  urgency: Urgency;
  warnings: string[];
  disclaimer: string;
}

export function SafetyNotice({ urgency, warnings, disclaimer }: SafetyNoticeProps) {
  const isScam = urgency === "possible_scam";
  const isEmergency = urgency === "emergency";

  if (!isScam && !isEmergency && warnings.length === 0 && !disclaimer) {
    return null;
  }

  return (
    <div className="flex flex-col gap-3">
      {isEmergency && (
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="rounded-2xl p-4 border-2"
          style={{
            background: "#fef2f2",
            borderColor: "#ef4444",
          }}
        >
          <div className="flex items-start gap-3">
            <AlertTriangle size={20} className="text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-bold text-red-800 mb-1">
                This may require immediate attention.
              </p>
              <p className="text-sm text-red-700">
                Contact the appropriate emergency service, official sender, or qualified professional.
              </p>
            </div>
          </div>
        </motion.div>
      )}

      {isScam && (
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="rounded-2xl p-4 border-2"
          style={{
            background: "#fef2f2",
            borderColor: "#ef4444",
          }}
        >
          <div className="flex items-start gap-3">
            <ShieldAlert size={20} className="text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-bold text-red-800 mb-1">
                Possible Scam Warning
              </p>
              <p className="text-sm text-red-700">
                Do not click links, call numbers, or send money based only on this
                message. Use the official app, website, or number on the back of your card.
              </p>
            </div>
          </div>
        </motion.div>
      )}

      {warnings.filter((w) => !w.includes("Do not click links")).length > 0 && (
        <div
          className="rounded-2xl p-4 border"
          style={{
            background: "#fffbeb",
            borderColor: "#fbbf24",
          }}
        >
          <p className="text-xs font-semibold text-amber-700 uppercase tracking-wider mb-2">
            Watch Out For
          </p>
          <ul className="flex flex-col gap-2">
            {warnings
              .filter((w) => !w.includes("Do not click links"))
              .map((warning, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="text-amber-500 mt-0.5 text-sm">⚠</span>
                  <span className="text-sm text-amber-800 leading-relaxed">
                    {warning}
                  </span>
                </li>
              ))}
          </ul>
        </div>
      )}

      {disclaimer && (
        <p
          className="text-xs leading-relaxed px-1"
          style={{ color: "var(--muted-foreground)" }}
        >
          {disclaimer}
        </p>
      )}
    </div>
  );
}
