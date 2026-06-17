import {
  FileText,
  Lightbulb,
  ListChecks,
  KeyRound,
  CalendarClock,
  HelpCircle,
} from "lucide-react";
import { ClearItAnalysis } from "@/lib/types";
import { UrgencyBadge } from "@/components/UrgencyBadge";
import { SafetyNotice } from "@/components/SafetyNotice";
import { categoryLabel, confidenceLabel } from "@/lib/utils";

export function ResultCard({ result }: { result: ClearItAnalysis }) {
  const isScam =
    result.category === "possible_scam" || result.urgency === "possible_scam";

  return (
    <div className="space-y-4">
      {/* Header card */}
      <div className="rounded-3xl border border-border bg-card p-5 shadow-card">
        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
            {categoryLabel(result.category)}
          </span>
          <UrgencyBadge urgency={result.urgency} size="sm" />
          <span className="inline-flex items-center rounded-full bg-muted px-2.5 py-1 text-xs font-medium text-muted-foreground">
            Confidence: {confidenceLabel(result.confidence)}
          </span>
        </div>
        <h1 className="mt-3 text-pretty text-xl font-extrabold leading-snug tracking-tight">
          {result.plainTitle}
        </h1>
        {result.oneSentenceSummary ? (
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            {result.oneSentenceSummary}
          </p>
        ) : null}
      </div>

      {/* Scam notice (high visibility) */}
      {isScam ? (
        <SafetyNotice tone="scam" items={result.warnings} />
      ) : null}

      <Section icon={FileText} title="What this is">
        <p className="text-[15px] leading-relaxed">{result.whatThisIs}</p>
      </Section>

      <Section icon={Lightbulb} title="What it means">
        <p className="text-[15px] leading-relaxed">{result.whatItMeans}</p>
        {result.whyItMatters ? (
          <p className="mt-3 rounded-2xl bg-muted/60 p-3 text-sm leading-relaxed text-muted-foreground">
            <span className="font-semibold text-foreground">Why it matters: </span>
            {result.whyItMatters}
          </p>
        ) : null}
      </Section>

      {result.nextSteps.length > 0 ? (
        <Section icon={ListChecks} title="What to do next">
          <ol className="space-y-2.5">
            {result.nextSteps.map((step, i) => (
              <li key={i} className="flex gap-3">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                  {i + 1}
                </span>
                <span className="text-[15px] leading-relaxed">{step}</span>
              </li>
            ))}
          </ol>
        </Section>
      ) : null}

      {/* Non-scam warnings still shown as "watch out for" */}
      {!isScam && result.warnings.length > 0 ? (
        <SafetyNotice tone="warning" items={result.warnings} />
      ) : null}

      {result.detectedDeadlines.length > 0 ? (
        <Section icon={CalendarClock} title="Deadlines">
          <ul className="space-y-3">
            {result.detectedDeadlines.map((d, i) => (
              <li
                key={i}
                className="rounded-2xl border border-amber-200 bg-amber-50 p-3 dark:border-amber-500/30 dark:bg-amber-500/10"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-sm font-semibold">{d.label}</span>
                  <span className="rounded-full bg-amber-200/70 px-2 py-0.5 text-xs font-bold text-amber-900 dark:bg-amber-500/30 dark:text-amber-100">
                    {d.dateText}
                  </span>
                </div>
                {d.explanation ? (
                  <p className="mt-1 text-sm text-muted-foreground">
                    {d.explanation}
                  </p>
                ) : null}
              </li>
            ))}
          </ul>
        </Section>
      ) : null}

      {result.keyDetails.length > 0 ? (
        <Section icon={KeyRound} title="Key details found">
          <dl className="divide-y divide-border">
            {result.keyDetails.map((detail, i) => (
              <div
                key={i}
                className="flex items-start justify-between gap-4 py-2.5 first:pt-0 last:pb-0"
              >
                <dt className="text-sm text-muted-foreground">{detail.label}</dt>
                <dd className="text-right text-sm font-semibold">
                  {detail.value}
                </dd>
              </div>
            ))}
          </dl>
        </Section>
      ) : null}

      {result.suggestedQuestions.length > 0 ? (
        <Section icon={HelpCircle} title="Questions you could ask">
          <ul className="space-y-2">
            {result.suggestedQuestions.map((q, i) => (
              <li key={i} className="flex gap-2 text-sm leading-relaxed">
                <span aria-hidden className="text-primary">·</span>
                <span>{q}</span>
              </li>
            ))}
          </ul>
        </Section>
      ) : null}

      {result.disclaimer ? (
        <p className="px-2 text-center text-xs leading-relaxed text-muted-foreground">
          {result.disclaimer}
        </p>
      ) : null}
    </div>
  );
}

function Section({
  icon: Icon,
  title,
  children,
}: {
  icon: typeof FileText;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-3xl border border-border bg-card p-5 shadow-soft">
      <div className="mb-3 flex items-center gap-2">
        <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-muted text-foreground">
          <Icon className="h-4.5 w-4.5" />
        </span>
        <h2 className="text-sm font-bold uppercase tracking-wide text-muted-foreground">
          {title}
        </h2>
      </div>
      {children}
    </section>
  );
}
