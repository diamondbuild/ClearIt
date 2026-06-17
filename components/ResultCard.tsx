import type { ReactNode } from "react";

import { SafetyNotice } from "@/components/SafetyNotice";
import { UrgencyBadge } from "@/components/UrgencyBadge";
import type { ClearItAnalysis } from "@/lib/types";
import { categoryLabelMap, confidenceLabelMap, formatDateTime } from "@/lib/utils";

type ResultCardProps = {
  analysis: ClearItAnalysis;
  actionArea?: ReactNode;
};

const Section = ({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) => (
  <section className="clearit-card">
    <h3 className="mb-2 text-xs font-semibold uppercase tracking-[0.11em] text-slate-500">
      {title}
    </h3>
    <div className="text-sm leading-6 text-slate-800">{children}</div>
  </section>
);

export const ResultCard = ({ analysis, actionArea }: ResultCardProps) => {
  return (
    <div className="space-y-4">
      <SafetyNotice urgency={analysis.urgency} warnings={analysis.warnings} />

      <section className="clearit-card">
        <p className="text-xs font-semibold uppercase tracking-[0.12em] text-indigo-600">
          ClearIt Result
        </p>
        <h1 className="mt-2 font-display text-2xl font-semibold leading-tight text-slate-900">
          {analysis.plainTitle}
        </h1>
        <p className="mt-2 text-sm text-slate-600">{analysis.oneSentenceSummary}</p>
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <span className="inline-flex rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">
            {categoryLabelMap[analysis.category]}
          </span>
          <UrgencyBadge urgency={analysis.urgency} />
          <span className="text-xs text-slate-500">
            Confidence: {confidenceLabelMap[analysis.confidence]}
          </span>
        </div>
        <p className="mt-3 text-xs text-slate-500">Analyzed {formatDateTime(analysis.createdAt)}</p>
      </section>

      <Section title="What this is">{analysis.whatThisIs}</Section>
      <Section title="What it means">{analysis.whatItMeans}</Section>
      <Section title="Why it matters">{analysis.whyItMatters}</Section>

      <Section title="What to do next">
        <ul className="space-y-2">
          {analysis.nextSteps.map((step) => (
            <li key={step} className="flex gap-2">
              <span aria-hidden>•</span>
              <span>{step}</span>
            </li>
          ))}
        </ul>
      </Section>

      {analysis.keyDetails.length ? (
        <Section title="Key details found">
          <dl className="space-y-2">
            {analysis.keyDetails.map((detail) => (
              <div key={`${detail.label}-${detail.value}`} className="grid grid-cols-[110px_1fr] gap-2">
                <dt className="text-slate-500">{detail.label}</dt>
                <dd className="font-medium text-slate-800">{detail.value}</dd>
              </div>
            ))}
          </dl>
        </Section>
      ) : null}

      {analysis.detectedDeadlines.length ? (
        <Section title="Important dates">
          <ul className="space-y-3">
            {analysis.detectedDeadlines.map((deadline) => (
              <li key={`${deadline.label}-${deadline.dateText}`}>
                <p className="text-sm font-semibold text-slate-800">{deadline.label}</p>
                <p className="text-sm text-slate-700">{deadline.dateText}</p>
                <p className="text-xs text-slate-500">{deadline.explanation}</p>
              </li>
            ))}
          </ul>
        </Section>
      ) : null}

      {actionArea}

      <section className="rounded-2xl border border-slate-200/90 bg-slate-50 p-4 text-xs text-slate-600">
        {analysis.disclaimer}
      </section>
    </div>
  );
};
