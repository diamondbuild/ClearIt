"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Copy, Share2, Check, ShieldCheck } from "lucide-react";
import { ClearItAnalysis } from "@/lib/types";
import { urgencyShortLabel } from "@/lib/utils";

interface ClearItCardProps {
  analysis: ClearItAnalysis;
}

export function ClearItCard({ analysis }: ClearItCardProps) {
  const [copied, setCopied] = useState(false);

  const cardText = `ClearIt Summary
━━━━━━━━━━━━━━━
This is:
${analysis.shareCard.title}

Urgency:
${urgencyShortLabel(analysis.urgency)}

What it means:
${analysis.shareCard.meaning}

Next step:
${analysis.shareCard.nextStep}

━━━━━━━━━━━━━━━
Explained by ClearIt`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(cardText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: "ClearIt Summary",
          text: cardText,
        });
      } catch {
        handleCopy();
      }
    } else {
      handleCopy();
    }
  };

  return (
    <div
      className="rounded-2xl overflow-hidden border"
      style={{
        borderColor: "var(--border)",
        boxShadow: "var(--shadow-md)",
      }}
    >
      {/* Card header */}
      <div
        className="px-4 py-3 flex items-center gap-2"
        style={{ background: "var(--primary)" }}
      >
        <ShieldCheck size={16} className="text-white opacity-80" />
        <span className="text-sm font-semibold text-white">ClearIt Summary</span>
      </div>

      {/* Card body */}
      <div
        className="px-4 py-4 flex flex-col gap-3"
        style={{ background: "var(--card)" }}
      >
        <div>
          <p
            className="text-xs font-semibold uppercase tracking-wider mb-1"
            style={{ color: "var(--muted-foreground)" }}
          >
            This is
          </p>
          <p
            className="text-sm font-semibold leading-snug"
            style={{ color: "var(--foreground)" }}
          >
            {analysis.shareCard.title}
          </p>
        </div>

        <div>
          <p
            className="text-xs font-semibold uppercase tracking-wider mb-1"
            style={{ color: "var(--muted-foreground)" }}
          >
            Urgency
          </p>
          <p className="text-sm font-medium" style={{ color: "var(--foreground)" }}>
            {urgencyShortLabel(analysis.urgency)}
          </p>
        </div>

        <div>
          <p
            className="text-xs font-semibold uppercase tracking-wider mb-1"
            style={{ color: "var(--muted-foreground)" }}
          >
            What it means
          </p>
          <p
            className="text-sm leading-relaxed"
            style={{ color: "var(--foreground)" }}
          >
            {analysis.shareCard.meaning}
          </p>
        </div>

        <div>
          <p
            className="text-xs font-semibold uppercase tracking-wider mb-1"
            style={{ color: "var(--muted-foreground)" }}
          >
            Next step
          </p>
          <p
            className="text-sm font-medium leading-relaxed"
            style={{ color: "var(--foreground)" }}
          >
            {analysis.shareCard.nextStep}
          </p>
        </div>

        <p
          className="text-xs pt-2 border-t"
          style={{
            color: "var(--muted-foreground)",
            borderColor: "var(--border)",
          }}
        >
          Explained by ClearIt
        </p>
      </div>

      {/* Actions */}
      <div
        className="px-4 py-3 flex gap-2 border-t"
        style={{
          background: "var(--muted)",
          borderColor: "var(--border)",
        }}
      >
        <button
          onClick={handleCopy}
          className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-all active:scale-95 border"
          style={{
            background: "var(--card)",
            borderColor: "var(--border)",
            color: "var(--foreground)",
          }}
        >
          <AnimatePresence mode="wait">
            {copied ? (
              <motion.span
                key="check"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0 }}
                className="flex items-center gap-2 text-emerald-600"
              >
                <Check size={16} />
                Copied!
              </motion.span>
            ) : (
              <motion.span
                key="copy"
                className="flex items-center gap-2"
              >
                <Copy size={16} />
                Copy
              </motion.span>
            )}
          </AnimatePresence>
        </button>
        <button
          onClick={handleShare}
          className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-all active:scale-95 text-white"
          style={{ background: "var(--primary)" }}
        >
          <Share2 size={16} />
          Share
        </button>
      </div>
    </div>
  );
}
