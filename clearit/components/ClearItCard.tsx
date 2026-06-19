"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Copy, Share2, Check, Focus } from "lucide-react";
import { ClearItAnalysis } from "@/lib/types";
import { urgencyShortLabel } from "@/lib/utils";

interface ClearItCardProps {
  analysis: ClearItAnalysis;
}

export function ClearItCard({ analysis }: ClearItCardProps) {
  const [copied, setCopied] = useState(false);

  const cardText = `LetsConfirmIt Summary\n\nThis is:\n${analysis.shareCard.title}\n\nUrgency: ${urgencyShortLabel(analysis.urgency)}\n\nWhat it means:\n${analysis.shareCard.meaning}\n\nNext step:\n${analysis.shareCard.nextStep}\n\nExplained by LetsConfirmIt`;

  const handleCopy = async () => {
    await navigator.clipboard.writeText(cardText).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = async () => {
    if (navigator.share) {
      await navigator.share({ title: "LetsConfirmIt Summary", text: cardText }).catch(() => handleCopy());
    } else {
      handleCopy();
    }
  };

  return (
    <div className="rounded-2xl overflow-hidden border" style={{ borderColor: "var(--border)", boxShadow: "var(--shadow-md)" }}>
      {/* Card header */}
      <div className="px-4 py-3 flex items-center gap-2" style={{ background: "var(--brand-gradient)" }}>
        <Focus size={15} className="text-white opacity-80" />
        <span className="text-sm font-bold text-white">LetsConfirmIt Summary</span>
      </div>

      {/* Card body */}
      <div className="px-4 py-4 flex flex-col gap-3" style={{ background: "var(--surface)" }}>
        {[
          { label: "This is", value: analysis.shareCard.title },
          { label: "Urgency", value: urgencyShortLabel(analysis.urgency) },
          { label: "What it means", value: analysis.shareCard.meaning },
          { label: "Next step", value: analysis.shareCard.nextStep },
        ].map(({ label, value }) => (
          <div key={label}>
            <p className="text-xs font-bold uppercase tracking-widest mb-0.5" style={{ color: "var(--muted)", letterSpacing: "0.1em" }}>{label}</p>
            <p className="text-sm font-medium" style={{ color: "var(--ink)" }}>{value}</p>
          </div>
        ))}
        <p className="text-xs pt-2 border-t" style={{ color: "var(--muted)", borderColor: "var(--border)" }}>
          Explained by LetsConfirmIt
        </p>
      </div>

      {/* Actions */}
      <div className="px-4 py-3 flex gap-2 border-t" style={{ background: "var(--surface-2)", borderColor: "var(--border)" }}>
        <button onClick={handleCopy}
          className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-all active:scale-95 border"
          style={{ background: "var(--surface)", borderColor: "var(--border)", color: "var(--ink)" }}>
          <AnimatePresence mode="wait">
            {copied
              ? <motion.span key="c" initial={{ scale: 0 }} animate={{ scale: 1 }} className="flex items-center gap-2" style={{ color: "var(--u-low-dot)" }}><Check size={15} /> Copied!</motion.span>
              : <motion.span key="u" className="flex items-center gap-2"><Copy size={15} /> Copy</motion.span>}
          </AnimatePresence>
        </button>
        <button onClick={handleShare}
          className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold text-white transition-all active:scale-95"
          style={{ background: "var(--brand-gradient)" }}>
          <Share2 size={15} /> Share
        </button>
      </div>
    </div>
  );
}
