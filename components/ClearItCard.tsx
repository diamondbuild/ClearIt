"use client";

import { useState } from "react";
import { Copy, Share2 } from "lucide-react";

import type { ClearItAnalysis } from "@/lib/types";

type ClearItCardProps = {
  analysis: ClearItAnalysis;
};

const cardText = (analysis: ClearItAnalysis) =>
  [
    "ClearIt Summary",
    "",
    `This is: ${analysis.shareCard.title}`,
    `Urgency: ${analysis.shareCard.urgency}`,
    `What it means: ${analysis.shareCard.meaning}`,
    `Next step: ${analysis.shareCard.nextStep}`,
    "",
    "Explained by ClearIt",
  ].join("\n");

export const ClearItCard = ({ analysis }: ClearItCardProps) => {
  const [copied, setCopied] = useState(false);
  const shareText = cardText(analysis);

  const onCopy = async () => {
    await navigator.clipboard.writeText(shareText);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  };

  const onShare = async () => {
    if (!navigator.share) {
      await onCopy();
      return;
    }

    await navigator.share({
      title: "ClearIt Summary",
      text: shareText,
    });
  };

  return (
    <section className="clearit-card border-indigo-200 bg-indigo-50/70">
      <p className="text-xs font-semibold uppercase tracking-[0.12em] text-indigo-600">
        ClearIt Summary
      </p>
      <div className="mt-3 space-y-2 text-sm text-slate-800">
        <p>
          <strong>This is:</strong> {analysis.shareCard.title}
        </p>
        <p>
          <strong>Urgency:</strong> {analysis.shareCard.urgency}
        </p>
        <p>
          <strong>What it means:</strong> {analysis.shareCard.meaning}
        </p>
        <p>
          <strong>Next step:</strong> {analysis.shareCard.nextStep}
        </p>
      </div>
      <p className="mt-4 text-xs text-slate-500">Explained by ClearIt</p>
      <div className="mt-4 grid grid-cols-2 gap-2">
        <button type="button" className="clearit-secondary-btn justify-center" onClick={onCopy}>
          <Copy size={16} />
          {copied ? "Copied" : "Copy"}
        </button>
        <button type="button" className="clearit-secondary-btn justify-center" onClick={onShare}>
          <Share2 size={16} />
          Share
        </button>
      </div>
    </section>
  );
};
