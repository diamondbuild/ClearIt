"use client";

import type { ReactNode } from "react";
import { useState } from "react";
import Link from "next/link";
import { Check, ClipboardList, Copy, FileText, MessageSquareText, Phone, Save, Share2, Sparkles } from "lucide-react";
import { ActionButton } from "@/components/ActionButton";
import { ClearItCard, buildShareText } from "@/components/ClearItCard";
import { SafetyNotice } from "@/components/SafetyNotice";
import { UrgencyBadge } from "@/components/UrgencyBadge";
import type { ClearItAnalysis } from "@/lib/types";
import { saveAnalysisToHistory } from "@/lib/storage/history";
import { formatDateTime, titleCaseLabel } from "@/lib/utils";

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="glass-card rounded-[2rem] p-5">
      <h2 className="text-xs font-black uppercase tracking-[0.18em] text-blue-700 dark:text-blue-300">{title}</h2>
      <div className="mt-3 text-[15px] leading-7 text-slate-700 dark:text-slate-200">{children}</div>
    </section>
  );
}

function GeneratedPanel({ title, body, items }: { title: string; body?: string; items?: string[] }) {
  return (
    <div className="rounded-[1.5rem] border border-blue-100 bg-blue-50/70 p-4 text-sm leading-6 text-slate-800 dark:border-blue-300/20 dark:bg-blue-400/10 dark:text-slate-100">
      <h3 className="font-black text-slate-950 dark:text-white">{title}</h3>
      {body ? <p className="mt-2 whitespace-pre-line">{body}</p> : null}
      {items?.length ? (
        <ul className="mt-2 space-y-2">
          {items.map((item) => (
            <li key={item} className="flex gap-2">
              <Check className="mt-1 size-4 shrink-0 text-teal-600 dark:text-teal-300" aria-hidden="true" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}

export function ResultCard({
  result,
  originalText,
  imageUsed,
}: {
  result: ClearItAnalysis;
  originalText?: string;
  imageUsed: boolean;
}) {
  const [panel, setPanel] = useState<"call" | "reply" | "checklist" | "simple" | "share" | null>(null);
  const [saved, setSaved] = useState(false);
  const [copied, setCopied] = useState(false);

  function saveResult() {
    saveAnalysisToHistory(result, { originalText, imageUsed });
    setSaved(true);
  }

  async function shareSummary() {
    const text = buildShareText(result);

    if (navigator.share) {
      await navigator.share({ title: "ClearIt Summary", text });
      return;
    }

    await navigator.clipboard.writeText(text);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  }

  return (
    <div className="space-y-4">
      <section className="glass-card rounded-[2.25rem] p-5">
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-black text-slate-700 ring-1 ring-slate-200 dark:bg-white/10 dark:text-slate-200 dark:ring-white/10">
            {titleCaseLabel(result.category)}
          </span>
          <UrgencyBadge urgency={result.urgency} />
        </div>
        <p className="mt-5 text-xs font-black uppercase tracking-[0.22em] text-slate-500 dark:text-slate-400">ClearIt Result</p>
        <h1 className="mt-2 text-3xl font-black tracking-tight text-slate-950 dark:text-white">{result.plainTitle}</h1>
        <p className="mt-3 text-base leading-7 text-slate-600 dark:text-slate-300">{result.oneSentenceSummary}</p>
        <div className="mt-5 flex flex-wrap gap-2 text-xs font-bold text-slate-500 dark:text-slate-400">
          <span>Confidence: {titleCaseLabel(result.confidence)}</span>
          <span aria-hidden="true">•</span>
          <span>{formatDateTime(result.createdAt)}</span>
        </div>
      </section>

      <SafetyNotice urgency={result.urgency} warnings={result.warnings} />

      <Section title="What this is">{result.whatThisIs}</Section>
      <Section title="What it means">{result.whatItMeans}</Section>
      <Section title="Why it matters">{result.whyItMatters}</Section>

      <Section title="What to do next">
        <ul className="space-y-3">
          {result.nextSteps.map((step) => (
            <li key={step} className="flex gap-3">
              <span className="mt-1 grid size-5 shrink-0 place-items-center rounded-full bg-teal-100 text-xs font-black text-teal-700 dark:bg-teal-300/20 dark:text-teal-200">
                ✓
              </span>
              <span>{step}</span>
            </li>
          ))}
        </ul>
      </Section>

      {result.keyDetails.length ? (
        <Section title="Key details found">
          <dl className="space-y-3">
            {result.keyDetails.map((detail) => (
              <div key={`${detail.label}-${detail.value}`} className="rounded-2xl bg-slate-50 p-3 dark:bg-white/5">
                <dt className="text-xs font-black uppercase tracking-[0.12em] text-slate-500 dark:text-slate-400">{detail.label}</dt>
                <dd className="mt-1 font-bold text-slate-900 dark:text-white">{detail.value}</dd>
              </div>
            ))}
          </dl>
        </Section>
      ) : null}

      {result.detectedDeadlines.length ? (
        <Section title="Important dates">
          <div className="space-y-3">
            {result.detectedDeadlines.map((deadline) => (
              <div key={`${deadline.label}-${deadline.dateText}`} className="rounded-2xl bg-amber-50 p-3 dark:bg-amber-400/10">
                <p className="font-black text-amber-900 dark:text-amber-100">
                  {deadline.label}: {deadline.dateText}
                </p>
                <p className="mt-1 text-sm text-amber-900/80 dark:text-amber-100/80">{deadline.explanation}</p>
              </div>
            ))}
          </div>
        </Section>
      ) : null}

      {result.suggestedQuestions.length ? (
        <Section title="Questions to ask">
          <ul className="space-y-2">
            {result.suggestedQuestions.map((question) => (
              <li key={question}>• {question}</li>
            ))}
          </ul>
        </Section>
      ) : null}

      <section className="glass-card rounded-[2rem] p-5">
        <h2 className="text-lg font-black tracking-tight text-slate-950 dark:text-white">Helpful actions</h2>
        <div className="mt-4 grid grid-cols-2 gap-3">
          <ActionButton type="button" variant="secondary" onClick={() => setPanel(panel === "call" ? null : "call")}>
            <Phone className="size-4" aria-hidden="true" />
            Call script
          </ActionButton>
          <ActionButton type="button" variant="secondary" onClick={() => setPanel(panel === "reply" ? null : "reply")}>
            <MessageSquareText className="size-4" aria-hidden="true" />
            Write reply
          </ActionButton>
          <ActionButton type="button" variant="secondary" onClick={() => setPanel(panel === "checklist" ? null : "checklist")}>
            <ClipboardList className="size-4" aria-hidden="true" />
            Checklist
          </ActionButton>
          <ActionButton type="button" variant="secondary" onClick={() => setPanel(panel === "simple" ? null : "simple")}>
            <Sparkles className="size-4" aria-hidden="true" />
            Simpler
          </ActionButton>
          <ActionButton type="button" variant="secondary" onClick={() => setPanel(panel === "share" ? null : "share")}>
            <FileText className="size-4" aria-hidden="true" />
            Summary card
          </ActionButton>
          <ActionButton type="button" variant="secondary" onClick={shareSummary}>
            {copied ? <Copy className="size-4" aria-hidden="true" /> : <Share2 className="size-4" aria-hidden="true" />}
            {copied ? "Copied" : "Share"}
          </ActionButton>
        </div>
        <div className="mt-4 space-y-3">
          {panel === "call" ? <GeneratedPanel title="Call script" body={result.callScript} /> : null}
          {panel === "reply" ? <GeneratedPanel title="Reply draft" body={result.replyDraft} /> : null}
          {panel === "checklist" ? <GeneratedPanel title="Checklist" items={result.checklist} /> : null}
          {panel === "simple" ? <GeneratedPanel title="Simpler explanation" body={result.simplifiedExplanation} /> : null}
          {panel === "share" ? <ClearItCard result={result} /> : null}
        </div>
      </section>

      <section className="grid grid-cols-1 gap-3">
        <ActionButton type="button" onClick={saveResult} disabled={saved}>
          <Save className="size-4" aria-hidden="true" />
          {saved ? "Saved to history" : "Save to history"}
        </ActionButton>
        <Link
          href="/analyze"
          className="inline-flex min-h-12 items-center justify-center rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-extrabold text-slate-800 shadow-sm dark:border-white/10 dark:bg-white/10 dark:text-white"
        >
          Analyze another
        </Link>
      </section>

      <p className="px-2 text-center text-xs leading-5 text-slate-500 dark:text-slate-400">{result.disclaimer}</p>
    </div>
  );
}
