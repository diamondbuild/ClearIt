"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronDown,
  ChevronUp,
  Phone,
  Mail,
  CheckSquare,
  BookOpen,
  Share2,
  Bookmark,
  ScanLine,
  Copy,
  Check,
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
}

type ActiveAction =
  | "call"
  | "reply"
  | "checklist"
  | "simpler"
  | "share"
  | null;

function Section({
  title,
  emoji,
  children,
  defaultOpen = true,
}: {
  title: string;
  emoji: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div
      className="rounded-2xl border overflow-hidden"
      style={{
        background: "var(--card)",
        borderColor: "var(--card-border)",
        boxShadow: "var(--shadow-sm)",
      }}
    >
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-4 py-3.5 text-left"
      >
        <span
          className="flex items-center gap-2 text-sm font-semibold"
          style={{ color: "var(--foreground)" }}
        >
          <span>{emoji}</span>
          {title}
        </span>
        {open ? (
          <ChevronUp size={16} style={{ color: "var(--muted-foreground)" }} />
        ) : (
          <ChevronDown size={16} style={{ color: "var(--muted-foreground)" }} />
        )}
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div
              className="px-4 pb-4 border-t"
              style={{ borderColor: "var(--border)" }}
            >
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function CopyableText({ text, label }: { text: string; label: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // ignore
    }
  };

  return (
    <div
      className="rounded-xl p-4 relative border mt-3"
      style={{
        background: "var(--muted)",
        borderColor: "var(--border)",
      }}
    >
      <p className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: "var(--muted-foreground)" }}>
        {label}
      </p>
      <p
        className="text-sm leading-relaxed whitespace-pre-wrap"
        style={{ color: "var(--foreground)" }}
      >
        {text}
      </p>
      <button
        onClick={handleCopy}
        className="absolute top-3 right-3 p-1.5 rounded-lg transition-all active:scale-90"
        style={{
          background: "var(--card)",
          border: "1px solid var(--border)",
          color: copied ? "#16a34a" : "var(--muted-foreground)",
        }}
      >
        {copied ? <Check size={14} /> : <Copy size={14} />}
      </button>
    </div>
  );
}

export function ResultCard({
  analysis,
  onSave,
  isSaved,
  onAnalyzeAnother,
}: ResultCardProps) {
  const [activeAction, setActiveAction] = useState<ActiveAction>(null);

  const toggleAction = (action: ActiveAction) => {
    setActiveAction((prev) => (prev === action ? null : action));
  };

  const actionButtons = [
    {
      id: "call" as const,
      label: "Call script",
      icon: <Phone size={15} />,
      show: !!analysis.callScript,
    },
    {
      id: "reply" as const,
      label: "Write a reply",
      icon: <Mail size={15} />,
      show: !!analysis.replyDraft,
    },
    {
      id: "checklist" as const,
      label: "Checklist",
      icon: <CheckSquare size={15} />,
      show: analysis.checklist.length > 0,
    },
    {
      id: "simpler" as const,
      label: "Explain simpler",
      icon: <BookOpen size={15} />,
      show: !!analysis.simplifiedExplanation,
    },
    {
      id: "share" as const,
      label: "Share summary",
      icon: <Share2 size={15} />,
      show: true,
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col gap-4 px-4 py-5"
    >
      {/* Hero */}
      <div
        className="rounded-2xl p-5 border"
        style={{
          background: "var(--card)",
          borderColor: "var(--card-border)",
          boxShadow: "var(--shadow-md)",
        }}
      >
        <div className="flex flex-wrap items-start gap-2 mb-3">
          <span
            className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border"
            style={{
              background: "var(--primary)",
              color: "white",
              border: "none",
            }}
          >
            {categoryLabel(analysis.category)}
          </span>
          <UrgencyBadge urgency={analysis.urgency} size="sm" />
        </div>

        <h1
          className="text-xl font-bold leading-snug mb-2"
          style={{ color: "var(--foreground)" }}
        >
          {analysis.plainTitle}
        </h1>

        <p className="text-sm leading-relaxed" style={{ color: "var(--muted-foreground)" }}>
          {analysis.oneSentenceSummary}
        </p>

        <p
          className="text-xs mt-3 font-medium"
          style={{ color: "var(--muted-foreground)" }}
        >
          Confidence:{" "}
          <span style={{ color: "var(--foreground)" }}>
            {analysis.confidence.charAt(0).toUpperCase() +
              analysis.confidence.slice(1)}
          </span>
        </p>
      </div>

      {/* Safety notices */}
      <SafetyNotice
        urgency={analysis.urgency}
        warnings={analysis.warnings}
        disclaimer={analysis.disclaimer}
      />

      {/* Main sections */}
      <Section title="What this is" emoji="📄" defaultOpen>
        <p
          className="text-sm leading-relaxed pt-3"
          style={{ color: "var(--foreground)" }}
        >
          {analysis.whatThisIs}
        </p>
      </Section>

      <Section title="What it means" emoji="💡" defaultOpen>
        <p
          className="text-sm leading-relaxed pt-3"
          style={{ color: "var(--foreground)" }}
        >
          {analysis.whatItMeans}
        </p>
      </Section>

      <Section title="What to do next" emoji="✅" defaultOpen>
        <ul className="flex flex-col gap-2 pt-3">
          {analysis.nextSteps.map((step, i) => (
            <li key={i} className="flex items-start gap-3">
              <span
                className="flex-shrink-0 w-5 h-5 rounded-full text-xs font-bold flex items-center justify-center mt-0.5"
                style={{
                  background: "var(--primary)",
                  color: "white",
                }}
              >
                {i + 1}
              </span>
              <span
                className="text-sm leading-relaxed"
                style={{ color: "var(--foreground)" }}
              >
                {step}
              </span>
            </li>
          ))}
        </ul>
      </Section>

      {/* Key details */}
      {analysis.keyDetails.length > 0 && (
        <Section title="Key details found" emoji="🔑" defaultOpen>
          <div className="flex flex-col gap-2 pt-3">
            {analysis.keyDetails.map((detail, i) => (
              <div
                key={i}
                className="flex justify-between items-start gap-4 py-2 border-b last:border-0"
                style={{ borderColor: "var(--border)" }}
              >
                <span
                  className="text-sm font-medium flex-shrink-0"
                  style={{ color: "var(--muted-foreground)" }}
                >
                  {detail.label}
                </span>
                <span
                  className="text-sm font-semibold text-right"
                  style={{ color: "var(--foreground)" }}
                >
                  {detail.value}
                </span>
              </div>
            ))}
          </div>
        </Section>
      )}

      {/* Deadlines */}
      {analysis.detectedDeadlines.length > 0 && (
        <Section title="Important dates" emoji="📅" defaultOpen>
          <div className="flex flex-col gap-3 pt-3">
            {analysis.detectedDeadlines.map((dl, i) => (
              <div
                key={i}
                className="rounded-xl p-3 border"
                style={{
                  background: "#fffbeb",
                  borderColor: "#fde68a",
                }}
              >
                <p className="text-sm font-semibold text-amber-800">
                  {dl.label}: {dl.dateText}
                </p>
                <p className="text-xs text-amber-700 mt-1">{dl.explanation}</p>
              </div>
            ))}
          </div>
        </Section>
      )}

      {/* Action buttons */}
      <div>
        <p
          className="text-xs font-semibold uppercase tracking-wider mb-3 px-1"
          style={{ color: "var(--muted-foreground)" }}
        >
          Tools
        </p>
        <div className="grid grid-cols-2 gap-2">
          {actionButtons
            .filter((b) => b.show)
            .map(({ id, label, icon }) => (
              <button
                key={id}
                onClick={() => toggleAction(id)}
                className={cn(
                  "flex items-center justify-center gap-2 py-3 px-3 rounded-xl text-sm font-semibold transition-all border active:scale-95",
                  activeAction === id && "ring-2 ring-offset-1"
                )}
                style={
                  activeAction === id
                    ? {
                        background: "var(--primary)",
                        color: "white",
                        borderColor: "var(--primary)",
                      }
                    : {
                        background: "var(--card)",
                        color: "var(--foreground)",
                        borderColor: "var(--border)",
                      }
                }
              >
                {icon}
                {label}
              </button>
            ))}
        </div>

        <AnimatePresence>
          {activeAction && (
            <motion.div
              key={activeAction}
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden mt-3"
            >
              {activeAction === "call" && (
                <CopyableText
                  text={analysis.callScript}
                  label="Call script"
                />
              )}
              {activeAction === "reply" && (
                <CopyableText
                  text={analysis.replyDraft}
                  label="Reply draft"
                />
              )}
              {activeAction === "checklist" && (
                <div
                  className="rounded-xl p-4 border mt-3"
                  style={{
                    background: "var(--muted)",
                    borderColor: "var(--border)",
                  }}
                >
                  <p className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: "var(--muted-foreground)" }}>
                    Your checklist
                  </p>
                  <ChecklistItems items={analysis.checklist} />
                </div>
              )}
              {activeAction === "simpler" && (
                <CopyableText
                  text={analysis.simplifiedExplanation}
                  label="Simple explanation"
                />
              )}
              {activeAction === "share" && (
                <div className="mt-3">
                  <ClearItCard analysis={analysis} />
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Bottom actions */}
      <div className="flex gap-2 pt-2">
        {onSave && (
          <button
            onClick={onSave}
            className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-2xl text-sm font-semibold transition-all border active:scale-95"
            style={
              isSaved
                ? {
                    background: "#ecfdf5",
                    borderColor: "#6ee7b7",
                    color: "#065f46",
                  }
                : {
                    background: "var(--card)",
                    borderColor: "var(--border)",
                    color: "var(--foreground)",
                  }
            }
          >
            <Bookmark size={16} fill={isSaved ? "currentColor" : "none"} />
            {isSaved ? "Saved!" : "Save to history"}
          </button>
        )}
        {onAnalyzeAnother && (
          <button
            onClick={onAnalyzeAnother}
            className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-2xl text-sm font-semibold transition-all active:scale-95 text-white"
            style={{ background: "var(--primary)" }}
          >
            <ScanLine size={16} />
            Analyze another
          </button>
        )}
      </div>

      {/* Suggested questions */}
      {analysis.suggestedQuestions.length > 0 && (
        <Section title="You might wonder" emoji="💬" defaultOpen={false}>
          <ul className="flex flex-col gap-2 pt-3">
            {analysis.suggestedQuestions.map((q, i) => (
              <li key={i} className="flex items-start gap-2">
                <span className="text-sm" style={{ color: "var(--muted-foreground)" }}>
                  Q:
                </span>
                <span
                  className="text-sm leading-relaxed"
                  style={{ color: "var(--foreground)" }}
                >
                  {q}
                </span>
              </li>
            ))}
          </ul>
        </Section>
      )}
    </motion.div>
  );
}

function ChecklistItems({ items }: { items: string[] }) {
  const [checked, setChecked] = useState<Set<number>>(new Set());

  const toggle = (i: number) => {
    setChecked((prev) => {
      const next = new Set(prev);
      if (next.has(i)) next.delete(i);
      else next.add(i);
      return next;
    });
  };

  return (
    <ul className="flex flex-col gap-2.5">
      {items.map((item, i) => (
        <li
          key={i}
          className="flex items-start gap-3 cursor-pointer"
          onClick={() => toggle(i)}
        >
          <div
            className="flex-shrink-0 w-5 h-5 rounded border-2 flex items-center justify-center mt-0.5 transition-all"
            style={{
              borderColor: checked.has(i) ? "#16a34a" : "var(--border)",
              background: checked.has(i) ? "#16a34a" : "transparent",
            }}
          >
            {checked.has(i) && (
              <Check size={12} className="text-white" strokeWidth={3} />
            )}
          </div>
          <span
            className={cn(
              "text-sm leading-relaxed transition-all",
              checked.has(i) ? "line-through" : ""
            )}
            style={{
              color: checked.has(i) ? "var(--muted-foreground)" : "var(--foreground)",
            }}
          >
            {item}
          </span>
        </li>
      ))}
    </ul>
  );
}
