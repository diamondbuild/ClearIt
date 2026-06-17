"use client";

import { Check, Copy, Share2 } from "lucide-react";
import { useMemo, useState } from "react";
import { ActionButton } from "@/components/ActionButton";
import type { ClearItAnalysis } from "@/lib/types";

export function buildShareText(result: ClearItAnalysis) {
  return `ClearIt Summary

This is:
${result.shareCard.title || result.plainTitle}

Urgency:
${result.shareCard.urgency}

What it means:
${result.shareCard.meaning}

Next step:
${result.shareCard.nextStep}

Explained by ClearIt`;
}

export function ClearItCard({ result }: { result: ClearItAnalysis }) {
  const [copied, setCopied] = useState(false);
  const shareText = useMemo(() => buildShareText(result), [result]);

  async function copySummary() {
    await navigator.clipboard.writeText(shareText);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  }

  async function shareSummary() {
    if (navigator.share) {
      await navigator.share({ title: "ClearIt Summary", text: shareText });
      return;
    }

    await copySummary();
  }

  return (
    <section className="rounded-[2rem] border border-blue-100 bg-gradient-to-br from-blue-700 to-teal-600 p-5 text-white shadow-2xl shadow-blue-900/20">
      <p className="text-xs font-black uppercase tracking-[0.22em] text-blue-100">ClearIt Summary</p>
      <h3 className="mt-3 text-2xl font-black tracking-tight">{result.shareCard.title || result.plainTitle}</h3>
      <dl className="mt-5 space-y-4 text-sm leading-6">
        <div>
          <dt className="font-black text-blue-100">Urgency</dt>
          <dd>{result.shareCard.urgency}</dd>
        </div>
        <div>
          <dt className="font-black text-blue-100">What it means</dt>
          <dd>{result.shareCard.meaning}</dd>
        </div>
        <div>
          <dt className="font-black text-blue-100">Next step</dt>
          <dd>{result.shareCard.nextStep}</dd>
        </div>
      </dl>
      <p className="mt-5 text-xs font-bold text-blue-100">Explained by ClearIt</p>
      <div className="mt-5 grid grid-cols-2 gap-3">
        <ActionButton type="button" variant="secondary" className="border-white/20 bg-white/15 text-white hover:bg-white/20" onClick={copySummary}>
          {copied ? <Check className="size-4" aria-hidden="true" /> : <Copy className="size-4" aria-hidden="true" />}
          {copied ? "Copied" : "Copy"}
        </ActionButton>
        <ActionButton type="button" variant="secondary" className="border-white/20 bg-white text-blue-800 hover:bg-blue-50" onClick={shareSummary}>
          <Share2 className="size-4" aria-hidden="true" />
          Share
        </ActionButton>
      </div>
    </section>
  );
}
