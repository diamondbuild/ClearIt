"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Search, Trash2, FileText, ShieldAlert, Zap, CheckCircle, Info, HelpCircle, Clock } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { UrgencyDot } from "@/components/UrgencyBadge";
import { HistoryItem, Urgency, Category } from "@/lib/types";
import { getHistory, deleteHistoryItem } from "@/lib/storage/history";
import { categoryLabel } from "@/lib/utils";

function urgencyIcon(urgency: Urgency): React.ElementType {
  if (urgency === "possible_scam") return ShieldAlert;
  if (urgency === "emergency") return ShieldAlert;
  if (urgency === "high") return Zap;
  if (urgency === "medium") return Info;
  if (urgency === "low") return CheckCircle;
  return HelpCircle;
}

function urgencyTileColors(urgency: Urgency): { bg: string; color: string } {
  if (urgency === "possible_scam" || urgency === "emergency") return { bg: "var(--u-scam-bg)", color: "var(--u-scam-dot)" };
  if (urgency === "high") return { bg: "var(--u-high-bg)", color: "var(--u-high-dot)" };
  if (urgency === "medium") return { bg: "var(--u-med-bg)", color: "var(--u-med-dot)" };
  if (urgency === "low") return { bg: "var(--u-low-bg)", color: "var(--u-low-dot)" };
  return { bg: "var(--surface-2)", color: "var(--muted)" };
}

function groupByDate(items: HistoryItem[]): { label: string; items: HistoryItem[] }[] {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);

  const groups: { label: string; items: HistoryItem[] }[] = [
    { label: "Today", items: [] },
    { label: "Earlier this week", items: [] },
    { label: "Older", items: [] },
  ];

  for (const item of items) {
    const d = new Date(item.savedAt);
    if (d >= today) groups[0].items.push(item);
    else if (d >= weekAgo) groups[1].items.push(item);
    else groups[2].items.push(item);
  }

  return groups.filter(g => g.items.length > 0);
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  const hrs = Math.floor(mins / 60);
  const days = Math.floor(hrs / 24);
  if (mins < 2) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  if (hrs < 24) return `${hrs}h ago`;
  if (days === 1) return "Yesterday";
  const day = new Date(dateStr);
  return day.toLocaleDateString("en-US", { weekday: "short" });
}

export default function HistoryPage() {
  const router = useRouter();
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [query, setQuery] = useState("");
  const [loaded, setLoaded] = useState(false);

  useEffect(() => { setHistory(getHistory()); setLoaded(true); }, []);

  const filtered = useMemo(() => {
    if (!query.trim()) return history;
    const q = query.toLowerCase();
    return history.filter(h =>
      h.plainTitle.toLowerCase().includes(q) ||
      categoryLabel(h.category).toLowerCase().includes(q) ||
      (h.textSnippet ?? "").toLowerCase().includes(q)
    );
  }, [history, query]);

  const groups = useMemo(() => groupByDate(filtered), [filtered]);

  const handleOpen = (item: HistoryItem) => {
    sessionStorage.setItem(`clearit_pending_${item.id}`, JSON.stringify({ analysis: item.result, textSnippet: item.textSnippet, usedImage: item.usedImage }));
    router.push(`/result?id=${item.id}&from=history`);
  };

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    deleteHistoryItem(id);
    setHistory(getHistory());
  };

  return (
    <AppShell showWordmark={false} noHeader>
      <div className="px-5 pt-5 pb-2 safe-top">
        <h1 className="text-3xl font-extrabold tracking-tight mb-4"
          style={{ fontFamily: "var(--font-bricolage), sans-serif", color: "var(--ink)", letterSpacing: "-0.02em" }}>
          History
        </h1>

        {/* Search */}
        <div className="flex items-center gap-2.5 px-4 py-3 rounded-2xl border mb-2"
          style={{ background: "var(--surface)", borderColor: "var(--border)" }}>
          <Search size={16} style={{ color: "var(--muted)" }} strokeWidth={2} />
          <input
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search your answers"
            className="flex-1 text-sm bg-transparent outline-none"
            style={{ color: "var(--ink)" }}
          />
        </div>
      </div>

      {!loaded ? null : history.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 px-6 text-center">
          <div className="text-5xl mb-4">📂</div>
          <h3 className="text-lg font-bold mb-2" style={{ color: "var(--ink)" }}>No saved answers yet</h3>
          <p className="text-sm" style={{ color: "var(--muted)" }}>Scan something to get your first result.</p>
          <button onClick={() => router.push("/analyze")}
            className="mt-6 px-6 py-3 rounded-2xl text-sm font-bold text-white"
            style={{ background: "var(--brand-gradient)" }}>
            Scan something
          </button>
        </div>
      ) : (
        <div className="px-5 pb-6">
          {groups.map(group => (
            <div key={group.label} className="mb-5">
              <p className="text-xs font-bold uppercase tracking-widest mb-2 mt-3"
                style={{ color: "var(--muted)", letterSpacing: "0.1em" }}>
                {group.label}
              </p>
              <div className="flex flex-col gap-2">
                {group.items.map((item, i) => {
                  const Icon = urgencyIcon(item.urgency);
                  const { bg, color } = urgencyTileColors(item.urgency);
                  return (
                    <motion.button
                      key={item.id}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.04 }}
                      onClick={() => handleOpen(item)}
                      className="w-full flex items-center gap-3 p-4 rounded-2xl text-left transition-all active:scale-[0.98]"
                      style={{ background: "var(--surface)", border: "1px solid var(--border)", boxShadow: "var(--shadow-sm)" }}
                    >
                      {/* Icon tile */}
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                        style={{ background: bg }}>
                        <Icon size={18} strokeWidth={2.2} style={{ color }} />
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold truncate" style={{ color: "var(--ink)" }}>
                          {item.plainTitle}
                        </p>
                        <p className="text-xs mt-0.5 flex items-center gap-1.5" style={{ color: "var(--muted)" }}>
                          <span>{categoryLabel(item.category)}</span>
                          <span>·</span>
                          <Clock size={10} className="inline" />
                          <span>{timeAgo(item.savedAt)}</span>
                        </p>
                      </div>

                      {/* Urgency dot */}
                      <UrgencyDot urgency={item.urgency} />

                      {/* Delete */}
                      <button onClick={e => handleDelete(item.id, e)}
                        className="w-7 h-7 flex items-center justify-center rounded-lg ml-1"
                        style={{ color: "var(--muted)" }}>
                        <Trash2 size={14} />
                      </button>
                    </motion.button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </AppShell>
  );
}
