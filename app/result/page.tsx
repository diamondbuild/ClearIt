"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import {
  Phone,
  Mail,
  ListChecks,
  Baby,
  Share2,
  Bookmark,
  BookmarkCheck,
  RotateCcw,
  Siren,
  FileQuestion,
} from "lucide-react";
import { ResultCard } from "@/components/ResultCard";
import { ClearItCard } from "@/components/ClearItCard";
import { ActionButton } from "@/components/ActionButton";
import { Sheet } from "@/components/Sheet";
import { EmptyState } from "@/components/EmptyState";
import { LoadingAnalysis } from "@/components/LoadingAnalysis";
import {
  getHistoryItem,
  getLastResult,
  isInHistory,
  saveToHistory,
} from "@/lib/storage/history";
import { ClearItAnalysis } from "@/lib/types";

type SheetType = "call" | "reply" | "checklist" | "simpler" | "share" | null;

function ResultInner() {
  const router = useRouter();
  const params = useSearchParams();
  const id = params.get("id") || "";
  const from = params.get("from");

  const [result, setResult] = useState<ClearItAnalysis | null>(null);
  const [originalText, setOriginalText] = useState<string | undefined>();
  const [usedImage, setUsedImage] = useState(false);
  const [saved, setSaved] = useState(false);
  const [notFound, setNotFound] = useState(false);
  const [sheet, setSheet] = useState<SheetType>(null);

  useEffect(() => {
    // Prefer the freshly produced result for the analyze flow.
    const last = getLastResult();
    if (from === "new" && last && last.result.id === id) {
      setResult(last.result);
      setOriginalText(last.originalText);
      setUsedImage(last.usedImage);
      setSaved(isInHistory(last.result.id));
      return;
    }

    const fromHistory = getHistoryItem(id);
    if (fromHistory) {
      setResult(fromHistory.result);
      setOriginalText(fromHistory.textSnippet);
      setUsedImage(fromHistory.usedImage);
      setSaved(true);
      return;
    }

    if (last) {
      setResult(last.result);
      setOriginalText(last.originalText);
      setUsedImage(last.usedImage);
      setSaved(isInHistory(last.result.id));
      return;
    }

    setNotFound(true);
  }, [id, from]);

  const checklistText = useMemo(() => {
    if (!result) return "";
    const items = result.checklist.length ? result.checklist : result.nextSteps;
    return items.map((c) => `☐ ${c}`).join("\n");
  }, [result]);

  if (notFound) {
    return (
      <div className="pt-10">
        <EmptyState
          icon={FileQuestion}
          title="We couldn't find that result"
          description="It may have expired or been cleared. Try analyzing something new."
          action={
            <ActionButton
              variant="primary"
              icon={RotateCcw}
              onClick={() => router.push("/analyze")}
            >
              Analyze something
            </ActionButton>
          }
        />
      </div>
    );
  }

  if (!result) {
    return <LoadingAnalysis done />;
  }

  const handleSave = () => {
    saveToHistory(result, { usedImage, originalText });
    setSaved(true);
  };

  return (
    <div className="space-y-5 animate-fade-in">
      {result.urgency === "emergency" ? (
        <motion.div
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-start gap-2 rounded-2xl border border-red-700 bg-red-600 p-4 text-white shadow-card"
        >
          <Siren className="mt-0.5 h-5 w-5 shrink-0" />
          <p className="text-sm font-semibold">
            This may require immediate attention. Contact the appropriate
            emergency service, official sender, or qualified professional.
          </p>
        </motion.div>
      ) : null}

      <ResultCard result={result} />

      {/* Action buttons */}
      <section className="rounded-3xl border border-border bg-card p-4 shadow-soft">
        <h2 className="mb-3 text-sm font-bold uppercase tracking-wide text-muted-foreground">
          Take action
        </h2>
        <div className="grid grid-cols-2 gap-2">
          <ActionButton icon={Phone} onClick={() => setSheet("call")}>
            Call script
          </ActionButton>
          <ActionButton icon={Mail} onClick={() => setSheet("reply")}>
            Write a reply
          </ActionButton>
          <ActionButton icon={ListChecks} onClick={() => setSheet("checklist")}>
            Checklist
          </ActionButton>
          <ActionButton icon={Baby} onClick={() => setSheet("simpler")}>
            Explain simpler
          </ActionButton>
          <ActionButton icon={Share2} onClick={() => setSheet("share")}>
            Share summary
          </ActionButton>
          <ActionButton
            icon={saved ? BookmarkCheck : Bookmark}
            variant={saved ? "secondary" : "secondary"}
            onClick={handleSave}
            disabled={saved}
          >
            {saved ? "Saved" : "Save"}
          </ActionButton>
        </div>
        <ActionButton
          variant="primary"
          fullWidth
          icon={RotateCcw}
          className="mt-2"
          onClick={() => router.push("/analyze")}
        >
          Analyze another
        </ActionButton>
      </section>

      {/* Sheets */}
      <Sheet
        open={sheet === "call"}
        onClose={() => setSheet(null)}
        title="Call script"
        copyText={result.callScript}
      >
        <p className="whitespace-pre-wrap text-[15px] leading-relaxed">
          {result.callScript || "No call script available for this item."}
        </p>
      </Sheet>

      <Sheet
        open={sheet === "reply"}
        onClose={() => setSheet(null)}
        title="Suggested reply"
        copyText={result.replyDraft}
      >
        <p className="whitespace-pre-wrap text-[15px] leading-relaxed">
          {result.replyDraft || "No reply draft available for this item."}
        </p>
      </Sheet>

      <Sheet
        open={sheet === "checklist"}
        onClose={() => setSheet(null)}
        title="Your checklist"
        copyText={checklistText}
      >
        <ul className="space-y-2.5">
          {(result.checklist.length ? result.checklist : result.nextSteps).map(
            (item, i) => (
              <li key={i} className="flex items-start gap-3">
                <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md border-2 border-border" />
                <span className="text-[15px] leading-relaxed">{item}</span>
              </li>
            ),
          )}
        </ul>
      </Sheet>

      <Sheet
        open={sheet === "simpler"}
        onClose={() => setSheet(null)}
        title="In simpler words"
        copyText={result.simplifiedExplanation}
      >
        <p className="whitespace-pre-wrap text-base leading-relaxed">
          {result.simplifiedExplanation || result.whatItMeans}
        </p>
      </Sheet>

      <Sheet
        open={sheet === "share"}
        onClose={() => setSheet(null)}
        title="Share summary"
      >
        <ClearItCard result={result} />
      </Sheet>
    </div>
  );
}

export default function ResultPage() {
  return (
    <Suspense fallback={<LoadingAnalysis done />}>
      <ResultInner />
    </Suspense>
  );
}
