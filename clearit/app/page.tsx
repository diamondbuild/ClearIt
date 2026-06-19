"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  Camera, Image as ImageIcon, Type, Focus,
  ShieldAlert, Zap, CheckCircle, Info, HelpCircle, Clock,
  X, Loader2, ScanLine, FileText,
} from "lucide-react";
import { BottomNav } from "@/components/BottomNav";
import { motion, AnimatePresence } from "framer-motion";
import { getHistory } from "@/lib/storage/history";
import { HistoryItem, Urgency, ClearItAnalysis } from "@/lib/types";
import { categoryLabel, compressImage, compressImageWithThumb, writeResultToSession } from "@/lib/utils";
import { extractPdfText, renderPdfToImages } from "@/lib/pdf/pdfUtils";
import { LoadingAnalysis } from "@/components/LoadingAnalysis";
import { ThemeToggle } from "@/components/ThemeToggle";

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

function urgencyDotColor(u: Urgency) {
  if (u === "possible_scam" || u === "emergency") return "var(--u-scam-dot)";
  if (u === "high")   return "var(--u-high-dot)";
  if (u === "medium") return "var(--u-med-dot)";
  if (u === "low")    return "var(--u-low-dot)";
  return "var(--disabled)";
}
function UrgencyIcon({ u }: { u: Urgency }) {
  const p = { size: 15, strokeWidth: 2.2 };
  if (u === "possible_scam" || u === "emergency") return <ShieldAlert {...p} style={{ color: "var(--u-scam-dot)" }} />;
  if (u === "high")   return <Zap         {...p} style={{ color: "var(--u-high-dot)" }} />;
  if (u === "medium") return <Info        {...p} style={{ color: "var(--u-med-dot)" }} />;
  if (u === "low")    return <CheckCircle {...p} style={{ color: "var(--u-low-dot)" }} />;
  return <HelpCircle {...p} style={{ color: "var(--disabled)" }} />;
}
function timeAgo(d: string) {
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
  const [textMode, setTextMode] = useState(false);
  const [text, setText] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // Review step: hold chosen files + an optional description before analyzing
  const [pendingFiles, setPendingFiles] = useState<File[]>([]);
  const [pendingPreviews, setPendingPreviews] = useState<string[]>([]);
  const [describe, setDescribe] = useState("");
  const galleryInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef  = useRef<HTMLInputElement>(null);
  const textareaRef     = useRef<HTMLTextAreaElement>(null);

  const reviewMode = pendingFiles.length > 0;

  useEffect(() => {
    // Always read from localStorage for home screen recents (fast + has thumbnails)
    setRecent(getHistory().slice(0, 3));
  }, []);

  useEffect(() => {
    if (textMode) setTimeout(() => textareaRef.current?.focus(), 200);
  }, [textMode]);

  const runAnalysis = async (body: Record<string, unknown>, thumbnails: string[] = []) => {
    // caller is responsible for setIsAnalyzing(true) before calling this
    try {
      // Attach the user's optional description (from the review step) as context
      const ctx = describe.trim();
      if (ctx && !body.additionalContext) body.additionalContext = ctx;
      const bodyStr = JSON.stringify(body);
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: bodyStr,
      });
      const data = await res.json();
      if (!data.success || !data.data) throw new Error(data.error || "Couldn't analyze this.");
      const analysis: ClearItAnalysis = data.data;
      writeResultToSession(analysis.id, {
        analysis,
        textSnippet: body.text ? String(body.text).slice(0, 200) : undefined,
        usedImage: !body.text || !!(body.images),
        thumbnails,
      });
      router.push(`/result?id=${analysis.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
      setIsAnalyzing(false);
    }
  };

  // Detect a non-image document we know how to read
  const docKind = (file: File): "pdf" | "docx" | "doc" | "txt" | null => {
    const name = file.name.toLowerCase();
    const type = file.type.toLowerCase();
    if (type === "application/pdf" || name.endsWith(".pdf")) return "pdf";
    if (name.endsWith(".docx") || type.includes("wordprocessingml")) return "docx";
    if (name.endsWith(".doc") || type === "application/msword") return "doc";
    if (type === "text/plain" || /\.(txt|md|csv|rtf|log)$/.test(name)) return "txt";
    return null;
  };

  const readFileAsBase64 = (file: File): Promise<string> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        resolve(result.includes(",") ? result.split(",")[1] : result);
      };
      reader.onerror = () => reject(reader.error);
      reader.readAsDataURL(file);
    });

  const handleDocumentFile = async (file: File) => {
    const kind = docKind(file);

    if (kind === "pdf") {
      // Prefer real text; fall back to rendering pages as images for scans
      let text = "";
      try { text = await extractPdfText(file); } catch { text = ""; }
      if (text.trim().length >= 60) {
        await runAnalysis({ text: text.slice(0, 100000), fileName: file.name });
        return;
      }
      const pages = await renderPdfToImages(file, 12, 1.4);
      if (pages.length === 0) {
        throw new Error("Couldn't read this PDF. Try a clearer file or paste the text instead.");
      }
      await runAnalysis(
        {
          images: pages.map(p => p.base64),
          imageMediaTypes: pages.map(() => "image/jpeg"),
        },
        pages.slice(0, 1).map(p => `data:image/jpeg;base64,${p.base64}`),
      );
      return;
    }

    if (kind === "docx" || kind === "doc") {
      const base64 = await readFileAsBase64(file);
      await runAnalysis({ docxBase64: base64, fileType: kind, fileName: file.name });
      return;
    }

    if (kind === "txt") {
      const text = await file.text();
      if (!text.trim()) {
        throw new Error("That file looks empty. Try another file or paste the text instead.");
      }
      await runAnalysis({ text: text.slice(0, 100000), fileName: file.name });
      return;
    }

    throw new Error("That file type isn't supported yet. Try a photo, PDF, Word doc, or text file.");
  };

  // Step 1: user picks file(s) — show a review screen instead of analyzing now
  const handleFilesChosen = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const arr = Array.from(files).slice(0, 6);
    // Clean up any previews from a previous selection
    pendingPreviews.forEach(url => { if (url.startsWith("blob:")) URL.revokeObjectURL(url); });
    const previews = arr.map(f => (f.type.startsWith("image/") ? URL.createObjectURL(f) : ""));
    setPendingFiles(arr);
    setPendingPreviews(previews);
    setDescribe("");
    setError(null);
    setTextMode(false);
  };

  const cancelReview = () => {
    pendingPreviews.forEach(url => { if (url.startsWith("blob:")) URL.revokeObjectURL(url); });
    setPendingFiles([]);
    setPendingPreviews([]);
    setDescribe("");
    setError(null);
  };

  // Step 2: user confirms — now compress/extract and analyze (with description)
  const startAnalysis = async () => {
    if (pendingFiles.length === 0) return;
    setIsAnalyzing(true);
    setError(null);
    try {
      const fileArr = pendingFiles;

      // If a document (PDF / Word / text) was chosen, handle it separately
      const firstDoc = fileArr.find(f => !f.type.startsWith("image/") && docKind(f) !== null);
      if (firstDoc) {
        await handleDocumentFile(firstDoc);
        return;
      }

      const imageFiles = fileArr.filter(f => f.type.startsWith("image/"));
      if (imageFiles.length === 0) {
        throw new Error("That file type isn't supported. Try a photo, PDF, Word doc, or text file.");
      }

      // Run compression and thumbnail generation independently so a
      // thumbnail failure never blocks the analysis
      // Single-pass: compress + thumbnail in one canvas draw per file
      // This is the permanent fix — iOS Safari fails when re-loading
      // a base64 string into a new Image after the first canvas pass.
      const results = await Promise.all(
        imageFiles.map(f => compressImageWithThumb(f).catch(async () => ({
          base64: await compressImage(f),
          thumb: "",
          mediaType: "image/jpeg" as const,
        })))
      );

      const compressed = results.map(r => ({ base64: r.base64, mediaType: r.mediaType }));
      const thumbs = results.slice(0, 4).map(r => r.thumb).filter(Boolean);

      await runAnalysis({
        images: compressed.map(c => c.base64),
        imageMediaTypes: compressed.map(c => c.mediaType),
      }, thumbs);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
      setIsAnalyzing(false);
    }
  };

  const handleTextSubmit = async () => {
    if (!text.trim()) return;
    setIsAnalyzing(true);
    setError(null);
    await runAnalysis({ text: text.trim() });
  };

  if (isAnalyzing) {
    return (
      <div className="flex flex-col max-w-md mx-auto" style={{ height: "100dvh" }}>
        <LoadingAnalysis />
      </div>
    );
  }

  return (
    <div className="flex flex-col max-w-md mx-auto overflow-hidden"
      style={{ height: "100dvh", background: "var(--bg)" }}>

      {/* ── Header ─────────────────────────── */}
      <div className="flex items-center justify-between px-5 pt-4 flex-shrink-0 safe-top">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-[10px] flex items-center justify-center"
            style={{ background: "var(--brand-gradient)", boxShadow: "var(--brand-glow)" }}>
            <Focus size={16} className="text-white" strokeWidth={2.2} />
          </div>
          <span className="text-xl font-extrabold tracking-tight"
            style={{ fontFamily: "var(--font-bricolage), sans-serif", color: "var(--ink)" }}>
            LetsConfirmIt
          </span>
        </div>
        <ThemeToggle />
      </div>

      {/* ── Viewfinder / text input area ──── */}
      <div className="flex flex-col items-center px-5 pt-2 flex-shrink-0">
        <AnimatePresence mode="wait">
          {reviewMode ? (
            <motion.div key="review" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className="w-full">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-bold" style={{ color: "var(--ink)" }}>Add a description</p>
                <button onClick={cancelReview}
                  className="w-7 h-7 flex items-center justify-center rounded-full"
                  style={{ background: "var(--surface-2)" }}>
                  <X size={14} style={{ color: "var(--muted)" }} />
                </button>
              </div>

              {/* Previews of the chosen file(s) */}
              <div className="flex gap-2 overflow-x-auto pb-1 mb-3" style={{ scrollbarWidth: "none" }}>
                {pendingFiles.map((f, i) => (
                  pendingPreviews[i] ? (
                    <div key={i} className="flex-shrink-0 rounded-2xl overflow-hidden border"
                      style={{
                        width: pendingFiles.length === 1 ? "100%" : 96,
                        height: pendingFiles.length === 1 ? 160 : 96,
                        borderColor: "var(--border)",
                      }}>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={pendingPreviews[i]} alt={`Selected ${i + 1}`} className="w-full h-full object-cover" />
                    </div>
                  ) : (
                    <div key={i} className="flex-shrink-0 flex items-center gap-2 px-3.5 py-3 rounded-2xl border"
                      style={{ background: "var(--surface)", borderColor: "var(--border)" }}>
                      <FileText size={18} style={{ color: "var(--violet-600)" }} />
                      <span className="text-sm font-medium truncate" style={{ color: "var(--ink)", maxWidth: 200 }}>{f.name}</span>
                    </div>
                  )
                ))}
              </div>

              <textarea
                value={describe}
                onChange={e => setDescribe(e.target.value)}
                placeholder="Describe it or ask a question (optional). E.g. 'Found this in my mailbox — is it a real bill?'"
                className="w-full rounded-2xl p-4 text-sm resize-none border outline-none transition-all"
                rows={4}
                style={{ background: "var(--surface)", borderColor: describe ? "var(--violet-600)" : "var(--border)", color: "var(--ink)", lineHeight: "1.6", boxShadow: describe ? "0 0 0 3px rgba(108,60,224,.12)" : "none" }}
              />
              {error && (
                <p className="text-xs mt-1.5 font-medium" style={{ color: "var(--u-scam-text)" }}>{error}</p>
              )}
            </motion.div>
          ) : !textMode ? (
            <motion.div key="vf" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="flex flex-col items-center w-full">
              <div className="relative animate-scanpulse" style={{ width: 148, height: 148 }}>
                <div className="absolute inset-0 rounded-[30px] overflow-hidden"
                  style={{ background: "var(--violet-tint)", backgroundImage: "repeating-linear-gradient(45deg,rgba(108,60,224,.06) 0px,rgba(108,60,224,.06) 1px,transparent 1px,transparent 11px)" }} />
                <div className="absolute inset-0 rounded-[30px] overflow-hidden">
                  <div className="animate-sweep absolute left-0 right-0 h-8"
                    style={{ background: "linear-gradient(180deg,transparent,rgba(108,60,224,.3) 50%,transparent)" }} />
                </div>
                {[{top:0,left:0,r:"0deg"},{top:0,right:0,r:"90deg"},{bottom:0,right:0,r:"180deg"},{bottom:0,left:0,r:"270deg"}].map((p,i)=>(
                  <div key={i} className="absolute w-7 h-7" style={{top:(p as {top?:number}).top,left:(p as {left?:number}).left,right:(p as {right?:number}).right,bottom:(p as {bottom?:number}).bottom}}>
                    <svg viewBox="0 0 28 28" fill="none" width={28} height={28} style={{transform:`rotate(${p.r})`}}>
                      <path d="M2 12V4a2 2 0 0 1 2-2h8" stroke="url(#bgl)" strokeWidth="2.5" strokeLinecap="round"/>
                      <defs><linearGradient id="bgl" x1="2" y1="2" x2="12" y2="12" gradientUnits="userSpaceOnUse"><stop stopColor="#6C3CE0"/><stop offset="1" stopColor="#FF6A45"/></linearGradient></defs>
                    </svg>
                  </div>
                ))}
              </div>
              <h1 className="text-[26px] font-extrabold text-center mt-3 leading-tight"
                style={{ fontFamily: "var(--font-bricolage), sans-serif", color: "var(--ink)", letterSpacing: "-0.02em" }}>
                What is this?
              </h1>
              <p className="text-sm text-center mt-1 leading-snug" style={{ color: "var(--muted)" }}>
                A bill, a meme, a pill, a letter, an error. Point and get a plain answer.
              </p>
            </motion.div>
          ) : (
            <motion.div key="text" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className="w-full">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-bold" style={{ color: "var(--ink)" }}>Paste your text</p>
                <button onClick={() => { setTextMode(false); setText(""); setError(null); }}
                  className="w-7 h-7 flex items-center justify-center rounded-full"
                  style={{ background: "var(--surface-2)" }}>
                  <X size={14} style={{ color: "var(--muted)" }} />
                </button>
              </div>
              <textarea
                ref={textareaRef}
                value={text}
                onChange={e => setText(e.target.value)}
                placeholder="Paste a message, email, bill, or any confusing text here…"
                className="w-full rounded-2xl p-4 text-sm resize-none border outline-none transition-all"
                rows={6}
                style={{ background: "var(--surface)", borderColor: text ? "var(--violet-600)" : "var(--border)", color: "var(--ink)", lineHeight: "1.6", boxShadow: text ? "0 0 0 3px rgba(108,60,224,.12)" : "none" }}
              />
              {error && (
                <p className="text-xs mt-1.5 font-medium" style={{ color: "var(--u-scam-text)" }}>{error}</p>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── Scrollable middle ───────────────── */}
      <div className="flex-1 flex flex-col min-h-0 px-5 mt-3 overflow-y-auto pb-2" style={{ scrollbarWidth: "none" }}>
        {recent.length > 0 && !textMode && !reviewMode && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-bold uppercase tracking-widest" style={{ color: "var(--muted)", letterSpacing: "0.1em" }}>Recent</p>
              <button onClick={() => router.push("/history")} className="text-xs font-semibold" style={{ color: "var(--violet-600)" }}>See all</button>
            </div>
            <div className="flex flex-col gap-2 mb-4">
              {recent.map((item, i) => (
                <motion.button key={item.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
                  onClick={() => {
                    writeResultToSession(item.id, { analysis: item.result, textSnippet: item.textSnippet, usedImage: item.usedImage, thumbnails: item.thumbnails ?? [] });
                    router.push(`/result?id=${item.id}&from=history`);
                  }}
                  className="w-full flex items-center gap-3 px-3.5 py-3 rounded-2xl text-left transition-all active:scale-[0.98]"
                  style={{ background: "var(--surface)", border: "1px solid var(--border)", boxShadow: "var(--shadow-sm)" }}>
                  {item.thumbnails?.[0] ? (
                    <div className="w-9 h-9 rounded-xl overflow-hidden flex-shrink-0 border" style={{ borderColor: "var(--border)" }}>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={item.thumbnails[0]} alt="" className="w-full h-full object-cover" />
                    </div>
                  ) : (
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: "var(--violet-tint)" }}>
                      <UrgencyIcon u={item.urgency} />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold truncate" style={{ color: "var(--ink)" }}>{item.plainTitle}</p>
                    <p className="text-xs mt-0.5 flex items-center gap-1.5" style={{ color: "var(--muted)" }}>
                      <Clock size={10} /><span>{timeAgo(item.savedAt)}</span><span>·</span><span>{categoryLabel(item.category)}</span>
                    </p>
                  </div>
                  <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: urgencyDotColor(item.urgency) }} />
                </motion.button>
              ))}
            </div>
            <p className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: "var(--muted)", letterSpacing: "0.1em" }}>What I can explain</p>
          </motion.div>
        )}

        {!textMode && !reviewMode && (
          <div className="flex flex-col gap-2">
            {(recent.length === 0) && <p className="text-xs font-bold uppercase tracking-widest mb-1" style={{ color: "var(--muted)", letterSpacing: "0.1em" }}>What I can explain</p>}
            {examples.map(item => (
              <div key={item.label} className="flex items-center gap-3 px-3.5 py-2.5 rounded-2xl"
                style={{ background: "var(--surface)", border: "1px solid var(--border)", cursor: "default" }}>
                <span className="text-lg leading-none flex-shrink-0">{item.emoji}</span>
                <div>
                  <p className="text-sm font-semibold" style={{ color: "var(--ink)" }}>{item.label}</p>
                  <p className="text-xs mt-0.5" style={{ color: "var(--muted)" }}>{item.hint}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Capture / action controls ───────── */}
      <div className="flex items-center justify-center gap-10 pb-20 pt-2 flex-shrink-0"
        style={{ borderTop: "1px solid var(--border)", background: "var(--surface)" }}>

        {reviewMode ? (
          <div className="flex items-center gap-3 w-full px-4 pt-3">
            <button
              onClick={cancelReview}
              className="px-5 py-3.5 rounded-2xl text-base font-bold transition-all active:scale-[0.98]"
              style={{ background: "var(--surface-2)", color: "var(--ink)", border: "1px solid var(--border)" }}>
              Cancel
            </button>
            <button
              onClick={startAnalysis}
              className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-2xl text-base font-bold text-white transition-all active:scale-[0.98]"
              style={{ background: "var(--brand-gradient)", boxShadow: "var(--brand-glow)" }}>
              {isAnalyzing ? <Loader2 size={18} className="animate-spin" /> : <ScanLine size={18} strokeWidth={2.2} />}
              Explain it
            </button>
          </div>
        ) : !textMode ? (
          <>
            <div className="flex flex-col items-center gap-1.5 pt-3">
              <button onClick={() => galleryInputRef.current?.click()}
                className="w-[52px] h-[52px] rounded-2xl flex items-center justify-center transition-all active:scale-90"
                style={{ background: "var(--surface-2)", border: "1px solid var(--border)" }}>
                <ImageIcon size={22} style={{ color: "var(--ink)" }} strokeWidth={2} />
              </button>
              <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: "var(--muted)" }}>Upload</span>
            </div>
            <div className="flex flex-col items-center gap-1.5 pt-3">
              <button onClick={() => cameraInputRef.current?.click()}
                className="flex items-center justify-center transition-all active:scale-90"
                style={{ width: 72, height: 72, borderRadius: "50%", background: "var(--brand-gradient)", boxShadow: "var(--brand-glow)" }}>
                <Camera size={28} className="text-white" strokeWidth={2.2} />
              </button>
              <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: "var(--muted)" }}>Camera</span>
            </div>
            <div className="flex flex-col items-center gap-1.5 pt-3">
              <button onClick={() => setTextMode(true)}
                className="w-[52px] h-[52px] rounded-2xl flex items-center justify-center transition-all active:scale-90"
                style={{ background: "var(--surface-2)", border: "1px solid var(--border)" }}>
                <Type size={22} style={{ color: "var(--ink)" }} strokeWidth={2} />
              </button>
              <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: "var(--muted)" }}>Paste text</span>
            </div>
          </>
        ) : (
          <div className="flex items-center gap-3 w-full px-4 pt-3">
            <button
              onClick={handleTextSubmit}
              disabled={!text.trim()}
              className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-2xl text-base font-bold text-white transition-all active:scale-[0.98] disabled:opacity-40"
              style={{ background: text.trim() ? "var(--brand-gradient)" : "var(--surface-2)", boxShadow: text.trim() ? "var(--brand-glow)" : "none", color: text.trim() ? "white" : "var(--muted)" }}>
              {isAnalyzing ? <Loader2 size={18} className="animate-spin" /> : <ScanLine size={18} strokeWidth={2.2} />}
              Explain it
            </button>
          </div>
        )}
      </div>

      {/* Hidden file inputs */}
      {/* No `accept` filter on purpose: some mobile pickers gray out PDFs and
          documents when the list is restrictive. We accept any file and
          validate the type in startAnalysis instead. */}
      <input ref={galleryInputRef} type="file"
        multiple className="hidden"
        onChange={e => { handleFilesChosen(e.target.files); e.target.value = ""; }} />
      <input ref={cameraInputRef} type="file" accept="image/*" capture="environment" className="hidden"
        onChange={e => { handleFilesChosen(e.target.files); e.target.value = ""; }} />

      <BottomNav />
    </div>
  );
}
