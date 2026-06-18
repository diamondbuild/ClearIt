"use client";

import { useState, useRef, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Camera, Image as ImageIcon, X, AlertCircle, Loader2, Lock, Plus, FileText } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { LoadingAnalysis } from "@/components/LoadingAnalysis";
import { compressImage, cn } from "@/lib/utils";
import { ClearItAnalysis } from "@/lib/types";

const MAX_IMAGES = 6;

interface SelectedImage { file: File; preview: string; id: string; }
interface SelectedFile { file: File; type: "pdf" | "docx" | "doc"; name: string; size: number; }

function formatFileSize(b: number) {
  if (b < 1024 * 1024) return `${(b / 1024).toFixed(0)} KB`;
  return `${(b / (1024 * 1024)).toFixed(1)} MB`;
}

function fileTypeFromFile(file: File): "pdf" | "docx" | "doc" | null {
  if (file.type === "application/pdf" || file.name.endsWith(".pdf")) return "pdf";
  if (file.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" || file.name.endsWith(".docx")) return "docx";
  if (file.type === "application/msword" || file.name.endsWith(".doc")) return "doc";
  return null;
}

function AnalyzePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialMode = searchParams.get("mode") === "text" ? "text" : "upload";
  const action = searchParams.get("action"); // "camera" | "gallery"
  const hint = searchParams.get("hint");     // pre-fill text

  const [mode, setMode] = useState<"upload" | "text">(initialMode as "upload" | "text");
  const [images, setImages] = useState<SelectedImage[]>([]);
  const [docFile, setDocFile] = useState<SelectedFile | null>(null);
  const [text, setText] = useState(hint ? decodeURIComponent(hint) : "");
  const [additionalContext, setAdditionalContext] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [processingFile, setProcessingFile] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const imageInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Auto-trigger camera or gallery if coming from home screen FAB/gallery button
  useEffect(() => {
    if (action === "camera") {
      setTimeout(() => cameraInputRef.current?.click(), 300);
    } else if (action === "gallery") {
      setTimeout(() => imageInputRef.current?.click(), 300);
    }
  }, [action]);

  const hasInput = images.length > 0 || !!docFile || text.trim().length > 10;

  const handleImageFiles = async (files: FileList | File[]) => {
    setError(null);
    const arr = Array.from(files);
    const remaining = MAX_IMAGES - images.length;
    const toAdd = arr.slice(0, remaining);
    const newImgs: SelectedImage[] = [];
    for (const file of toAdd) {
      if (file.size > 20 * 1024 * 1024) { setError("Image too large (max 20MB)."); continue; }
      newImgs.push({ file, preview: URL.createObjectURL(file), id: `${Date.now()}-${Math.random()}` });
    }
    setImages(prev => [...prev, ...newImgs]);
  };

  const handleDocFile = (file: File) => {
    const type = fileTypeFromFile(file);
    if (!type) { setError("Please upload a PDF, DOCX, or DOC file."); return; }
    setDocFile({ file, type, name: file.name, size: file.size });
    setError(null);
  };

  const handleAnalyze = async () => {
    if (!hasInput) return;
    setIsAnalyzing(true);
    setError(null);
    try {
      let body: Record<string, unknown> = {};
      if (images.length > 0) {
        setProcessingFile(true);
        const compressed = await Promise.all(images.map(async img => ({
          base64: await compressImage(img.file),
          mediaType: img.file.type === "image/png" ? "image/png" : "image/jpeg",
        })));
        setProcessingFile(false);
        body = {
          images: compressed.map(c => c.base64),
          imageMediaTypes: compressed.map(c => c.mediaType),
          additionalContext: additionalContext.trim() || undefined,
        };
      } else if (docFile) {
        setProcessingFile(true);
        if (docFile.type === "pdf") {
          const { renderPdfToImages, extractPdfText } = await import("@/lib/pdf/pdfUtils");
          const [pageImages, extractedText] = await Promise.all([
            renderPdfToImages(docFile.file, 4),
            extractPdfText(docFile.file).catch(() => ""),
          ]);
          setProcessingFile(false);
          body = {
            images: pageImages.map(p => p.base64),
            imageMediaTypes: pageImages.map(() => "image/jpeg"),
            text: extractedText || undefined,
            additionalContext: additionalContext.trim() || undefined,
            fileName: docFile.name,
          };
        } else {
          const ab = await docFile.file.arrayBuffer();
          const b64 = btoa(String.fromCharCode(...new Uint8Array(ab)));
          setProcessingFile(false);
          body = { docxBase64: b64, fileType: docFile.type, fileName: docFile.name, additionalContext: additionalContext.trim() || undefined };
        }
      } else {
        body = { text: text.trim(), additionalContext: additionalContext.trim() || undefined };
      }

      const bodyString = JSON.stringify(body);
      if (bodyString.length > 4 * 1024 * 1024) throw new Error("File is too large to send. Try fewer or smaller images.");

      const res = await fetch("/api/analyze", { method: "POST", headers: { "Content-Type": "application/json" }, body: bodyString });
      const data = await res.json();
      if (!data.success || !data.data) throw new Error(data.error || "Couldn't analyze this.");
      const analysis: ClearItAnalysis = data.data;
      sessionStorage.setItem(`clearit_pending_${analysis.id}`, JSON.stringify({
        analysis,
        textSnippet: mode === "text" ? text.slice(0, 200) : docFile ? `File: ${docFile.name}` : `${images.length} image${images.length > 1 ? "s" : ""}`,
        usedImage: images.length > 0 || (!!docFile && docFile.type === "pdf"),
      }));
      router.push(`/result?id=${analysis.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
      setIsAnalyzing(false);
      setProcessingFile(false);
    }
  };

  if (isAnalyzing) {
    return (
      <div className="flex flex-col min-h-screen max-w-md mx-auto" style={{ background: "#141019" }}>
        <LoadingAnalysis />
      </div>
    );
  }

  return (
    <AppShell title="Explain something" backHref="/">
      <div className="px-5 pt-4 pb-8 flex flex-col gap-5">
        {/* Headline */}
        <h1
          className="text-2xl font-extrabold tracking-tight"
          style={{ fontFamily: "var(--font-bricolage), sans-serif", color: "var(--ink)", letterSpacing: "-0.015em" }}
        >
          Show me what&apos;s confusing.
        </h1>

        {/* Upload dropzone */}
        <AnimatePresence mode="wait">
          {mode === "upload" && (
            <motion.div key="upload" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              {/* Image thumbnails */}
              {images.length > 0 && (
                <div className="grid grid-cols-3 gap-2 mb-3">
                  {images.map(img => (
                    <div key={img.id} className="relative aspect-square rounded-2xl overflow-hidden border" style={{ borderColor: "var(--border)" }}>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={img.preview} alt="" className="w-full h-full object-cover" />
                      <button onClick={() => setImages(prev => prev.filter(i => i.id !== img.id))}
                        className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-black/60 text-white flex items-center justify-center">
                        <X size={12} />
                      </button>
                    </div>
                  ))}
                  {images.length < MAX_IMAGES && (
                    <button onClick={() => imageInputRef.current?.click()}
                      className="aspect-square rounded-2xl border-2 border-dashed flex flex-col items-center justify-center gap-1 transition-all active:scale-95"
                      style={{ borderColor: "var(--violet-200)", color: "var(--violet-600)", background: "var(--violet-tint)" }}>
                      <Plus size={20} strokeWidth={2.2} />
                      <span className="text-xs font-semibold">Add</span>
                    </button>
                  )}
                </div>
              )}

              {/* Doc file selected */}
              {docFile && (
                <div className="rounded-2xl p-4 border flex items-center gap-3 mb-3"
                  style={{ background: "var(--surface)", borderColor: "var(--border)" }}>
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: "var(--violet-tint)" }}>
                    <FileText size={22} style={{ color: "var(--violet-600)" }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold truncate" style={{ color: "var(--ink)" }}>{docFile.name}</p>
                    <p className="text-xs mt-0.5" style={{ color: "var(--muted)" }}>{docFile.type.toUpperCase()} · {formatFileSize(docFile.size)}</p>
                  </div>
                  <button onClick={() => setDocFile(null)} className="w-8 h-8 flex items-center justify-center rounded-lg" style={{ color: "var(--muted)" }}>
                    <X size={16} />
                  </button>
                </div>
              )}

              {/* Dropzone (no content yet) */}
              {images.length === 0 && !docFile && (
                <div
                  className="rounded-2xl p-7 flex flex-col items-center gap-4 border-2 border-dashed mb-3"
                  style={{
                    background: "linear-gradient(135deg, #F3EDFD, #FFF1EC)",
                    borderColor: "var(--violet-200)",
                  }}
                >
                  <div
                    className="w-14 h-14 rounded-2xl flex items-center justify-center"
                    style={{ background: "var(--brand-gradient)", boxShadow: "var(--brand-glow)" }}
                  >
                    <Camera size={24} className="text-white" strokeWidth={2.2} />
                  </div>
                  <div className="text-center">
                    <p className="font-semibold text-sm" style={{ color: "var(--ink)" }}>
                      Take a <span style={{ color: "var(--coral-500)" }}>photo</span>
                    </p>
                    <p className="text-xs mt-0.5" style={{ color: "var(--muted)" }}>or drop a screenshot here</p>
                  </div>
                  <div className="flex gap-2 w-full">
                    <button onClick={() => cameraInputRef.current?.click()}
                      className="flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl text-sm font-semibold text-white transition-all active:scale-95"
                      style={{ background: "var(--ink)" }}>
                      <Camera size={16} strokeWidth={2.2} /> Camera
                    </button>
                    <button onClick={() => imageInputRef.current?.click()}
                      className="flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl text-sm font-semibold transition-all active:scale-95 border"
                      style={{ background: "var(--surface)", borderColor: "var(--border)", color: "var(--ink)" }}>
                      <ImageIcon size={16} strokeWidth={2} /> Gallery
                    </button>
                  </div>
                  <button onClick={() => fileInputRef.current?.click()}
                    className="w-full py-2.5 rounded-xl text-xs font-semibold border transition-all active:scale-95"
                    style={{ borderColor: "var(--violet-200)", color: "var(--violet-700)", background: "transparent" }}>
                    Or upload PDF / DOCX
                  </button>
                </div>
              )}

              {(images.length > 0 || docFile) && (
                <div className="flex gap-2 mb-1">
                  <button onClick={() => imageInputRef.current?.click()}
                    className="flex-1 py-3 rounded-xl text-sm font-semibold border transition-all active:scale-95"
                    style={{ background: "var(--surface)", borderColor: "var(--border)", color: "var(--ink)" }}>
                    + Add more photos
                  </button>
                  <button onClick={() => cameraInputRef.current?.click()}
                    className="flex-1 py-3 rounded-xl text-sm font-semibold text-white transition-all active:scale-95"
                    style={{ background: "var(--ink)" }}>
                    <Camera size={14} className="inline mr-1" /> Camera
                  </button>
                </div>
              )}
            </motion.div>
          )}

          {mode === "text" && (
            <motion.div key="text" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <textarea
                value={text}
                onChange={e => setText(e.target.value)}
                placeholder="Paste a message, email, or bill text…"
                className="w-full rounded-2xl p-4 text-sm resize-none min-h-[180px] border outline-none transition-all"
                style={{ background: "var(--surface)", borderColor: "var(--border)", color: "var(--ink)", lineHeight: "1.6" }}
                onFocus={e => { e.target.style.borderColor = "var(--violet-600)"; e.target.style.boxShadow = "0 0 0 3px rgba(108,60,224,.12)"; }}
                onBlur={e => { e.target.style.borderColor = "var(--border)"; e.target.style.boxShadow = ""; }}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Mode toggle */}
        <div className="flex rounded-2xl p-1 gap-1" style={{ background: "var(--surface-2)" }}>
          <button onClick={() => setMode("upload")}
            className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-sm font-semibold transition-all"
            style={mode === "upload" ? { background: "var(--surface)", color: "var(--violet-600)", boxShadow: "var(--shadow-sm)" } : { color: "var(--muted)" }}>
            <Camera size={15} strokeWidth={2} /> Photo / File
          </button>
          <button onClick={() => setMode("text")}
            className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-sm font-semibold transition-all"
            style={mode === "text" ? { background: "var(--surface)", color: "var(--violet-600)", boxShadow: "var(--shadow-sm)" } : { color: "var(--muted)" }}>
            <span className="text-base leading-none">T</span> Paste text
          </button>
        </div>

        {/* Additional context */}
        <AnimatePresence>
          {hasInput && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}>
              <label className="block text-xs font-bold uppercase tracking-widest mb-2" style={{ color: "var(--muted)", letterSpacing: "0.1em" }}>
                Additional details <span className="font-normal normal-case tracking-normal opacity-70">(optional)</span>
              </label>
              <textarea
                value={additionalContext}
                onChange={e => setAdditionalContext(e.target.value)}
                placeholder={`Add context — e.g. "I've never heard of this company" or "I already paid last week"…`}
                className="w-full rounded-2xl p-4 text-sm resize-none min-h-[90px] border outline-none transition-all"
                style={{ background: "var(--surface)", borderColor: "var(--border)", color: "var(--ink)", lineHeight: "1.6" }}
                onFocus={e => { e.target.style.borderColor = "var(--violet-600)"; e.target.style.boxShadow = "0 0 0 3px rgba(108,60,224,.12)"; }}
                onBlur={e => { e.target.style.borderColor = "var(--border)"; e.target.style.boxShadow = ""; }}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Error */}
        <AnimatePresence>
          {error && (
            <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className="flex items-start gap-3 p-4 rounded-xl"
              style={{ background: "var(--u-scam-bg)", border: "1px solid var(--u-scam-dot)" }}>
              <AlertCircle size={16} style={{ color: "var(--u-scam-text)" }} className="flex-shrink-0 mt-0.5" />
              <p className="text-sm font-medium" style={{ color: "var(--u-scam-text)" }}>{error}</p>
            </motion.div>
          )}
        </AnimatePresence>

        {processingFile && (
          <div className="flex items-center justify-center gap-2 py-1" style={{ color: "var(--muted)" }}>
            <Loader2 size={15} className="animate-spin" />
            <span className="text-sm">Processing…</span>
          </div>
        )}

        {/* CTA */}
        <button
          onClick={handleAnalyze}
          disabled={!hasInput || processingFile}
          className="w-full flex items-center justify-center gap-2.5 py-4 rounded-2xl text-base font-bold text-white transition-all active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed"
          style={{
            background: hasInput && !processingFile ? "var(--brand-gradient)" : "var(--surface-2)",
            color: hasInput && !processingFile ? "white" : "var(--muted)",
            boxShadow: hasInput && !processingFile ? "var(--brand-glow)" : "none",
            fontFamily: "var(--font-hanken), sans-serif",
          }}
        >
          Explain it
        </button>

        {/* Privacy */}
        <div className="flex items-center justify-center gap-1.5">
          <Lock size={12} style={{ color: "var(--muted)" }} />
          <p className="text-xs" style={{ color: "var(--muted)" }}>
            Private — your photo never leaves your device.
          </p>
        </div>
      </div>

      {/* Hidden inputs */}
      <input ref={imageInputRef} type="file" accept="image/*" multiple className="hidden"
        onChange={e => { if (e.target.files) handleImageFiles(e.target.files); e.target.value = ""; }} />
      <input ref={cameraInputRef} type="file" accept="image/*" capture="environment" className="hidden"
        onChange={e => { if (e.target.files) handleImageFiles(e.target.files); e.target.value = ""; }} />
      <input ref={fileInputRef} type="file" accept=".pdf,.docx,.doc,application/pdf" className="hidden"
        onChange={e => { const f = e.target.files?.[0]; if (f) handleDocFile(f); e.target.value = ""; }} />
    </AppShell>
  );
}

export default function AnalyzePageWrapper() {
  return <Suspense><AnalyzePage /></Suspense>;
}
