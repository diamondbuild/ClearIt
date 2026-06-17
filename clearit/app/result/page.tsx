"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { AppShell } from "@/components/AppShell";
import { ResultCard } from "@/components/ResultCard";
import { EmptyState } from "@/components/EmptyState";
import { ClearItAnalysis } from "@/lib/types";
import { saveToHistory, getHistoryItem } from "@/lib/storage/history";

function ResultPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const id = searchParams.get("id");
  const fromHistory = searchParams.get("from") === "history";

  const [analysis, setAnalysis] = useState<ClearItAnalysis | null>(null);
  const [isSaved, setIsSaved] = useState(fromHistory);
  const [textSnippet, setTextSnippet] = useState<string | undefined>();
  const [usedImage, setUsedImage] = useState(false);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!id) {
      setNotFound(true);
      return;
    }

    // Try session storage first (fresh analysis)
    const sessionKey = `clearit_pending_${id}`;
    const sessionData = sessionStorage.getItem(sessionKey);

    if (sessionData) {
      try {
        const parsed = JSON.parse(sessionData);
        setAnalysis(parsed.analysis);
        setTextSnippet(parsed.textSnippet);
        setUsedImage(parsed.usedImage);
        return;
      } catch {
        // fall through to history
      }
    }

    // Try history
    const historyItem = getHistoryItem(id);
    if (historyItem) {
      setAnalysis(historyItem.result);
      setTextSnippet(historyItem.textSnippet);
      setUsedImage(historyItem.usedImage);
      setIsSaved(true);
      return;
    }

    setNotFound(true);
  }, [id]);

  const handleSave = () => {
    if (!analysis) return;
    saveToHistory(analysis, { textSnippet, usedImage });
    setIsSaved(true);
  };

  const handleAnalyzeAnother = () => {
    router.push("/analyze");
  };

  if (notFound) {
    return (
      <AppShell title="Result">
        <EmptyState
          icon="🔍"
          title="Result not found"
          description="This result may have expired. Analyze something new to get started."
          actionLabel="Analyze something"
          actionHref="/analyze"
        />
      </AppShell>
    );
  }

  if (!analysis) {
    return (
      <AppShell title="Loading…">
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="flex flex-col items-center gap-3">
            <div
              className="w-12 h-12 rounded-xl animate-pulse"
              style={{ background: "var(--muted)" }}
            />
            <p className="text-sm" style={{ color: "var(--muted-foreground)" }}>
              Loading result…
            </p>
          </div>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell title="Your result" showWordmark={false}>
      <ResultCard
        analysis={analysis}
        onSave={!isSaved ? handleSave : undefined}
        isSaved={isSaved}
        onAnalyzeAnother={handleAnalyzeAnother}
      />
    </AppShell>
  );
}

export default function ResultPageWrapper() {
  return (
    <Suspense>
      <ResultPage />
    </Suspense>
  );
}
