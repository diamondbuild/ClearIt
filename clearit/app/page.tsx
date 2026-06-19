"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  Camera, Image as ImageIcon, Type, Focus,
  ShieldAlert, Zap, CheckCircle, Info, HelpCircle, Clock,
} from "lucide-react";
import { BottomNav } from "@/components/BottomNav";
import { motion } from "framer-motion";
import { getHistory } from "@/lib/storage/history";
import { HistoryItem, Urgency } from "@/lib/types";
import { categoryLabel, compressImage } from "@/lib/utils";

const chips = [
  { label: "Is this a scam?",    hint: "Is this a scam? Please check for scam signals and advise me." },
  { label: "Explain this bill",  hint: "Please explain this bill — what do I owe, when is it due, and what do I do?" },
  { label: "What is this pill?", hint: "What is this medication? What is it used for, and what should I know?" },
  { label: "Who is this?",       hint: "Who or what is this? Please identify and explain." },
];

const examples = [
  { emoji: "🧾", label: "Bills & notices",      hint: "Due dates, amounts, what to do" },
  { emoji: "⚠️", label: "Scam checks",           hint: "Suspicious texts, emails, links" },
  { emoji: "💊", label: "Pills & medications",   hint: "What is it, dosage, side effects" },
  { emoji: "🐦", label: "Animals & nature",      hint: "Snap a bird, bug, plant, or mushroom" },
  { emoji: "😂", label: "Memes & images",        hint: "What is this meme or viral photo?" },
  { emoji: "🧑‍⚖️", label: "Legal & gov notices", hint: "Court letters, IRS, eviction, tickets" },
  { emoji: "📱", label: "App errors",            hint: "What does this error mean and how to fix" },
  { emoji: "🏛️", label: "Places & landmarks",   hint: "Where is this? What's its history?" },
];

function urgencyDotColor(urgency: Urgency): string {
  if (urgency === "possible_scam" || urgency === "emergency") return "var(--u-scam-dot)";
  if (urgency === "high") return "var(--u-high-dot)";
  if (urgency === "medium") return "var(--u-med-dot)";
  if (urgency === "low") return "var(--u-low-dot)";
  return "var(--disabled)";
}

function UrgencyIcon({ urgency }: { urgency: Urgency }) {
  const size = 15; const sw = 2.2;
  if (urgency === "possible_scam" || urgency === "emergency")
    return <ShieldAlert size={size} strokeWidth={sw} style={{ color: "var(--u-scam-dot)" }} />;
  if (urgency === "high")   return <Zap         size={size} strokeWidth={sw} style={{ color: "var(--u-high-dot)" }} />;
  if (urgency === "medium") return <Info        size={size} strokeWidth={sw} style={{ color: "var(--u-med-dot)" }} />;
  if (urgency === "low")    return <CheckCircle size={size} strokeWidth={sw} style={{ color: "var(--u-low-dot)" }} />;
  return <HelpCircle size={size} strokeWidth={sw} style={{ color: "var(--disabled)" }} />;
}

function timeAgo(d: string): string {
  const diff = Date.now() - new Date(d).getTime();
  const m = Math.floor(diff / 60000), h = Math.floor(m / 60), days = Math.floor(h / 24);
  if (m < 2) return "Just now";
  if (m < 60) return `${m}m ago`;
  if (h < 24) return `${h}h ago`;
  if (days === 1) return "Yesterday";
  return new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export default function HomePage() {
  const router = useRouter();
  const [recent, setRecent] = useState<HistoryItem[]>([]);
  const galleryInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef  = useRef<HTMLInputElement>(null);

  useEffect(() => { setRecent(getHistory().slice(0, 3)); }, []);

  const handleHomeFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    try {
      const compressed = await Promise.all(
        Array.from(files).slice(0, 6).map(async (file) => ({
          base64: await compressImage(file),
          mediaType: file.type === "image/png" ? "image/png" : "image/jpeg",
        }))
      );
      sessionStorage.setItem("clearit_home_images", JSON.stringify(compressed));
      router.push("/analyze?restore=images");
    } catch { router.push("/analyze"); }
  };

  return (
    <div
      className="flex flex-col max-w-md mx-auto overflow-hidden"
      style={{ height: "100dvh", background: "var(--bg)" }}
    >
      {/* ── Header ─────────────────────────── */}
      <div className="flex items-center px-5 pt-4 flex-shrink-0 safe-top">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-[10px] flex items-center justify-center"
            style={{ background: "var(--brand-gradient)", boxShadow: "var(--brand-glow)" }}>
            <Focus size={16} className="text-white" strokeWidth={2.2} />
          </div>
          <span className="text-xl font-extrabold tracking-tight"
            style={{ fontFamily: "var(--font-bricolage), sans-serif", color: "var(--ink)" }}>
            ClearIt
          </span>
        </div>
      </div>

      {/* ── Viewfinder ─────────────────────── */}
      <div className="flex flex-col items-center px-5 pt-2 flex-shrink-0">
        <div className="relative animate-scanpulse" style={{ width: 148, height: 148 }}>
          {/* Tinted fill */}
          <div className="absolute inset-0 rounded-[30px] overflow-hidden"
            style={{
              background: "var(--violet-tint)",
              backgroundImage: "repeating-linear-gradient(45deg, rgba(108,60,224,.06) 0px, rgba(108,60,224,.06) 1px, transparent 1px, transparent 11px)",
            }} />
          {/* Sweep */}
          <div className="absolute inset-0 rounded-[30px] overflow-hidden">
            <div className="animate-sweep absolute left-0 right-0 h-8"
              style={{ background: "linear-gradient(180deg, transparent, rgba(108,60,224,.3) 50%, transparent)" }} />
          </div>
          {/* Corner brackets */}
          {[
            { top: 0, left: 0, r: "0deg" },
            { top: 0, right: 0, r: "90deg" },
            { bottom: 0, right: 0, r: "180deg" },
            { bottom: 0, left: 0, r: "270deg" },
          ].map((p, i) => (
            <div key={i} className="absolute w-7 h-7"
              style={{ top: (p as {top?: number}).top, left: (p as {left?: number}).left, right: (p as {right?: number}).right, bottom: (p as {bottom?: number}).bottom }}>
              <svg viewBox="0 0 28 28" fill="none" width={28} height={28} style={{ transform: `rotate(${p.r})` }}>
                <path d="M2 12V4a2 2 0 0 1 2-2h8" stroke="url(#bg-l)" strokeWidth="2.5" strokeLinecap="round" />
                <defs>
                  <linearGradient id="bg-l" x1="2" y1="2" x2="12" y2="12" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#6C3CE0" /><stop offset="1" stopColor="#FF6A45" />
                  </linearGradient>
                </defs>
              </svg>
            </div>
          ))}
        </div>

        {/* Headline */}
        <h1 className="text-[26px] font-extrabold text-center mt-3 leading-tight"
          style={{ fontFamily: "var(--font-bricolage), sans-serif", color: "var(--ink)", letterSpacing: "-0.02em" }}>
          What is this?
        </h1>
        <p className="text-sm text-center mt-1 leading-snug" style={{ color: "var(--muted)" }}>
          A bill, a meme, a pill, a letter, an error.
          Point and get a plain answer.
        </p>

        {/* Chips — decorative labels */}
        <div className="flex gap-2 overflow-x-auto mt-2.5 pb-0.5 w-full" style={{ scrollbarWidth: "none" }}>
          {chips.map(c => (
            <span key={c.label}
              className="flex-shrink-0 px-3.5 py-2 rounded-full text-sm font-medium whitespace-nowrap select-none"
              style={{ background: "var(--violet-tint)", color: "var(--violet-700)", cursor: "default", border: "1px solid var(--violet-200)" }}>
              {c.label}
            </span>
          ))}
        </div>
      </div>

      {/* ── Scrollable middle ───────────────── */}
      <div className="flex-1 flex flex-col min-h-0 px-5 mt-3 overflow-y-auto pb-2" style={{ scrollbarWidth: "none" }}>
        {recent.length > 0 ? (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-bold uppercase tracking-widest"
                style={{ color: "var(--muted)", letterSpacing: "0.1em" }}>Recent</p>
              <button onClick={() => router.push("/history")}
                className="text-xs font-semibold" style={{ color: "var(--violet-600)" }}>
                See all
              </button>
            </div>
            <div className="flex flex-col gap-2 mb-4">
              {recent.map((item, i) => (
                <motion.button key={item.id}
                  initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.15 + i * 0.06 }}
                  onClick={() => {
                    sessionStorage.setItem(`clearit_pending_${item.id}`, JSON.stringify({ analysis: item.result, textSnippet: item.textSnippet, usedImage: item.usedImage }));
                    router.push(`/result?id=${item.id}&from=history`);
                  }}
                  className="w-full flex items-center gap-3 px-3.5 py-3 rounded-2xl text-left transition-all active:scale-[0.98]"
                  style={{ background: "var(--surface)", border: "1px solid var(--border)", boxShadow: "var(--shadow-sm)" }}>
                  <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: "var(--violet-tint)" }}>
                    <UrgencyIcon urgency={item.urgency} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold truncate" style={{ color: "var(--ink)" }}>{item.plainTitle}</p>
                    <p className="text-xs mt-0.5 flex items-center gap-1.5" style={{ color: "var(--muted)" }}>
                      <Clock size={10} className="inline flex-shrink-0" />
                      <span>{timeAgo(item.savedAt)}</span>
                      <span>·</span>
                      <span>{categoryLabel(item.category)}</span>
                    </p>
                  </div>
                  <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: urgencyDotColor(item.urgency) }} />
                </motion.button>
              ))}
            </div>
            <p className="text-xs font-bold uppercase tracking-widest mb-2"
              style={{ color: "var(--muted)", letterSpacing: "0.1em" }}>What I can explain</p>
          </motion.div>
        ) : (
          <div className="mb-2">
            <p className="text-xs font-bold uppercase tracking-widest mb-2"
              style={{ color: "var(--muted)", letterSpacing: "0.1em" }}>What I can explain</p>
          </div>
        )}

        {/* Example cards */}
        <div className="flex flex-col gap-2">
          {examples.map(item => (
            <div key={item.label}
              className="flex items-center gap-3 px-3.5 py-2.5 rounded-2xl"
              style={{ background: "var(--surface)", border: "1px solid var(--border)", cursor: "default" }}>
              <span className="text-lg leading-none flex-shrink-0">{item.emoji}</span>
              <div>
                <p className="text-sm font-semibold" style={{ color: "var(--ink)" }}>{item.label}</p>
                <p className="text-xs mt-0.5" style={{ color: "var(--muted)" }}>{item.hint}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Capture controls ───────────────── */}
      <div className="flex items-center justify-center gap-10 pb-20 pt-2 flex-shrink-0"
        style={{ borderTop: "1px solid var(--border)", background: "var(--surface)" }}>

        <div className="flex flex-col items-center gap-1.5 pt-3">
          <button onClick={() => galleryInputRef.current?.click()}
            className="w-[52px] h-[52px] rounded-2xl flex items-center justify-center transition-all active:scale-90"
            style={{ background: "var(--surface-2)", border: "1px solid var(--border)" }}>
            <ImageIcon size={22} style={{ color: "var(--ink)" }} strokeWidth={2} />
          </button>
          <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: "var(--muted)", letterSpacing: "0.08em" }}>Gallery</span>
        </div>

        <div className="flex flex-col items-center gap-1.5 pt-3">
          <button onClick={() => cameraInputRef.current?.click()}
            className="flex items-center justify-center transition-all active:scale-90"
            style={{ width: 72, height: 72, borderRadius: "50%", background: "var(--brand-gradient)", boxShadow: "var(--brand-glow)" }}>
            <Camera size={28} className="text-white" strokeWidth={2.2} />
          </button>
          <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: "var(--muted)", letterSpacing: "0.08em" }}>Camera</span>
        </div>

        <div className="flex flex-col items-center gap-1.5 pt-3">
          <button onClick={() => router.push("/analyze?mode=text")}
            className="w-[52px] h-[52px] rounded-2xl flex items-center justify-center transition-all active:scale-90"
            style={{ background: "var(--surface-2)", border: "1px solid var(--border)" }}>
            <Type size={22} style={{ color: "var(--ink)" }} strokeWidth={2} />
          </button>
          <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: "var(--muted)", letterSpacing: "0.08em" }}>Paste text</span>
        </div>
      </div>

      {/* Hidden file inputs */}
      <input ref={galleryInputRef} type="file" accept="image/*" multiple className="hidden"
        onChange={(e) => handleHomeFiles(e.target.files)} />
      <input ref={cameraInputRef} type="file" accept="image/*" capture="environment" className="hidden"
        onChange={(e) => handleHomeFiles(e.target.files)} />

      <BottomNav />
    </div>
  );
}
