"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Camera, Image as ImageIcon, ScanLine, Focus, ShieldAlert, Zap, CheckCircle, Info, HelpCircle, Clock } from "lucide-react";
import { BottomNav } from "@/components/BottomNav";
import { motion } from "framer-motion";
import { getHistory } from "@/lib/storage/history";
import { HistoryItem, Urgency } from "@/lib/types";
import { categoryLabel } from "@/lib/utils";

// Each chip pre-fills a text hint in the analyze screen
const chips = [
  { label: "Is this a scam?",   hint: "Is this a scam? Please check for scam signals and advise me." },
  { label: "Explain this bill", hint: "Please explain this bill — what do I owe, when is it due, and what do I do?" },
  { label: "What is this pill?", hint: "What is this medication? What is it used for, and what should I know?" },
  { label: "Who is this?",      hint: "Who or what is this? Please identify and explain." },
];

function urgencyDotColor(urgency: Urgency): string {
  if (urgency === "possible_scam" || urgency === "emergency") return "#E0322E";
  if (urgency === "high") return "#E0581E";
  if (urgency === "medium") return "#B7791F";
  if (urgency === "low") return "#0E9F6E";
  return "#857C92";
}

function urgencyIconEl(urgency: Urgency) {
  const size = 14;
  const strokeWidth = 2.2;
  if (urgency === "possible_scam" || urgency === "emergency")
    return <ShieldAlert size={size} strokeWidth={strokeWidth} style={{ color: "#E0322E" }} />;
  if (urgency === "high") return <Zap size={size} strokeWidth={strokeWidth} style={{ color: "#E0581E" }} />;
  if (urgency === "medium") return <Info size={size} strokeWidth={strokeWidth} style={{ color: "#B7791F" }} />;
  if (urgency === "low") return <CheckCircle size={size} strokeWidth={strokeWidth} style={{ color: "#0E9F6E" }} />;
  return <HelpCircle size={size} strokeWidth={strokeWidth} style={{ color: "#857C92" }} />;
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
  return new Date(dateStr).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export default function HomePage() {
  const router = useRouter();
  const [recent, setRecent] = useState<HistoryItem[]>([]);

  useEffect(() => {
    setRecent(getHistory().slice(0, 3));
  }, []);

  return (
    <div
      className="flex flex-col max-w-md mx-auto overflow-hidden"
      style={{
        height: "100dvh",
        background: "radial-gradient(ellipse 90% 55% at 50% 10%, rgba(108,60,224,.4) 0%, transparent 65%), #141019",
      }}
    >
      {/* ── Header ─────────────────────────────────── */}
      <div className="flex items-center justify-between px-5 pt-4 flex-shrink-0 safe-top">
        <div className="flex items-center gap-2.5">
          <div
            className="w-8 h-8 rounded-[10px] flex items-center justify-center"
            style={{ background: "var(--brand-gradient)", boxShadow: "var(--brand-glow)" }}
          >
            <Focus size={16} className="text-white" strokeWidth={2.2} />
          </div>
          <span className="text-xl font-extrabold tracking-tight text-white"
            style={{ fontFamily: "var(--font-bricolage), sans-serif" }}>
            ClearIt
          </span>
        </div>
        <button
          className="w-9 h-9 rounded-full flex items-center justify-center"
          style={{ background: "rgba(255,255,255,.1)" }}
          onClick={() => router.push("/settings")}
        >
          <span className="text-white text-sm font-bold">⚙</span>
        </button>
      </div>

      {/* ── Viewfinder ─────────────────────────────── */}
      <div className="flex flex-col items-center px-5 pt-3 flex-shrink-0">
        <div className="relative animate-scanpulse" style={{ width: 172, height: 172 }}>
          {/* Hatch fill */}
          <div className="absolute inset-0 rounded-[30px] overflow-hidden"
            style={{
              background: "rgba(108,60,224,.1)",
              backgroundImage: "repeating-linear-gradient(45deg, rgba(108,60,224,.07) 0px, rgba(108,60,224,.07) 1px, transparent 1px, transparent 11px)",
            }} />
          {/* Sweep */}
          <div className="absolute inset-0 rounded-[30px] overflow-hidden">
            <div className="animate-sweep absolute left-0 right-0 h-8"
              style={{ background: "linear-gradient(180deg, transparent, rgba(108,60,224,.45) 50%, transparent)" }} />
          </div>
          {/* Corner brackets */}
          {[
            { top: 0, left: 0, r: "0deg" },
            { top: 0, right: 0, r: "90deg" },
            { bottom: 0, right: 0, r: "180deg" },
            { bottom: 0, left: 0, r: "270deg" },
          ].map((p, i) => (
            <div key={i} className="absolute w-7 h-7" style={{ top: p.top, left: p.left, right: (p as {right?: number}).right, bottom: (p as {bottom?: number}).bottom }}>
              <svg viewBox="0 0 28 28" fill="none" width={28} height={28} style={{ transform: `rotate(${p.r})` }}>
                <path d="M2 12V4a2 2 0 0 1 2-2h8" stroke="url(#bg)" strokeWidth="2.5" strokeLinecap="round" />
                <defs>
                  <linearGradient id="bg" x1="2" y1="2" x2="12" y2="12" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#6C3CE0" /><stop offset="1" stopColor="#FF6A45" />
                  </linearGradient>
                </defs>
              </svg>
            </div>
          ))}
        </div>

        {/* Headline */}
        <h1 className="text-[28px] font-extrabold text-white text-center mt-4 leading-tight"
          style={{ fontFamily: "var(--font-bricolage), sans-serif", letterSpacing: "-0.02em" }}>
          What is this?
        </h1>
        <p className="text-sm text-center mt-1.5 leading-relaxed" style={{ color: "#B7AECB" }}>
          A bill, a meme, a pill, a letter, an error.
          <br />Point and get a plain answer.
        </p>

        {/* Chips — decorative example labels, not buttons */}
        <div className="flex gap-2 overflow-x-auto mt-3 pb-0.5 w-full" style={{ scrollbarWidth: "none" }}>
          {chips.map(chip => (
            <span
              key={chip.label}
              className="flex-shrink-0 px-3.5 py-2 rounded-full text-sm font-medium whitespace-nowrap select-none"
              style={{
                background: "rgba(255,255,255,.07)",
                border: "1px solid rgba(255,255,255,.1)",
                color: "rgba(255,255,255,.55)",
                cursor: "default",
              }}
            >
              {chip.label}
            </span>
          ))}
        </div>
      </div>

      {/* ── Recent scans ───────────────────────────── */}
      <div className="flex-1 flex flex-col justify-center px-5 min-h-0 mt-3">
        {recent.length > 0 ? (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-bold uppercase tracking-widest" style={{ color: "rgba(255,255,255,.4)", letterSpacing: "0.1em" }}>
                Recent
              </p>
              <button onClick={() => router.push("/history")}
                className="text-xs font-semibold" style={{ color: "var(--violet-400)" }}>
                See all
              </button>
            </div>
            <div className="flex flex-col gap-2">
              {recent.map((item, i) => (
                <motion.button
                  key={item.id}
                  initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.15 + i * 0.06 }}
                  onClick={() => {
                    sessionStorage.setItem(`clearit_pending_${item.id}`, JSON.stringify({ analysis: item.result, textSnippet: item.textSnippet, usedImage: item.usedImage }));
                    router.push(`/result?id=${item.id}&from=history`);
                  }}
                  className="w-full flex items-center gap-3 px-3.5 py-3 rounded-2xl text-left transition-all active:scale-[0.98]"
                  style={{ background: "rgba(255,255,255,.07)", border: "1px solid rgba(255,255,255,.1)" }}
                >
                  <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: "rgba(255,255,255,.1)" }}>
                    {urgencyIconEl(item.urgency)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold truncate text-white">{item.plainTitle}</p>
                    <p className="text-xs mt-0.5 flex items-center gap-1.5" style={{ color: "rgba(255,255,255,.45)" }}>
                      <Clock size={10} className="inline flex-shrink-0" />
                      <span>{timeAgo(item.savedAt)}</span>
                      <span>·</span>
                      <span>{categoryLabel(item.category)}</span>
                    </p>
                  </div>
                  <div className="w-2 h-2 rounded-full flex-shrink-0"
                    style={{ background: urgencyDotColor(item.urgency) }} />
                </motion.button>
              ))}
            </div>
          </motion.div>
        ) : (
          /* Empty state — feature hints */
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}
            className="flex flex-col gap-2.5">
            {[
              { emoji: "🧾", label: "Bills & notices", hint: "Due dates, amounts, what to do" },
              { emoji: "⚠️", label: "Scam checks", hint: "Links, texts, suspicious emails" },
              { emoji: "💊", label: "Pills & forms", hint: "Medications, school forms, alerts" },
            ].map(item => (
              <button key={item.label} onClick={() => router.push("/analyze")}
                className="flex items-center gap-3 px-3.5 py-3 rounded-2xl text-left transition-all active:scale-[0.98]"
                style={{ background: "rgba(255,255,255,.06)", border: "1px solid rgba(255,255,255,.09)" }}>
                <span className="text-xl leading-none">{item.emoji}</span>
                <div>
                  <p className="text-sm font-semibold text-white">{item.label}</p>
                  <p className="text-xs mt-0.5" style={{ color: "rgba(255,255,255,.45)" }}>{item.hint}</p>
                </div>
              </button>
            ))}
          </motion.div>
        )}
      </div>

      {/* ── Capture controls ───────────────────────── */}
      {/* Gallery = opens file picker | FAB = opens camera | no third button */}
      <div className="flex items-center justify-center gap-10 pb-20 pt-3 flex-shrink-0">
        {/* Gallery — picks an existing photo or file */}
        <div className="flex flex-col items-center gap-1.5">
          <button
            onClick={() => router.push("/analyze?action=gallery")}
            className="w-[52px] h-[52px] rounded-2xl flex items-center justify-center transition-all active:scale-90"
            style={{ background: "rgba(255,255,255,.1)", border: "1px solid rgba(255,255,255,.12)" }}
          >
            <ImageIcon size={22} className="text-white" strokeWidth={2} />
          </button>
          <span className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: "rgba(255,255,255,.4)" }}>Gallery</span>
        </div>

        {/* Shutter FAB — opens camera */}
        <div className="flex flex-col items-center gap-1.5">
          <button
            onClick={() => router.push("/analyze?action=camera")}
            className="flex items-center justify-center transition-all active:scale-90"
            style={{
              width: 72, height: 72, borderRadius: "50%",
              background: "var(--brand-gradient)",
              boxShadow: "var(--brand-glow), 0 0 0 5px rgba(108,60,224,.18)",
            }}
          >
            <Camera size={28} className="text-white" strokeWidth={2.2} />
          </button>
          <span className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: "rgba(255,255,255,.5)" }}>Camera</span>
        </div>

        {/* Paste text */}
        <div className="flex flex-col items-center gap-1.5">
          <button
            onClick={() => router.push("/analyze?mode=text")}
            className="w-[52px] h-[52px] rounded-2xl flex items-center justify-center transition-all active:scale-90"
            style={{ background: "rgba(255,255,255,.1)", border: "1px solid rgba(255,255,255,.12)" }}
          >
            <ScanLine size={22} className="text-white" strokeWidth={2} />
          </button>
          <span className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: "rgba(255,255,255,.4)" }}>Paste text</span>
        </div>
      </div>

      <BottomNav dark />
    </div>
  );
}
