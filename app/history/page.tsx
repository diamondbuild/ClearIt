"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Camera, ChevronRight, Trash2 } from "lucide-react";
import { ActionButton } from "@/components/ActionButton";
import { EmptyState } from "@/components/EmptyState";
import { UrgencyBadge } from "@/components/UrgencyBadge";
import { clearHistory, getHistory } from "@/lib/storage/history";
import type { HistoryItem } from "@/lib/types";
import { formatDateTime, titleCaseLabel } from "@/lib/utils";

export default function HistoryPage() {
  const [items, setItems] = useState<HistoryItem[]>([]);

  useEffect(() => {
    setItems(getHistory());
  }, []);

  function removeAll() {
    clearHistory();
    setItems([]);
  }

  if (!items.length) {
    return (
      <EmptyState
        title="No saved explanations yet."
        body="When you save a ClearIt result, it will show up here. Images are not stored in this MVP."
        action={
          <Link href="/analyze">
            <ActionButton type="button">
              <Camera className="size-4" aria-hidden="true" />
              Explain something
            </ActionButton>
          </Link>
        }
      />
    );
  }

  return (
    <div className="space-y-4">
      <section className="flex items-end justify-between gap-3 px-1">
        <div>
          <p className="text-sm font-black uppercase tracking-[0.18em] text-blue-700 dark:text-blue-300">History</p>
          <h1 className="mt-2 text-3xl font-black tracking-tight text-slate-950 dark:text-white">Saved explanations</h1>
        </div>
        <ActionButton type="button" variant="ghost" className="min-h-10 px-3" onClick={removeAll}>
          <Trash2 className="size-4" aria-hidden="true" />
          Clear
        </ActionButton>
      </section>

      <div className="space-y-3">
        {items.map((item) => (
          <Link
            key={item.id}
            href={`/result?id=${encodeURIComponent(item.id)}`}
            className="glass-card block rounded-[2rem] p-4 transition hover:-translate-y-0.5"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="mb-3 flex flex-wrap items-center gap-2">
                  <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-black text-slate-700 ring-1 ring-slate-200 dark:bg-white/10 dark:text-slate-200 dark:ring-white/10">
                    {titleCaseLabel(item.category)}
                  </span>
                  <UrgencyBadge urgency={item.urgency} />
                </div>
                <h2 className="text-lg font-black leading-6 text-slate-950 dark:text-white">{item.plainTitle}</h2>
                <p className="mt-2 text-sm font-medium text-slate-500 dark:text-slate-400">
                  {formatDateTime(item.savedAt)} {item.imageUsed ? "• Image used" : ""}
                </p>
                {item.originalTextSnippet ? (
                  <p className="mt-3 line-clamp-2 text-sm leading-6 text-slate-600 dark:text-slate-300">{item.originalTextSnippet}</p>
                ) : null}
              </div>
              <ChevronRight className="mt-2 size-5 shrink-0 text-slate-400" aria-hidden="true" />
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
