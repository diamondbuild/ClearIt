"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Copy, Share2, Check, Focus, Link } from "lucide-react";
import { ClearItAnalysis } from "@/lib/types";
import { categoryLabel, urgencyShortLabel, encodeSharePayload } from "@/lib/utils";
import { UrgencyBadge } from "@/components/UrgencyBadge";

interface ShareSheetProps {
  analysis: ClearItAnalysis;
  onClose: () => void;
}

function urgencyBarColor(urgency: string): string {
  if (urgency === "possible_scam" || urgency === "emergency")
    return "linear-gradient(90deg, #E0322E, #FF6A45)";
  if (urgency === "high") return "linear-gradient(90deg, #E0581E, #FF6A45)";
  if (urgency === "medium") return "linear-gradient(90deg, #B7791F, #F59E0B)";
  if (urgency === "low") return "linear-gradient(90deg, #0E9F6E, #22C55E)";
  return "var(--border)";
}

export function ShareSheet({ analysis, onClose }: ShareSheetProps) {
  const [copied, setCopied] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);

  const getShareUrl = (): string => {
    // Prefer the production domain; fall back to encoded payload for offline/dev
    const base = typeof window !== "undefined" ? window.location.origin : "https://letsconfirmit.com";
    // If the analysis has been saved to Supabase, use clean URL
    // Otherwise fall back to encoded payload URL
    return `${base}/result?id=${analysis.id}`;
  };

  const handleCopyLink = async () => {
    await navigator.clipboard.writeText(getShareUrl()).catch(() => {});
    setLinkCopied(true);
    setTimeout(() => setLinkCopied(false), 2500);
  };

  const handleShare = async () => {
    const url = getShareUrl();
    if (navigator.share) {
      await navigator.share({
        title: analysis.plainTitle,
        text: `${analysis.oneSentenceSummary}\n\nSee the full explanation:`,
        url,
      }).catch(() => handleCopyLink());
    } else {
      handleCopyLink();
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] flex items-end justify-center"
        style={{ background: "rgba(0,0,0,.45)" }}
        onClick={onClose}
      >
        <motion.div
          initial={{ y: "100%" }}
          animate={{ y: 0 }}
          exit={{ y: "100%" }}
          transition={{ type: "spring", damping: 28, stiffness: 300 }}
          className="w-full max-w-md flex flex-col overflow-hidden"
          style={{
            background: "var(--bg)",
            borderRadius: "24px 24px 0 0",
            height: "88dvh",
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Drag handle */}
          <div className="flex justify-center pt-3 pb-1 flex-shrink-0">
            <div className="w-10 h-1 rounded-full" style={{ background: "var(--border)" }} />
          </div>

          {/* Sheet header */}
          <div className="flex items-center justify-between px-5 py-3 flex-shrink-0"
            style={{ borderBottom: "1px solid var(--border)" }}>
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg flex items-center justify-center"
                style={{ background: "var(--brand-gradient)" }}>
                <Focus size={14} className="text-white" strokeWidth={2.2} />
              </div>
              <span className="text-sm font-bold" style={{ color: "var(--ink)" }}>
                LetsConfirmIt Summary
              </span>
            </div>
            <button onClick={onClose}
              className="w-8 h-8 flex items-center justify-center rounded-full"
              style={{ background: "var(--surface-2)" }}>
              <X size={16} style={{ color: "var(--muted)" }} />
            </button>
          </div>

          {/* Scrollable content — min-h-0 required for flex overflow-y-auto to work */}
          <div className="flex-1 min-h-0 overflow-y-auto px-5 py-4 flex flex-col gap-4"
            style={{ scrollbarWidth: "none" }}>

            {/* Hero */}
            <div className="rounded-2xl overflow-hidden border"
              style={{ background: "var(--surface)", borderColor: "var(--border)", boxShadow: "var(--shadow-md)" }}>
              <div className="h-1.5" style={{ background: urgencyBarColor(analysis.urgency) }} />
              <div className="p-4">
                <div className="flex flex-wrap gap-2 mb-3">
                  <span className="text-xs font-bold px-3 py-1 rounded-full"
                    style={{ background: "var(--violet-tint)", color: "var(--violet-700)" }}>
                    {categoryLabel(analysis.category)}
                  </span>
                  <UrgencyBadge urgency={analysis.urgency} size="sm" />
                </div>
                <h2 className="text-lg font-extrabold leading-snug mb-2"
                  style={{ fontFamily: "var(--font-bricolage), sans-serif", color: "var(--ink)", letterSpacing: "-0.01em" }}>
                  {analysis.plainTitle}
                </h2>
                <p className="text-sm leading-relaxed" style={{ color: "var(--muted)" }}>
                  {analysis.oneSentenceSummary}
                </p>
              </div>
            </div>

            {/* What it means */}
            <Block label="What it means">
              <p className="text-sm leading-relaxed" style={{ color: "var(--body)" }}>
                {analysis.whatItMeans}
              </p>
            </Block>

            {/* Next steps */}
            {analysis.nextSteps.length > 0 && (
              <Block label="What to do next">
                <ol className="flex flex-col gap-2 mt-1">
                  {analysis.nextSteps.map((step, i) => (
                    <li key={i} className="flex items-start gap-2.5">
                      <span className="flex-shrink-0 w-5 h-5 rounded-full text-[11px] font-bold flex items-center justify-center mt-0.5"
                        style={{ background: "var(--ink)", color: "var(--bg)" }}>
                        {i + 1}
                      </span>
                      <span className="text-sm leading-relaxed" style={{ color: "var(--body)" }}>{step}</span>
                    </li>
                  ))}
                </ol>
              </Block>
            )}

            {/* Warnings */}
            {analysis.warnings.length > 0 && (
              <div className="rounded-2xl p-4 border"
                style={{ background: "var(--u-high-bg)", borderColor: "var(--u-high-dot)" }}>
                <p className="text-xs font-bold uppercase tracking-widest mb-2"
                  style={{ color: "var(--u-high-text)", letterSpacing: "0.1em" }}>⚠ Watch out for</p>
                <ul className="flex flex-col gap-1.5">
                  {analysis.warnings.map((w, i) => (
                    <li key={i} className="text-sm leading-relaxed" style={{ color: "var(--u-high-text)" }}>
                      • {w}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Key details */}
            {analysis.keyDetails.length > 0 && (
              <Block label="Key details">
                <div className="flex flex-col gap-0">
                  {analysis.keyDetails.map((d, i) => (
                    <div key={i} className="flex justify-between items-start gap-4 py-2 border-b last:border-0"
                      style={{ borderColor: "var(--border)" }}>
                      <span className="text-sm" style={{ color: "var(--muted)" }}>{d.label}</span>
                      <span className="text-sm font-semibold text-right" style={{ color: "var(--ink)" }}>{d.value}</span>
                    </div>
                  ))}
                </div>
              </Block>
            )}

            {/* Deadlines */}
            {analysis.detectedDeadlines.length > 0 && (
              <Block label="Important dates">
                {analysis.detectedDeadlines.map((dl, i) => (
                  <div key={i} className="rounded-xl p-3 mt-1 border"
                    style={{ background: "var(--u-med-bg)", borderColor: "var(--u-med-dot)" }}>
                    <p className="text-sm font-bold" style={{ color: "var(--u-med-text)" }}>
                      {dl.label}: {dl.dateText}
                    </p>
                    <p className="text-xs mt-0.5" style={{ color: "var(--u-med-text)", opacity: 0.8 }}>
                      {dl.explanation}
                    </p>
                  </div>
                ))}
              </Block>
            )}

            {/* Disclaimer */}
            {analysis.disclaimer && (
              <p className="text-xs leading-relaxed px-1" style={{ color: "var(--muted)" }}>
                {analysis.disclaimer}
              </p>
            )}

            {/* Footer */}
            <p className="text-xs text-center pb-1" style={{ color: "var(--muted)" }}>
              Explained by LetsConfirmIt
            </p>
          </div>

          {/* Action buttons — always visible */}
          <div className="flex gap-2 px-5 pt-4 pb-8 flex-shrink-0"
            style={{
              borderTop: "1px solid var(--border)",
              background: "var(--surface)",
              paddingBottom: "max(2rem, env(safe-area-inset-bottom, 2rem))",
            }}>
            <button onClick={handleCopyLink}
              className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-2xl text-sm font-semibold border transition-all active:scale-95"
              style={{ background: "var(--surface-2)", borderColor: "var(--border)", color: linkCopied ? "var(--u-low-text)" : "var(--ink)" }}>
              {linkCopied ? <Check size={16} /> : <Link size={16} />}
              {linkCopied ? "Copied!" : "Copy link"}
            </button>
            <button onClick={handleShare}
              className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-2xl text-sm font-bold text-white transition-all active:scale-95"
              style={{ background: "var(--brand-gradient)", boxShadow: "var(--brand-glow)" }}>
              <Share2 size={16} />
              Send
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

function Block({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl p-4 border"
      style={{ background: "var(--surface)", borderColor: "var(--border)" }}>
      <p className="text-xs font-bold uppercase tracking-widest mb-2"
        style={{ color: "var(--muted)", letterSpacing: "0.1em" }}>
        {label}
      </p>
      {children}
    </div>
  );
}
