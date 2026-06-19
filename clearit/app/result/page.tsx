"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { AppShell } from "@/components/AppShell";
import { ResultCard } from "@/components/ResultCard";
import { ShareSheet } from "@/components/ShareSheet";
import { ClearItAnalysis } from "@/lib/types";
import { saveToHistory, getHistoryItem } from "@/lib/storage/history";
import { saveAnalysisToSupabase, uploadThumbnails, fetchAnalysisById } from "@/lib/supabase/db";
import { supabaseConfigured } from "@/lib/supabase/client";

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
  const [showShareSheet, setShowShareSheet] = useState(false);
  const [thumbnails, setThumbnails] = useState<string[]>([]);

  useEffect(() => {
    if (!id) { setNotFound(true); return; }

    const load = async () => {
      // 1. Try sessionStorage first (fresh analysis)
      const sessionKey = `lci_pending_${id}`;
      const sessionData = sessionStorage.getItem(sessionKey);
      if (sessionData) {
        try {
          const parsed = JSON.parse(sessionData);
          setAnalysis(parsed.analysis);
          setTextSnippet(parsed.textSnippet);
          setUsedImage(parsed.usedImage);

          const localThumbs: string[] = parsed.thumbnails ?? [];
          let storedThumbs: string[] = localThumbs;

          // Auto-save
          if (!fromHistory) {
            // 1. Always save to localStorage immediately (thumbnails as base64)
            saveToHistory(parsed.analysis, {
              textSnippet: parsed.textSnippet,
              usedImage: parsed.usedImage,
              thumbnails: localThumbs,
            });
            setIsSaved(true);
            setThumbnails(localThumbs); // show immediately

            // 2. Async: upload thumbnails → save to Supabase (non-blocking)
            if (supabaseConfigured) {
              const doSupabaseSave = async () => {
                let thumbnailUrls: string[] = [];
                if (localThumbs.length > 0) {
                  thumbnailUrls = await uploadThumbnails(id!, localThumbs).catch(() => []);
                }
                await saveAnalysisToSupabase(parsed.analysis, {
                  textSnippet: parsed.textSnippet,
                  usedImage: parsed.usedImage,
                  thumbnailUrls,
                });
              };
              doSupabaseSave().catch(console.warn);
            }
          } else {
            setThumbnails(localThumbs);
          }
          return;
        } catch { /* fall through */ }
      }

      // 2. Try Supabase (shared link or cross-device)
      if (supabaseConfigured) {
        const sbData = await fetchAnalysisById(id);
        if (sbData) {
          setAnalysis(sbData.analysis);
          setTextSnippet(sbData.textSnippet);
          setUsedImage(sbData.usedImage);
          setThumbnails(sbData.thumbnails);
          setIsSaved(true);
          return;
        }
      }

      // 3. Try localStorage history
      const historyItem = getHistoryItem(id);
      if (historyItem) {
        setAnalysis(historyItem.result);
        setTextSnippet(historyItem.textSnippet);
        setUsedImage(historyItem.usedImage);
        setThumbnails(historyItem.thumbnails ?? []);
        setIsSaved(true);
        return;
      }

      setNotFound(true);
    };

    load();
  }, [id, fromHistory]);

  const handleShare = () => setShowShareSheet(true);

  if (notFound) return (
    <AppShell title="Result" backHref="/">
      <div className="flex flex-col items-center justify-center py-20 px-6 text-center">
        <div className="text-5xl mb-4">🔍</div>
        <h3 className="text-lg font-bold mb-2" style={{ color: "var(--ink)" }}>Result not found</h3>
        <p className="text-sm mb-6" style={{ color: "var(--muted)" }}>This result may have expired.</p>
        <button onClick={() => router.push("/")}
          className="px-6 py-3 rounded-2xl text-sm font-bold text-white"
          style={{ background: "var(--brand-gradient)" }}>
          Back home
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
    <AppShell title="Your answer" onBack={() => router.push("/")} showShare onShare={handleShare}>
      <ResultCard
        analysis={analysis}
        isSaved={isSaved}
        onAnalyzeAnother={() => router.push("/")}
        onShare={handleShare}
        thumbnails={thumbnails}
      />
      {showShareSheet && (
        <ShareSheet analysis={analysis} onClose={() => setShowShareSheet(false)} />
      )}
    </AppShell>
  );
}

export default function ResultPageWrapper() {
  return <Suspense><ResultPage /></Suspense>;
}
