"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowLeft, ScanLine } from "lucide-react";
import { ActionButton } from "@/components/ActionButton";
import { EmptyState } from "@/components/EmptyState";
import { ResultCard } from "@/components/ResultCard";
import { getHistoryItem, getLastInput, getLastResult } from "@/lib/storage/history";
import type { ClearItAnalysis } from "@/lib/types";

export default function ResultPage() {
  const [result, setResult] = useState<ClearItAnalysis>();
  const [originalText, setOriginalText] = useState<string>();
  const [imageUsed, setImageUsed] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const historyId = params.get("id");

    if (historyId) {
      const item = getHistoryItem(historyId);
      if (item) {
        setResult(item.result);
        setOriginalText(item.originalTextSnippet);
        setImageUsed(item.imageUsed);
      }
      setReady(true);
      return;
    }

    const latest = getLastResult();
    const input = getLastInput();
    setResult(latest);
    setOriginalText(input.text);
    setImageUsed(input.imageUsed);
    setReady(true);
  }, []);

  if (!ready) {
    return null;
  }

  if (!result) {
    return (
      <EmptyState
        title="No result to show yet"
        body="Analyze a photo, screenshot, or pasted message and ClearIt will show the plain-English result here."
        action={
          <Link href="/analyze">
            <ActionButton type="button">
              <ScanLine className="size-4" aria-hidden="true" />
              Analyze something
            </ActionButton>
          </Link>
        }
      />
    );
  }

  return (
    <div className="space-y-4">
      <Link href="/analyze" className="inline-flex items-center gap-2 px-1 text-sm font-black text-blue-700 dark:text-blue-300">
        <ArrowLeft className="size-4" aria-hidden="true" />
        Back to analyze
      </Link>
      <ResultCard result={result} originalText={originalText} imageUsed={imageUsed} />
    </div>
  );
}
