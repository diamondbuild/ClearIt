"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Clock, Trash2, ChevronRight, Image as ImageIcon, FileText } from "lucide-react";
import { EmptyState } from "@/components/EmptyState";
import { UrgencyBadge } from "@/components/UrgencyBadge";
import { ActionButton } from "@/components/ActionButton";
import {
  getHistory,
  removeHistoryItem,
} from "@/lib/storage/history";
import { HistoryItem } from "@/lib/types";
import { categoryLabel, formatDateTime } from "@/lib/utils";

export default function HistoryPage() {
  const router = useRouter();
  const [items, setItems] = useState<HistoryItem[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setItems(getHistory());
    setMounted(true);
  }, []);

  const handleDelete = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    removeHistoryItem(id);
    setItems(getHistory());
  };

  return (
    <div className="space-y-5 animate-fade-in">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight">History</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Your saved explanations, stored privately on this device.
        </p>
      </div>

      {!mounted ? null : items.length === 0 ? (
        <div className="pt-6">
          <EmptyState
            icon={Clock}
            title="No saved explanations yet."
            description="When you save a result, it shows up here so you can reopen it anytime."
            action={
              <ActionButton
                variant="primary"
                onClick={() => router.push("/analyze")}
              >
                Explain something
              </ActionButton>
            }
          />
        </div>
      ) : (
        <div className="space-y-3">
          {items.map((item, i) => (
            <motion.button
              key={item.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              onClick={() =>
                router.push(`/result?id=${encodeURIComponent(item.id)}`)
              }
              className="flex w-full items-center gap-3 rounded-2xl border border-border bg-card p-4 text-left shadow-soft transition hover:border-primary/30 hover:bg-primary/5"
            >
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-muted text-muted-foreground">
                {item.usedImage ? (
                  <ImageIcon className="h-5 w-5" />
                ) : (
                  <FileText className="h-5 w-5" />
                )}
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[11px] font-semibold text-primary">
                    {categoryLabel(item.category)}
                  </span>
                  <UrgencyBadge urgency={item.urgency} size="sm" />
                </div>
                <p className="mt-1 line-clamp-2 text-sm font-semibold leading-snug">
                  {item.plainTitle}
                </p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {formatDateTime(item.createdAt)}
                </p>
              </div>
              <div className="flex shrink-0 flex-col items-center gap-2">
                <span
                  role="button"
                  tabIndex={0}
                  aria-label="Delete"
                  onClick={(e) => handleDelete(e, item.id)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleDelete(e as unknown as React.MouseEvent, item.id);
                  }}
                  className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-500/10"
                >
                  <Trash2 className="h-4 w-4" />
                </span>
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              </div>
            </motion.button>
          ))}
        </div>
      )}
    </div>
  );
}
