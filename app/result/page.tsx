"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  CircleCheck,
  ClipboardList,
  Mail,
  MessageSquareText,
  Save,
  Sparkles,
  PhoneCall,
} from "lucide-react";

import { ActionButton } from "@/components/ActionButton";
import { AppShell } from "@/components/AppShell";
import { ClearItCard } from "@/components/ClearItCard";
import { EmptyState } from "@/components/EmptyState";
import { ResultCard } from "@/components/ResultCard";
import {
  getCurrentResult,
  getHistoryItemById,
  saveHistoryItem,
} from "@/lib/storage/history";

type HelperContent = {
  title: string;
  body: string;
};

export default function ResultPage() {
  const router = useRouter();
  const [helperContent, setHelperContent] = useState<HelperContent | null>(null);
  const [, setStorageTick] = useState(0);
  const [showShareCard, setShowShareCard] = useState(false);

  const resultId =
    typeof window !== "undefined"
      ? new URLSearchParams(window.location.search).get("id")
      : null;

  const resolved = (() => {
    if (typeof window === "undefined") return null;

    const current = getCurrentResult();
    if (current && (!resultId || current.result.id === resultId)) {
      return {
        analysis: current.result,
        textSnippet: current.originalTextSnippet,
        usedImage: current.usedImage,
      };
    }

    if (!resultId) return null;
    const historyItem = getHistoryItemById(resultId);
    if (!historyItem) return null;

    return {
      analysis: historyItem.result,
      textSnippet: historyItem.originalTextSnippet,
      usedImage: historyItem.usedImage,
    };
  })();

  const analysis = resolved?.analysis ?? null;
  const textSnippet = resolved?.textSnippet ?? "";
  const usedImage = resolved?.usedImage ?? false;
  const alreadySaved = analysis ? Boolean(getHistoryItemById(analysis.id)) : false;

  const onSave = () => {
    if (!analysis) return;
    saveHistoryItem({
      result: analysis,
      originalTextSnippet: textSnippet,
      usedImage,
    });
    setStorageTick((tick) => tick + 1);
  };

  if (!analysis) {
    return (
      <AppShell>
        <EmptyState
          title="No result to show yet"
          description="Analyze something first, then your explanation will appear here."
          ctaLabel="Go to Analyze"
          ctaHref="/analyze"
        />
      </AppShell>
    );
  }

  return (
    <AppShell className="space-y-4">
      <ResultCard
        analysis={analysis}
        actionArea={
          <section className="clearit-card">
            <h3 className="mb-3 text-xs font-semibold uppercase tracking-[0.11em] text-slate-500">
              Helpful actions
            </h3>
            <div className="grid grid-cols-2 gap-2">
              <ActionButton
                icon={PhoneCall}
                label="Make a call script"
                onClick={() =>
                  setHelperContent({ title: "Call script", body: analysis.callScript })
                }
              />
              <ActionButton
                icon={Mail}
                label="Write a reply"
                onClick={() =>
                  setHelperContent({ title: "Reply draft", body: analysis.replyDraft })
                }
              />
              <ActionButton
                icon={ClipboardList}
                label="Make a checklist"
                onClick={() =>
                  setHelperContent({
                    title: "Checklist",
                    body: (analysis.checklist.length ? analysis.checklist : analysis.nextSteps)
                      .map((step) => `- ${step}`)
                      .join("\n"),
                  })
                }
              />
              <ActionButton
                icon={Sparkles}
                label="Explain simpler"
                onClick={() =>
                  setHelperContent({
                    title: "Simpler explanation",
                    body: analysis.simplifiedExplanation,
                  })
                }
              />
              <ActionButton
                icon={MessageSquareText}
                label="Share summary"
                onClick={() => setShowShareCard((current) => !current)}
              />
              <ActionButton
                icon={Save}
                label={alreadySaved ? "Saved to history" : "Save to history"}
                onClick={onSave}
                disabled={alreadySaved}
              />
            </div>
            <button
              type="button"
              className="clearit-primary-btn mt-3 w-full justify-center"
              onClick={() => router.push("/analyze")}
            >
              Analyze another
            </button>
          </section>
        }
      />

      {showShareCard ? <ClearItCard analysis={analysis} /> : null}

      {analysis.suggestedQuestions.length ? (
        <section className="clearit-card">
          <h3 className="mb-2 text-xs font-semibold uppercase tracking-[0.11em] text-slate-500">
            Suggested questions to ask
          </h3>
          <ul className="space-y-2 text-sm text-slate-800">
            {analysis.suggestedQuestions.map((question) => (
              <li key={question} className="flex gap-2">
                <CircleCheck size={16} className="mt-0.5 text-emerald-600" />
                <span>{question}</span>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {helperContent ? (
        <section className="clearit-card border-indigo-200 bg-indigo-50/60">
          <h3 className="font-display text-lg font-semibold text-indigo-900">
            {helperContent.title}
          </h3>
          <pre className="mt-3 whitespace-pre-wrap text-sm leading-6 text-slate-800">
            {helperContent.body}
          </pre>
        </section>
      ) : null}
    </AppShell>
  );
}
