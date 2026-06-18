"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Phone, CheckCircle } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { ClearItAnalysis } from "@/lib/types";

export default function CallScriptPage() {
  const router = useRouter();
  const [analysis, setAnalysis] = useState<ClearItAnalysis | null>(null);

  useEffect(() => {
    const raw = sessionStorage.getItem("clearit_tool_result");
    if (raw) setAnalysis(JSON.parse(raw));
  }, []);

  if (!analysis) {
    return (
      <AppShell title="Call script" backHref="/">
        <div className="flex items-center justify-center min-h-[60vh]">
          <p style={{ color: "var(--muted)" }} className="text-sm">No result loaded.</p>
        </div>
      </AppShell>
    );
  }

  const phoneMatch = analysis.callScript.match(/\b[\d\s\-\(\)]{7,}\b/);
  const phoneNumber = phoneMatch ? phoneMatch[0].trim() : null;

  return (
    <AppShell title="Call script" onBack={() => router.back()}>
      <div className="px-5 pt-4 pb-8 flex flex-col gap-4">
        {/* Context row */}
        <div className="flex items-center gap-3 p-4 rounded-2xl border"
          style={{ background: "var(--surface)", borderColor: "var(--border)" }}>
          <div className="w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0"
            style={{ background: "var(--brand-gradient)" }}>
            <Phone size={20} className="text-white" strokeWidth={2.2} />
          </div>
          <div>
            <p className="text-sm font-bold" style={{ color: "var(--ink)" }}>Call your contact directly</p>
            <p className="text-xs mt-0.5" style={{ color: "var(--muted)" }}>Use the number on the back of your card</p>
          </div>
        </div>

        {/* Phone number card */}
        {phoneNumber && (
          <div className="rounded-2xl p-5" style={{ background: "var(--violet-tint)", border: "1px solid var(--violet-200)" }}>
            <p className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: "var(--violet-700)", letterSpacing: "0.1em" }}>Official number</p>
            <p className="text-3xl font-extrabold" style={{ fontFamily: "var(--font-bricolage), sans-serif", color: "var(--ink)" }}>
              {phoneNumber}
            </p>
          </div>
        )}

        {/* Script card */}
        <div className="rounded-2xl p-5 border" style={{ background: "var(--surface)", borderColor: "var(--border)" }}>
          <div className="flex items-center gap-2 mb-3">
            <div className="w-7 h-7 rounded-[8px] flex items-center justify-center"
              style={{ background: "var(--u-scam-bg)" }}>
              <Phone size={14} style={{ color: "var(--u-scam-dot)" }} strokeWidth={2.2} />
            </div>
            <p className="text-sm font-bold" style={{ color: "var(--ink)" }}>Say this</p>
          </div>
          <p className="text-sm leading-relaxed whitespace-pre-wrap" style={{ color: "var(--body)" }}>
            {analysis.callScript}
          </p>
        </div>

        {/* Reassurance */}
        <div className="flex items-start gap-2.5">
          <CheckCircle size={16} style={{ color: "var(--u-low-dot)" }} className="flex-shrink-0 mt-0.5" />
          <p className="text-sm" style={{ color: "var(--u-low-text)" }}>
            They&apos;ll never ask for your full PIN or password.
          </p>
        </div>

        {/* Call button */}
        {phoneNumber && (
          <a href={`tel:${phoneNumber.replace(/\s/g, "")}`}
            className="w-full flex items-center justify-center gap-2.5 py-4 rounded-2xl text-base font-bold text-white transition-all active:scale-[0.98]"
            style={{ background: "var(--brand-gradient)", boxShadow: "var(--brand-glow)" }}>
            <Phone size={18} strokeWidth={2.2} />
            Call now
          </a>
        )}
      </div>
    </AppShell>
  );
}
