"use client";

import Link from "next/link";
import { FileImage, FileText } from "lucide-react";
import { useEffect, useState } from "react";

import { AppShell } from "@/components/AppShell";
import { EmptyState } from "@/components/EmptyState";
import { UrgencyBadge } from "@/components/UrgencyBadge";
import { getHistory } from "@/lib/storage/history";
import type { HistoryItem } from "@/lib/types";
import { categoryLabelMap, formatDateTime } from "@/lib/utils";

export default function HistoryPage() {
  const [items, setItems] = useState<HistoryItem[]>([]);

  useEffect(() => {
    setItems(getHistory());
  }, []);

  return (
    <AppShell className="space-y-4">
      <section className="clearit-card">
        <h1 className="font-display text-2xl font-semibold text-slate-900">History</h1>
        <p className="mt-1 text-sm text-slate-600">Your saved ClearIt explanations.</p>
      </section>

      {!items.length ? (
        <EmptyState
          title="No saved explanations yet."
          description="Save any result to history and it will appear here."
          ctaLabel="Analyze something"
          ctaHref="/analyze"
        />
      ) : (
        items.map((item) => (
          <Link
            key={item.id}
            href={`/result?id=${item.id}`}
            className="clearit-card block transition-transform hover:-translate-y-0.5"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs uppercase tracking-[0.12em] text-slate-500">
                  {categoryLabelMap[item.category]}
                </p>
                <h2 className="mt-1 text-base font-semibold text-slate-900">{item.plainTitle}</h2>
              </div>
              <UrgencyBadge urgency={item.urgency} />
            </div>
            <p className="mt-2 text-xs text-slate-500">{formatDateTime(item.savedAt)}</p>
            <div className="mt-3 flex items-center gap-2 text-xs text-slate-600">
              {item.usedImage ? <FileImage size={14} /> : <FileText size={14} />}
              <span>
                {item.usedImage
                  ? "Saved from image analysis"
                  : item.originalTextSnippet || "Saved from text analysis"}
              </span>
            </div>
          </Link>
        ))
      )}
    </AppShell>
  );
}
