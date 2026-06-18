"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Check, Plus } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { ClearItAnalysis } from "@/lib/types";
import { cn } from "@/lib/utils";

export default function ChecklistPage() {
  const router = useRouter();
  const [analysis, setAnalysis] = useState<ClearItAnalysis | null>(null);
  const [checked, setChecked] = useState<Set<number>>(new Set());
  const [extra, setExtra] = useState<string[]>([]);
  const [newStep, setNewStep] = useState("");
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    const raw = sessionStorage.getItem("clearit_tool_result");
    if (raw) setAnalysis(JSON.parse(raw));
  }, []);

  if (!analysis) return (
    <AppShell title="Your checklist" onBack={() => router.back()}>
      <div className="flex items-center justify-center min-h-[60vh]">
        <p style={{ color: "var(--muted)" }} className="text-sm">No result loaded.</p>
      </div>
    </AppShell>
  );

  const allItems = [...analysis.checklist, ...extra];
  const done = checked.size;
  const pct = allItems.length > 0 ? Math.round((done / allItems.length) * 100) : 0;

  const toggle = (i: number) => setChecked(prev => {
    const n = new Set(prev); n.has(i) ? n.delete(i) : n.add(i); return n;
  });

  const addStep = () => {
    if (newStep.trim()) { setExtra(prev => [...prev, newStep.trim()]); setNewStep(""); }
    setAdding(false);
  };

  return (
    <AppShell title="Your checklist" onBack={() => router.back()}>
      <div className="px-5 pt-4 pb-8 flex flex-col gap-3">
        {/* Progress card */}
        <div className="rounded-2xl p-4" style={{ background: "var(--brand-gradient)" }}>
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-bold text-white">Staying safe</p>
            <p className="text-sm font-bold text-white">{done} / {allItems.length}</p>
          </div>
          <div className="w-full h-2 rounded-full bg-white/30">
            <div className="h-full rounded-full bg-white transition-all" style={{ width: `${pct}%` }} />
          </div>
        </div>

        {/* Items */}
        {allItems.map((item, i) => (
          <button key={i} onClick={() => toggle(i)}
            className="w-full flex items-center gap-3 p-4 rounded-2xl text-left transition-all active:scale-[0.98]"
            style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
            <div className={cn("w-7 h-7 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all")}
              style={{
                borderColor: checked.has(i) ? "var(--u-low-dot)" : "var(--border-2)",
                background: checked.has(i) ? "var(--u-low-dot)" : "transparent",
              }}>
              {checked.has(i) && <Check size={14} className="text-white" strokeWidth={3} />}
            </div>
            <span className={cn("text-sm flex-1 leading-relaxed", checked.has(i) ? "line-through" : "")}
              style={{ color: checked.has(i) ? "var(--muted)" : "var(--ink)" }}>
              {item}
            </span>
          </button>
        ))}

        {/* Add step */}
        {adding ? (
          <div className="rounded-2xl p-3 border-2" style={{ borderColor: "var(--violet-200)", background: "var(--violet-tint)" }}>
            <input
              autoFocus
              value={newStep}
              onChange={e => setNewStep(e.target.value)}
              onKeyDown={e => e.key === "Enter" && addStep()}
              placeholder="Describe your step…"
              className="w-full text-sm bg-transparent outline-none"
              style={{ color: "var(--ink)" }}
            />
            <div className="flex gap-2 mt-2">
              <button onClick={addStep} className="px-4 py-1.5 rounded-xl text-xs font-bold text-white" style={{ background: "var(--violet-600)" }}>Add</button>
              <button onClick={() => setAdding(false)} className="px-4 py-1.5 rounded-xl text-xs font-semibold border" style={{ borderColor: "var(--border)", color: "var(--muted)" }}>Cancel</button>
            </div>
          </div>
        ) : (
          <button onClick={() => setAdding(true)}
            className="flex items-center gap-2.5 p-4 rounded-2xl border-2 border-dashed transition-all active:scale-[0.98]"
            style={{ borderColor: "var(--violet-200)", color: "var(--violet-600)" }}>
            <Plus size={18} strokeWidth={2.2} />
            <span className="text-sm font-semibold">Add your own step</span>
          </button>
        )}
      </div>
    </AppShell>
  );
}
