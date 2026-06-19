"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Send, Copy, Check, Pencil } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { ClearItAnalysis } from "@/lib/types";

const TONES = ["Firm", "Polite", "Short"] as const;
type Tone = typeof TONES[number];

function adjustTone(text: string, tone: Tone): string {
  if (tone === "Short") {
    const lines = text.split("\n").filter(Boolean);
    return lines.slice(0, Math.ceil(lines.length / 2)).join("\n");
  }
  if (tone === "Firm") return text.replace(/please|kindly|thank you|I appreciate/gi, "").replace(/\s+\./g, ".").trim();
  return text;
}

export default function DraftReplyPage() {
  const router = useRouter();
  const [analysis, setAnalysis] = useState<ClearItAnalysis | null>(null);
  const [tone, setTone] = useState<Tone>("Polite");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const raw = sessionStorage.getItem("clearit_tool_result");
    if (raw) setAnalysis(JSON.parse(raw));
  }, []);

  if (!analysis) return (
    <AppShell title="Draft reply" onBack={() => router.back()}>
      <div className="flex items-center justify-center min-h-[60vh]">
        <p style={{ color: "var(--muted)" }} className="text-sm">No result loaded.</p>
      </div>
    </AppShell>
  );

  const displayText = adjustTone(analysis.replyDraft, tone);
  const recipient = analysis.keyDetails.find(d => d.label.toLowerCase().includes("company") || d.label.toLowerCase().includes("sender"))?.value ?? "Sender";

  const handleCopy = async () => {
    await navigator.clipboard.writeText(displayText).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <AppShell title="Draft reply" onBack={() => router.back()}>
      <div className="px-5 pt-4 pb-8 flex flex-col gap-4">
        {/* To field */}
        <div className="rounded-2xl px-4 py-3 border" style={{ background: "var(--surface)", borderColor: "var(--border)" }}>
          <span className="text-xs font-bold uppercase tracking-widest mr-2" style={{ color: "var(--muted)" }}>To:</span>
          <span className="text-sm font-semibold" style={{ color: "var(--ink)" }}>{recipient}</span>
        </div>

        {/* Tone pills */}
        <div>
          <p className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: "var(--muted)", letterSpacing: "0.1em" }}>Tone</p>
          <div className="flex gap-2">
            {TONES.map(t => (
              <button key={t} onClick={() => setTone(t)}
                className="px-4 py-2 rounded-full text-sm font-semibold transition-all active:scale-95"
                style={tone === t
                  ? { background: "var(--ink)", color: "var(--bg)" }
                  : { background: "var(--surface)", color: "var(--ink)", border: "1px solid var(--border)" }}>
                {t}
              </button>
            ))}
          </div>
        </div>

        {/* Message */}
        <div className="rounded-2xl p-5 border relative" style={{ background: "var(--surface)", borderColor: "var(--border)" }}>
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs font-bold uppercase tracking-widest" style={{ color: "var(--muted)", letterSpacing: "0.1em" }}>Suggested message</p>
            <button className="w-7 h-7 flex items-center justify-center rounded-lg" style={{ background: "var(--violet-tint)", color: "var(--violet-600)" }}>
              <Pencil size={13} strokeWidth={2.2} />
            </button>
          </div>
          <p className="text-sm leading-relaxed whitespace-pre-wrap" style={{ color: "var(--body)" }}>{displayText}</p>
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <button onClick={handleCopy}
            className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-2xl text-sm font-semibold border transition-all active:scale-95"
            style={{ background: "var(--surface)", borderColor: "var(--border)", color: "var(--ink)" }}>
            {copied ? <Check size={16} style={{ color: "var(--u-low-dot)" }} /> : <Copy size={16} />}
            {copied ? "Copied!" : "Copy"}
          </button>
          <button onClick={handleCopy}
            className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-2xl text-sm font-bold text-white transition-all active:scale-95"
            style={{ background: "var(--brand-gradient)", boxShadow: "var(--brand-glow)" }}>
            <Send size={15} strokeWidth={2.2} /> Use this reply
          </button>
        </div>
      </div>
    </AppShell>
  );
}
