"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Clock, Trash2, Image as ImageIcon, Type } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { UrgencyBadge } from "@/components/UrgencyBadge";
import { EmptyState } from "@/components/EmptyState";
import { HistoryItem } from "@/lib/types";
import { getHistory, deleteHistoryItem, clearHistory } from "@/lib/storage/history";
import { categoryLabel, formatDate, truncate } from "@/lib/utils";

export default function HistoryPage() {
  const router = useRouter();
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  useEffect(() => {
    setHistory(getHistory());
    setLoaded(true);
  }, []);

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    deleteHistoryItem(id);
    setHistory(getHistory());
  };

  const handleClearAll = () => {
    clearHistory();
    setHistory([]);
    setShowClearConfirm(false);
  };

  const handleOpen = (item: HistoryItem) => {
    sessionStorage.setItem(
      `clearit_pending_${item.id}`,
      JSON.stringify({
        analysis: item.result,
        textSnippet: item.textSnippet,
        usedImage: item.usedImage,
      })
    );
    router.push(`/result?id=${item.id}&from=history`);
  };

  const rightSlot =
    history.length > 0 ? (
      <button
        onClick={() => setShowClearConfirm(true)}
        className="text-xs font-medium py-1 px-3 rounded-lg border transition-all"
        style={{
          color: "#ef4444",
          borderColor: "#fca5a5",
          background: "#fef2f2",
        }}
      >
        Clear all
      </button>
    ) : undefined;

  return (
    <AppShell title="History" rightSlot={rightSlot}>
      {!loaded ? null : history.length === 0 ? (
        <EmptyState
          icon="📂"
          title="No saved explanations yet."
          description="When you save an analysis, it will appear here. Your history stays on this device."
          actionLabel="Analyze something"
          actionHref="/analyze"
        />
      ) : (
        <div className="px-4 pt-4 pb-6 flex flex-col gap-3">
          <p
            className="text-xs font-medium"
            style={{ color: "var(--muted-foreground)" }}
          >
            {history.length} saved {history.length === 1 ? "item" : "items"}
          </p>

          {history.map((item, i) => (
            <motion.button
              key={item.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }}
              onClick={() => handleOpen(item)}
              className="w-full text-left rounded-2xl border p-4 transition-all active:scale-[0.98]"
              style={{
                background: "var(--card)",
                borderColor: "var(--card-border)",
                boxShadow: "var(--shadow-sm)",
              }}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2 flex-wrap">
                    <span
                      className="text-xs font-semibold px-2 py-0.5 rounded-full"
                      style={{
                        background: "var(--primary)",
                        color: "white",
                      }}
                    >
                      {categoryLabel(item.category)}
                    </span>
                    <UrgencyBadge urgency={item.urgency} size="sm" />
                  </div>

                  <p
                    className="text-sm font-semibold leading-snug mb-2 truncate"
                    style={{ color: "var(--foreground)" }}
                  >
                    {item.plainTitle}
                  </p>

                  {item.textSnippet && (
                    <p
                      className="text-xs leading-relaxed mb-2 line-clamp-2"
                      style={{ color: "var(--muted-foreground)" }}
                    >
                      {truncate(item.textSnippet, 120)}
                    </p>
                  )}

                  <div
                    className="flex items-center gap-3 text-xs"
                    style={{ color: "var(--muted-foreground)" }}
                  >
                    <span className="flex items-center gap-1">
                      <Clock size={11} />
                      {formatDate(item.savedAt)}
                    </span>
                    <span className="flex items-center gap-1">
                      {item.usedImage ? (
                        <>
                          <ImageIcon size={11} />
                          Image
                        </>
                      ) : (
                        <>
                          <Type size={11} />
                          Text
                        </>
                      )}
                    </span>
                  </div>
                </div>

                <button
                  onClick={(e) => handleDelete(item.id, e)}
                  className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-lg transition-all hover:bg-red-50 dark:hover:bg-red-950"
                  style={{ color: "var(--muted-foreground)" }}
                  aria-label="Delete"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </motion.button>
          ))}
        </div>
      )}

      {/* Clear all confirm */}
      {showClearConfirm && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-4">
          <motion.div
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="w-full max-w-md rounded-2xl p-6 flex flex-col gap-4"
            style={{ background: "var(--card)" }}
          >
            <div>
              <h3
                className="text-base font-bold mb-1"
                style={{ color: "var(--foreground)" }}
              >
                Clear all history?
              </h3>
              <p className="text-sm" style={{ color: "var(--muted-foreground)" }}>
                This will permanently delete all {history.length} saved
                {history.length === 1 ? " item" : " items"} from this device.
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setShowClearConfirm(false)}
                className="flex-1 py-3 rounded-xl text-sm font-semibold border transition-all"
                style={{
                  background: "var(--card)",
                  borderColor: "var(--border)",
                  color: "var(--foreground)",
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleClearAll}
                className="flex-1 py-3 rounded-xl text-sm font-semibold text-white bg-red-500 transition-all active:scale-95"
              >
                Clear all
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AppShell>
  );
}
