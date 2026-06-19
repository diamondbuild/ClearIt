"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Phone, Mail, ListChecks, BookOpen, Share2, Bookmark,
  ScanLine, ChevronDown, ChevronUp, Lightbulb, CheckSquare,
  Copy, Check, FileText, ShieldCheck,
} from "lucide-react";
import { ClearItAnalysis } from "@/lib/types";
import { UrgencyBadge } from "@/components/UrgencyBadge";
import { SafetyNotice } from "@/components/SafetyNotice";
import { ClearItCard } from "@/components/ClearItCard";
import { categoryLabel, cn } from "@/lib/utils";

interface ResultCardProps {
  analysis: ClearItAnalysis;
  onSave?: () => void;
  isSaved?: boolean;
  onAnalyzeAnother?: () => void;
  onShare?: () => void;
  thumbnails?: string[];
}


// Urgency top bar color
function urgencyBarColor(urgency: string): string {
  if (urgency === "possible_scam") return "linear-gradient(90deg, #E0322E, #FF6A45)";
  if (urgency === "emergency") return "#B91C1C";
  if (urgency === "high") return "linear-gradient(90deg, #E0581E, #FF6A45)";
  if (urgency === "medium") return "linear-gradient(90deg, #B7791F, #F59E0B)";
  if (urgency === "low") return "linear-gradient(90deg, #0E9F6E, #22C55E)";
  return "var(--border)";
}

function confidenceSegments(confidence: string) {
  const filled = confidence === "high" ? 3 : confidence === "medium" ? 2 : 1;
  return Array.from({ length: 3 }, (_, i) => i < filled);
}

function IconTile({ icon: Icon, color, bg }: { icon: React.ElementType; color: string; bg: string }) {
  return (
    <div className="w-8 h-8 rounded-[10px] flex items-center justify-center flex-shrink-0" style={{ background: bg }}>
      <Icon size={16} strokeWidth={2.2} style={{ color }} />
    </div>
  );
}

function SectionCard({
  icon, iconColor, iconBg, title, children, defaultOpen = true,
}: {
  icon: React.ElementType; iconColor: string; iconBg: string;
  title: string; children: React.ReactNode; defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="rounded-2xl overflow-hidden" style={{ background: "var(--surface)", border: "1px solid var(--border)", boxShadow: "var(--shadow-sm)" }}>
      <button className="w-full flex items-center gap-3 px-4 py-3.5" onClick={() => setOpen(!open)}>
        <IconTile icon={icon} color={iconColor} bg={iconBg} />
        <span className="flex-1 text-sm font-bold text-left" style={{ color: "var(--ink)", fontFamily: "var(--font-hanken), sans-serif" }}>{title}</span>
        {open ? <ChevronUp size={16} style={{ color: "var(--muted)" }} /> : <ChevronDown size={16} style={{ color: "var(--muted)" }} />}
      </button>
      <AnimatePresence>
        {open && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.18 }} className="overflow-hidden">
            <div className="px-4 pb-4 border-t" style={{ borderColor: "var(--border)" }}>
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function CopyBlock({ text, label }: { text: string; label: string }) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    await navigator.clipboard.writeText(text).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <div className="relative rounded-2xl p-4 mt-3 border" style={{ background: "var(--surface-2)", borderColor: "var(--border-2)" }}>
      <p className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: "var(--muted)", letterSpacing: "0.1em" }}>{label}</p>
      <p className="text-sm leading-relaxed whitespace-pre-wrap" style={{ color: "var(--ink)" }}>{text}</p>
      <button onClick={copy}
        className="absolute top-3 right-3 w-8 h-8 rounded-lg flex items-center justify-center transition-all active:scale-90"
        style={{ background: "var(--surface)", border: "1px solid var(--border)", color: copied ? "var(--u-low-dot)" : "var(--muted)" }}>
        {copied ? <Check size={14} /> : <Copy size={14} />}
      </button>
    </div>
  );
}

function QAItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  const hasAnswer = !!a;
  return (
    <div className="rounded-2xl overflow-hidden border transition-all"
      style={{ borderColor: open ? "var(--violet-200)" : "var(--border)", background: open ? "var(--violet-tint)" : "var(--surface)" }}>
      <button onClick={() => hasAnswer && setOpen(!open)}
        className="w-full flex items-start gap-3 px-4 py-3 text-left"
        style={{ cursor: hasAnswer ? "pointer" : "default" }}>
        <span className="text-sm font-bold flex-shrink-0 mt-0.5" style={{ color: "var(--violet-600)" }}>Q</span>
        <span className="text-sm font-medium flex-1 leading-snug" style={{ color: "var(--ink)" }}>{q}</span>
        {hasAnswer && (
          <ChevronDown size={15} className="flex-shrink-0 mt-0.5 transition-transform"
            style={{ color: "var(--muted)", transform: open ? "rotate(180deg)" : "rotate(0deg)" }} />
        )}
      </button>
      <AnimatePresence>
        {open && hasAnswer && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.18 }} className="overflow-hidden">
            <div className="flex items-start gap-3 px-4 pb-4 pt-1 border-t" style={{ borderColor: "var(--violet-200)" }}>
              <span className="text-sm font-bold flex-shrink-0 mt-0.5" style={{ color: "var(--violet-400)" }}>A</span>
              <p className="text-sm leading-relaxed" style={{ color: "var(--body)" }}>{a}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function ChecklistBlock({ items }: { items: string[] }) {
  const [checked, setChecked] = useState<Set<number>>(new Set());
  const toggle = (i: number) => setChecked(prev => { const n = new Set(prev); n.has(i) ? n.delete(i) : n.add(i); return n; });
  const done = checked.size;
  const pct = items.length > 0 ? Math.round((done / items.length) * 100) : 0;

  return (
    <div className="mt-3 flex flex-col gap-2">
      {/* Progress */}
      <div className="rounded-2xl p-3 flex items-center gap-3"
        style={{ background: "var(--brand-gradient)" }}>
        <span className="text-sm font-bold text-white flex-1">Progress</span>
        <span className="text-sm font-bold text-white">{done} / {items.length}</span>
        <div className="flex-1 h-1.5 rounded-full bg-white/30">
          <div className="h-full rounded-full bg-white transition-all" style={{ width: `${pct}%` }} />
        </div>
      </div>

      {/* Items */}
      {items.map((item, i) => (
        <button key={i} onClick={() => toggle(i)}
          className="flex items-center gap-3 p-3 rounded-2xl text-left transition-all active:scale-[0.98]"
          style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
          <div className="w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all"
            style={{ borderColor: checked.has(i) ? "var(--u-low-dot)" : "var(--border-2)", background: checked.has(i) ? "var(--u-low-dot)" : "transparent" }}>
            {checked.has(i) && <Check size={12} className="text-white" strokeWidth={3} />}
          </div>
          <span className={cn("text-sm flex-1 leading-relaxed", checked.has(i) ? "line-through" : "")}
            style={{ color: checked.has(i) ? "var(--muted)" : "var(--ink)" }}>
            {item}
          </span>
        </button>
      ))}

      {/* Add step */}
      <button className="flex items-center gap-2 p-3 rounded-2xl border-2 border-dashed transition-all active:scale-[0.98]"
        style={{ borderColor: "var(--violet-200)", color: "var(--violet-600)" }}>
        <span className="text-lg leading-none">+</span>
        <span className="text-sm font-semibold">Add your own step</span>
      </button>
    </div>
  );
}

type ActiveTool = "call" | "reply" | "checklist" | "simpler" | "share" | null;

export function ResultCard({ analysis, onSave, isSaved, onAnalyzeAnother, onShare, thumbnails = [] }: ResultCardProps) {
  const [activeTool, setActiveTool] = useState<ActiveTool>(null);
  const router = useRouter();

  const toggleTool = (t: ActiveTool) => setActiveTool(prev => prev === t ? null : t);

  const tools = [
    { id: "call" as const, label: "Call script", icon: Phone, show: !!analysis.callScript },
    { id: "reply" as const, label: "Write reply", icon: Mail, show: !!analysis.replyDraft },
    { id: "checklist" as const, label: "Checklist", icon: ListChecks, show: analysis.checklist.length > 0 },
    { id: "simpler" as const, label: "Explain simpler", icon: BookOpen, show: !!analysis.simplifiedExplanation },
    { id: "share" as const, label: "Share", icon: Share2, show: true },
  ].filter(t => t.show);

  // Navigate to dedicated tool pages
  const handleToolClick = (id: ActiveTool) => {
    if (!id) return;
    if (id === "call") {
      sessionStorage.setItem("clearit_tool_result", JSON.stringify(analysis));
      router.push("/tool/call");
      return;
    }
    if (id === "reply") {
      sessionStorage.setItem("clearit_tool_result", JSON.stringify(analysis));
      router.push("/tool/reply");
      return;
    }
    if (id === "checklist") {
      sessionStorage.setItem("clearit_tool_result", JSON.stringify(analysis));
      router.push("/tool/checklist");
      return;
    }
    if (id === "share") {
      onShare?.();
      return;
    }
    toggleTool(id);
  };

  const segments = confidenceSegments(analysis.confidence);

  return (
    <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col gap-4 px-4 py-4">

      {/* Image thumbnails */}
      {thumbnails.length > 0 && (
        <div className="flex gap-2 overflow-x-auto pb-0.5" style={{ scrollbarWidth: "none" }}>
          {thumbnails.map((src, i) => (
            <div key={i}
              className="flex-shrink-0 rounded-2xl overflow-hidden border"
              style={{
                width: thumbnails.length === 1 ? "100%" : 110,
                height: thumbnails.length === 1 ? 200 : 110,
                borderColor: "var(--border)",
                boxShadow: "var(--shadow-sm)",
              }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={src} alt={`Image ${i + 1}`}
                className="w-full h-full object-cover" />
            </div>
          ))}
        </div>
      )}

      {/* Hero card */}
      <div className="rounded-[26px] overflow-hidden"
        style={{ background: "var(--surface)", boxShadow: "var(--shadow-hero)", border: "1px solid var(--border)" }}>
        {/* Top urgency bar */}
        <div className="h-1.5 w-full" style={{ background: urgencyBarColor(analysis.urgency) }} />

        <div className="p-5">
          {/* Badges */}
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold"
              style={{ background: "var(--violet-tint)", color: "var(--violet-700)" }}>
              {categoryLabel(analysis.category)}
            </span>
            <UrgencyBadge urgency={analysis.urgency} size="sm" />
          </div>

          {/* Title */}
          <h1 className="text-2xl font-extrabold leading-tight mb-3"
            style={{ fontFamily: "var(--font-bricolage), sans-serif", color: "var(--ink)", letterSpacing: "-0.015em" }}>
            {analysis.plainTitle}
          </h1>

          {/* Summary */}
          <p className="text-sm leading-relaxed mb-4" style={{ color: "var(--body)" }}>
            {analysis.oneSentenceSummary}
          </p>

          {/* Divider */}
          <div className="border-t mb-4" style={{ borderColor: "var(--border)" }} />

          {/* Confidence + verification */}
          <div className="flex items-center gap-3 flex-wrap">
            <span className="text-xs font-bold uppercase tracking-widest" style={{ color: "var(--muted)", letterSpacing: "0.1em" }}>
              Confidence
            </span>
            <div className="flex gap-1">
              {segments.map((filled, i) => (
                <div key={i} className="h-1.5 rounded-full transition-all"
                  style={{ width: 22, background: filled ? "var(--violet-600)" : "var(--border)" }} />
              ))}
            </div>
            <span className="text-xs font-bold" style={{ color: "var(--ink)" }}>
              {analysis.confidence.charAt(0).toUpperCase() + analysis.confidence.slice(1)}
            </span>
            {analysis.geminiVerified && (
              <span className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full ml-auto"
                style={{ background: "var(--u-low-bg)", color: "var(--u-low-text)" }}>
                ✓ Verified by 2 agents
              </span>
            )}
          </div>
          {analysis.geminiDisagreement && (
            <p className="text-xs mt-1" style={{ color: "var(--muted)" }}>
              Note: {analysis.geminiDisagreement}
            </p>
          )}
        </div>
      </div>

      {/* Safety notice */}
      <SafetyNotice urgency={analysis.urgency} warnings={analysis.warnings} disclaimer={analysis.disclaimer} />

      {/* Section: What it means */}
      <SectionCard icon={Lightbulb} iconColor="var(--violet-600)" iconBg="var(--violet-tint)" title="What it means">
        <p className="text-sm leading-relaxed mt-3" style={{ color: "var(--body)", lineHeight: 1.6 }}>
          {analysis.whatItMeans}
        </p>
      </SectionCard>

      {/* Section: What to do next */}
      {analysis.nextSteps.length > 0 && (
        <SectionCard icon={CheckSquare} iconColor="var(--u-low-text)" iconBg="var(--u-low-bg)" title="What to do next">
          <ol className="flex flex-col gap-2.5 mt-3">
            {analysis.nextSteps.map((step, i) => (
              <li key={i} className="flex items-start gap-3">
                <span className="flex-shrink-0 w-6 h-6 rounded-full text-xs font-bold flex items-center justify-center mt-0.5"
                  style={{ background: "var(--ink)", color: "var(--bg)" }}>
                  {i + 1}
                </span>
                <span className="text-sm leading-relaxed" style={{ color: "var(--ink)" }}>{step}</span>
              </li>
            ))}
          </ol>
        </SectionCard>
      )}

      {/* What this is */}
      <SectionCard icon={FileText} iconColor="var(--muted)" iconBg="var(--surface-2)" title="What this is" defaultOpen={false}>
        <p className="text-sm leading-relaxed mt-3" style={{ color: "var(--body)" }}>{analysis.whatThisIs}</p>
      </SectionCard>

      {/* Key details */}
      {analysis.keyDetails.length > 0 && (
        <SectionCard icon={ShieldCheck} iconColor="var(--u-med-text)" iconBg="var(--u-med-bg)" title="Key details" defaultOpen>
          <div className="flex flex-col gap-1 mt-3">
            {analysis.keyDetails.map((d, i) => (
              <div key={i} className="flex justify-between items-start gap-4 py-2 border-b last:border-0" style={{ borderColor: "var(--border)" }}>
                <span className="text-sm" style={{ color: "var(--muted)" }}>{d.label}</span>
                <span className="text-sm font-semibold text-right" style={{ color: "var(--ink)" }}>{d.value}</span>
              </div>
            ))}
          </div>
        </SectionCard>
      )}

      {/* Deadlines */}
      {analysis.detectedDeadlines.length > 0 && (
        <div className="flex flex-col gap-2">
          {analysis.detectedDeadlines.map((dl, i) => (
            <div key={i} className="rounded-2xl p-4 border" style={{ background: "var(--u-med-bg)", borderColor: "var(--u-med-dot)" }}>
              <p className="text-sm font-bold" style={{ color: "var(--u-med-text)" }}>📅 {dl.label}: {dl.dateText}</p>
              <p className="text-xs mt-1" style={{ color: "var(--u-med-text)", opacity: 0.8 }}>{dl.explanation}</p>
            </div>
          ))}
        </div>
      )}

      {/* Tools grid */}
      <div>
        <p className="text-xs font-bold uppercase tracking-widest mb-3 px-0.5" style={{ color: "var(--muted)", letterSpacing: "0.1em" }}>Tools</p>
        <div className="grid grid-cols-2 gap-2">
          {tools.map(({ id, label, icon: Icon }) => (
            <button key={id} onClick={() => handleToolClick(id)}
              className={cn("flex items-center gap-2.5 py-3.5 px-4 rounded-2xl text-sm font-semibold transition-all border active:scale-95", activeTool === id && "ring-2 ring-offset-1")}
              style={activeTool === id
                ? { background: "var(--violet-tint)", color: "var(--violet-700)", borderColor: "var(--violet-200)" }
                : { background: "var(--surface)", color: "var(--ink)", borderColor: "var(--border)" }}>
              <Icon size={16} strokeWidth={2.2} style={{ color: activeTool === id ? "var(--violet-600)" : "var(--violet-400)" }} />
              {label}
            </button>
          ))}
        </div>

        {/* Inline expanded tool: simpler explanation */}
        <AnimatePresence>
          {activeTool === "simpler" && (
            <motion.div key="simpler" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden mt-3">
              <CopyBlock text={analysis.simplifiedExplanation} label="Simple explanation" />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Bottom actions */}
      <div className="flex gap-2 pt-1">
        {/* Auto-saved indicator */}
        {isSaved && (
          <div className="flex items-center justify-center gap-2 px-4 py-3.5 rounded-2xl text-sm font-semibold border"
            style={{ background: "var(--u-low-bg)", borderColor: "var(--u-low-dot)", color: "var(--u-low-text)" }}>
            <Bookmark size={15} fill="currentColor" />
            Saved
          </div>
        )}
        {onSave && !isSaved && (
          <button onClick={onSave}
            className="flex items-center justify-center gap-2 px-4 py-3.5 rounded-2xl text-sm font-semibold transition-all border active:scale-95"
            style={{ background: "var(--surface)", borderColor: "var(--border)", color: "var(--ink)" }}>
            <Bookmark size={15} fill="none" />
            Save
          </button>
        )}
        {onAnalyzeAnother && (
          <button onClick={onAnalyzeAnother}
            className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-2xl text-sm font-bold text-white transition-all active:scale-95"
            style={{ background: "var(--brand-gradient)", boxShadow: "var(--brand-glow)" }}>
            <ScanLine size={16} strokeWidth={2.2} />
            Scan another
          </button>
        )}
      </div>

      {/* You might wonder — Q&A */}
      {(analysis.suggestedQA?.length || analysis.suggestedQuestions.length > 0) && (
        <SectionCard icon={BookOpen} iconColor="var(--muted)" iconBg="var(--surface-2)" title="You might wonder" defaultOpen>
          <div className="flex flex-col gap-2 mt-3">
            {(analysis.suggestedQA?.length
              ? analysis.suggestedQA
              : analysis.suggestedQuestions.map(q => ({ q, a: "" }))
            ).map((item, i) => (
              <QAItem key={i} q={item.q} a={item.a} />
            ))}
          </div>
        </SectionCard>
      )}
    </motion.div>
  );
}
