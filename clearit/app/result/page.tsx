"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { AppShell } from "@/components/AppShell";
import { ResultCard } from "@/components/ResultCard";
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
    if (!id) { setNotFound(true); return; }
    const sessionKey = `clearit_pending_${id}`;
    const sessionData = sessionStorage.getItem(sessionKey);
    if (sessionData) {
      try {
        const parsed = JSON.parse(sessionData);
        setAnalysis(parsed.analysis);
        setTextSnippet(parsed.textSnippet);
        setUsedImage(parsed.usedImage);
        return;
      } catch { /* fall through */ }
    }
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

  const handleShare = async () => {
    const text = `ClearIt: ${analysis?.plainTitle}\n\n${analysis?.oneSentenceSummary}\n\nExplained by ClearIt`;
    if (navigator.share) {
      await navigator.share({ title: "ClearIt Summary", text }).catch(() => {});
    } else {
      await navigator.clipboard.writeText(text).catch(() => {});
    }
  };

  if (notFound) return (
    <AppShell title="Result" backHref="/analyze">
      <div className="flex flex-col items-center justify-center py-20 px-6 text-center">
        <div className="text-5xl mb-4">🔍</div>
        <h3 className="text-lg font-bold mb-2" style={{ color: "var(--ink)" }}>Result not found</h3>
        <p className="text-sm mb-6" style={{ color: "var(--muted)" }}>This result may have expired.</p>
        <button onClick={() => router.push("/analyze")}
          className="px-6 py-3 rounded-2xl text-sm font-bold text-white"
          style={{ background: "var(--brand-gradient)" }}>
          Analyze something
        </button>
      </div>
    </AppShell>
  );

  if (!analysis) return (
    <AppShell title="Loading…">
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-12 h-12 rounded-2xl animate-pulse" style={{ background: "var(--surface-2)" }} />
      </div>
    </AppShell>
  );

  return (
    <AppShell
      title="Your answer"
      onBack={() => router.push("/analyze")}
      showShare
      onShare={handleShare}
    >
      <ResultCard
        analysis={analysis}
        onSave={!isSaved ? handleSave : undefined}
        isSaved={isSaved}
        onAnalyzeAnother={() => router.push("/analyze")}
      />
    </AppShell>
  );
}

export default function ResultPageWrapper() {
  return <Suspense><ResultPage /></Suspense>;
}
