"use client";

import { useState, useRef, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Upload,
  Camera,
  X,
  Image as ImageIcon,
  AlertCircle,
  Type,
  ScanLine,
  FileText,
  FilePlus,
  Plus,
  Loader2,
  MessageSquarePlus,
} from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { LoadingAnalysis } from "@/components/LoadingAnalysis";
import { compressImage, cn } from "@/lib/utils";
import { ClearItAnalysis } from "@/lib/types";

const MAX_IMAGES = 6;
const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/heic", "image/heif", "image/webp"];
const ACCEPTED_DOC_TYPES = ["application/pdf", "application/vnd.openxmlformats-officedocument.wordprocessingml.document", "application/msword"];
const ACCEPTED_DOC_EXTENSIONS = /\.(pdf|docx|doc)$/i;

interface SelectedImage {
  file: File;
  preview: string;
  id: string;
}

interface SelectedFile {
  file: File;
  type: "pdf" | "docx" | "doc";
  name: string;
  size: number;
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function fileTypeFromFile(file: File): "pdf" | "docx" | "doc" | null {
  if (file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf")) return "pdf";
  if (
    file.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
    file.name.toLowerCase().endsWith(".docx")
  )
    return "docx";
  if (file.type === "application/msword" || file.name.toLowerCase().endsWith(".doc")) return "doc";
  return null;
}

function fileTypeIcon(type: "pdf" | "docx" | "doc") {
  return <FileText size={28} className={type === "pdf" ? "text-red-500" : "text-blue-500"} />;
}

function AnalyzePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialMode = searchParams.get("mode") === "text" ? "text" : "image";

  const [mode, setMode] = useState<"image" | "file" | "text">(initialMode as "image" | "file" | "text");

  // Image mode state
  const [images, setImages] = useState<SelectedImage[]>([]);

  // File mode state
  const [selectedFile, setSelectedFile] = useState<SelectedFile | null>(null);

  // Text mode state
  const [text, setText] = useState("");

  // Shared state
  const [additionalContext, setAdditionalContext] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [processingFile, setProcessingFile] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const imageInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const hasInput =
    mode === "image"
      ? images.length > 0
      : mode === "file"
      ? !!selectedFile
      : text.trim().length > 10;

  // === Image handlers ===
  const handleImageFiles = async (files: FileList | File[]) => {
    setError(null);
    const fileArr = Array.from(files);
    const remaining = MAX_IMAGES - images.length;
    if (remaining <= 0) {
      setError(`You can add up to ${MAX_IMAGES} images.`);
      return;
    }

    const toAdd = fileArr.slice(0, remaining);
    const newImages: SelectedImage[] = [];

    for (const file of toAdd) {
      if (!ACCEPTED_IMAGE_TYPES.includes(file.type) && !file.name.match(/\.(heic|heif)$/i)) {
        setError("Please use JPG, PNG, HEIC, or WebP images.");
        continue;
      }
      if (file.size > 20 * 1024 * 1024) {
        setError("One or more images are too large (max 20MB each).");
        continue;
      }
      const preview = URL.createObjectURL(file);
      newImages.push({ file, preview, id: `${Date.now()}-${Math.random()}` });
    }

    setImages((prev) => [...prev, ...newImages]);
  };

  const removeImage = (id: string) => {
    setImages((prev) => prev.filter((img) => img.id !== id));
  };

  // === File handlers ===
  const handleDocFile = async (file: File) => {
    setError(null);
    const type = fileTypeFromFile(file);
    if (!type) {
      setError("Please upload a PDF, DOCX, or DOC file.");
      return;
    }
    if (file.size > 25 * 1024 * 1024) {
      setError("File is too large (max 25MB).");
      return;
    }
    setSelectedFile({ file, type, name: file.name, size: file.size });
  };

  // === Submit ===
  const handleAnalyze = async () => {
    if (!hasInput) return;
    setIsAnalyzing(true);
    setError(null);

    try {
      let body: Record<string, unknown> = {};

      if (mode === "image") {
        setProcessingFile(true);
        const compressed = await Promise.all(
          images.map(async (img) => {
            const base64 = await compressImage(img.file);
            const mediaType = img.file.type === "image/png" ? "image/png" : "image/jpeg";
            return { base64, mediaType };
          })
        );
        setProcessingFile(false);
        body = {
          images: compressed.map((c) => c.base64),
          imageMediaTypes: compressed.map((c) => c.mediaType),
          additionalContext: additionalContext.trim() || undefined,
        };
      } else if (mode === "file" && selectedFile) {
        setProcessingFile(true);
        if (selectedFile.type === "pdf") {
          // Render PDF pages to images client-side
          const { renderPdfToImages, extractPdfText } = await import("@/lib/pdf/pdfUtils");
          const [pageImages, extractedText] = await Promise.all([
            renderPdfToImages(selectedFile.file, 6),
            extractPdfText(selectedFile.file).catch(() => ""),
          ]);
          setProcessingFile(false);

          if (pageImages.length === 0 && !extractedText) {
            throw new Error(
              "Couldn't read this PDF. Try taking a photo of it instead."
            );
          }

          body = {
            images: pageImages.map((p) => p.base64),
            imageMediaTypes: pageImages.map(() => "image/jpeg"),
            text: extractedText || undefined,
            additionalContext: additionalContext.trim() || undefined,
            fileName: selectedFile.name,
          };
        } else {
          // DOCX/DOC: send to server for text extraction
          const arrayBuffer = await selectedFile.file.arrayBuffer();
          const base64 = btoa(
            String.fromCharCode(...new Uint8Array(arrayBuffer))
          );
          setProcessingFile(false);
          body = {
            docxBase64: base64,
            fileType: selectedFile.type,
            fileName: selectedFile.name,
            additionalContext: additionalContext.trim() || undefined,
          };
        }
      } else {
        body = {
          text: text.trim(),
          additionalContext: additionalContext.trim() || undefined,
        };
      }

      const bodyString = JSON.stringify(body);
      // Vercel serverless payload limit is ~4.5MB
      if (bodyString.length > 4 * 1024 * 1024) {
        throw new Error(
          "The total file size is too large to send. Try fewer or smaller images, or paste the text instead."
        );
      }

      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: bodyString,
      });

      const data = await res.json();

      if (!data.success || !data.data) {
        throw new Error(data.error || "Couldn't analyze this. Please try again.");
      }

      const analysis: ClearItAnalysis = data.data;
      const key = `clearit_pending_${analysis.id}`;
      sessionStorage.setItem(
        key,
        JSON.stringify({
          analysis,
          textSnippet:
            mode === "text"
              ? text.slice(0, 200)
              : selectedFile
              ? `File: ${selectedFile.name}`
              : `${images.length} image${images.length > 1 ? "s" : ""}`,
          usedImage: mode === "image" || (mode === "file" && selectedFile?.type === "pdf"),
        })
      );
      router.push(`/result?id=${analysis.id}`);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong. Please try again."
      );
      setIsAnalyzing(false);
      setProcessingFile(false);
    }
  };

  if (isAnalyzing) {
    return (
      <AppShell title="Analyzing…">
        <LoadingAnalysis />
      </AppShell>
    );
  }

  const showContextBox = hasInput;

  return (
    <AppShell title="Explain something">
      <div className="flex flex-col px-4 pt-4 pb-6 gap-5">
        {/* Mode toggle */}
        <div
          className="flex rounded-xl p-1 gap-1"
          style={{ background: "var(--muted)" }}
        >
          {(
            [
              { id: "image", label: "Photos", icon: <ImageIcon size={15} /> },
              { id: "file", label: "File", icon: <FileText size={15} /> },
              { id: "text", label: "Paste text", icon: <Type size={15} /> },
            ] as const
          ).map(({ id, label, icon }) => (
            <button
              key={id}
              onClick={() => {
                setMode(id);
                setError(null);
              }}
              className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-lg text-sm font-semibold transition-all"
              style={
                mode === id
                  ? {
                      background: "var(--card)",
                      color: "var(--primary)",
                      boxShadow: "var(--shadow-sm)",
                    }
                  : { color: "var(--muted-foreground)" }
              }
            >
              {icon}
              {label}
            </button>
          ))}
        </div>

        {/* Content area */}
        <AnimatePresence mode="wait">
          {/* === IMAGE MODE === */}
          {mode === "image" && (
            <motion.div
              key="image"
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 8 }}
              className="flex flex-col gap-4"
            >
              {/* Image grid */}
              {images.length > 0 && (
                <div className="grid grid-cols-3 gap-2">
                  {images.map((img) => (
                    <div
                      key={img.id}
                      className="relative rounded-xl overflow-hidden border aspect-square"
                      style={{ borderColor: "var(--border)" }}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={img.preview}
                        alt="Selected"
                        className="w-full h-full object-cover"
                      />
                      <button
                        onClick={() => removeImage(img.id)}
                        className="absolute top-1 right-1 w-6 h-6 rounded-full flex items-center justify-center bg-black/60 text-white hover:bg-black/80 transition-all"
                      >
                        <X size={12} />
                      </button>
                    </div>
                  ))}

                  {/* Add more button */}
                  {images.length < MAX_IMAGES && (
                    <button
                      onClick={() => imageInputRef.current?.click()}
                      className="aspect-square rounded-xl border-2 border-dashed flex flex-col items-center justify-center gap-1 transition-all active:scale-95"
                      style={{
                        borderColor: "var(--border)",
                        color: "var(--muted-foreground)",
                        background: "var(--card)",
                      }}
                    >
                      <Plus size={20} />
                      <span className="text-xs font-medium">Add</span>
                    </button>
                  )}
                </div>
              )}

              {/* Drop zone (shown when no images yet) */}
              {images.length === 0 && (
                <div
                  className="border-2 border-dashed rounded-2xl p-8 flex flex-col items-center justify-center gap-4 cursor-pointer transition-all"
                  style={{ borderColor: "var(--border)", background: "var(--card)" }}
                  onClick={() => imageInputRef.current?.click()}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => {
                    e.preventDefault();
                    if (e.dataTransfer.files.length > 0) {
                      handleImageFiles(e.dataTransfer.files);
                    }
                  }}
                >
                  <div
                    className="w-14 h-14 rounded-2xl flex items-center justify-center"
                    style={{ background: "var(--muted)" }}
                  >
                    <Upload size={24} style={{ color: "var(--primary)" }} />
                  </div>
                  <div className="text-center">
                    <p className="font-semibold text-sm mb-1" style={{ color: "var(--foreground)" }}>
                      Tap to add photos
                    </p>
                    <p className="text-xs" style={{ color: "var(--muted-foreground)" }}>
                      Add up to {MAX_IMAGES} photos — both sides, multiple pages, etc.
                    </p>
                  </div>
                </div>
              )}

              {/* Action buttons */}
              <div className="flex gap-2">
                <button
                  onClick={() => imageInputRef.current?.click()}
                  className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold border transition-all active:scale-95"
                  style={{
                    background: "var(--card)",
                    borderColor: "var(--border)",
                    color: "var(--foreground)",
                  }}
                >
                  <FilePlus size={16} />
                  {images.length > 0 ? "Add more" : "Choose photos"}
                </button>
                <button
                  onClick={() => cameraInputRef.current?.click()}
                  className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold border transition-all active:scale-95"
                  style={{
                    background: "var(--card)",
                    borderColor: "var(--border)",
                    color: "var(--foreground)",
                  }}
                >
                  <Camera size={16} />
                  Camera
                </button>
              </div>

              {images.length > 0 && (
                <p className="text-xs text-center" style={{ color: "var(--muted-foreground)" }}>
                  {images.length} of {MAX_IMAGES} photos added. Make sure text is clear and not cut off.
                </p>
              )}

              <input
                ref={imageInputRef}
                type="file"
                accept="image/jpeg,image/jpg,image/png,image/heic,image/heif,image/webp"
                multiple
                className="hidden"
                onChange={(e) => {
                  if (e.target.files) handleImageFiles(e.target.files);
                  e.target.value = "";
                }}
              />
              <input
                ref={cameraInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files) handleImageFiles(e.target.files);
                  e.target.value = "";
                }}
              />
            </motion.div>
          )}

          {/* === FILE MODE === */}
          {mode === "file" && (
            <motion.div
              key="file"
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 8 }}
              className="flex flex-col gap-4"
            >
              {selectedFile ? (
                <div
                  className="rounded-2xl p-4 border flex items-center gap-4"
                  style={{
                    background: "var(--card)",
                    borderColor: "var(--border)",
                  }}
                >
                  <div
                    className="w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: "var(--muted)" }}
                  >
                    {fileTypeIcon(selectedFile.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p
                      className="text-sm font-semibold truncate"
                      style={{ color: "var(--foreground)" }}
                    >
                      {selectedFile.name}
                    </p>
                    <p
                      className="text-xs mt-0.5"
                      style={{ color: "var(--muted-foreground)" }}
                    >
                      {selectedFile.type.toUpperCase()} · {formatFileSize(selectedFile.size)}
                    </p>
                    {selectedFile.type === "pdf" && (
                      <p className="text-xs mt-1 text-amber-600">
                        Pages will be converted to images for analysis.
                      </p>
                    )}
                    {(selectedFile.type === "docx" || selectedFile.type === "doc") && (
                      <p className="text-xs mt-1" style={{ color: "var(--muted-foreground)" }}>
                        Text will be extracted for analysis.
                      </p>
                    )}
                  </div>
                  <button
                    onClick={() => setSelectedFile(null)}
                    className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-lg transition-all"
                    style={{ color: "var(--muted-foreground)" }}
                  >
                    <X size={18} />
                  </button>
                </div>
              ) : (
                <div
                  className="border-2 border-dashed rounded-2xl p-8 flex flex-col items-center justify-center gap-4 cursor-pointer transition-all"
                  style={{ borderColor: "var(--border)", background: "var(--card)" }}
                  onClick={() => fileInputRef.current?.click()}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => {
                    e.preventDefault();
                    const file = e.dataTransfer.files[0];
                    if (file) handleDocFile(file);
                  }}
                >
                  <div
                    className="w-14 h-14 rounded-2xl flex items-center justify-center"
                    style={{ background: "var(--muted)" }}
                  >
                    <FileText size={24} style={{ color: "var(--primary)" }} />
                  </div>
                  <div className="text-center">
                    <p className="font-semibold text-sm mb-1" style={{ color: "var(--foreground)" }}>
                      Upload a document
                    </p>
                    <p className="text-xs" style={{ color: "var(--muted-foreground)" }}>
                      PDF, DOCX, or DOC · Max 25MB
                    </p>
                  </div>
                </div>
              )}

              {!selectedFile && (
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold border transition-all active:scale-95"
                  style={{
                    background: "var(--card)",
                    borderColor: "var(--border)",
                    color: "var(--foreground)",
                  }}
                >
                  <Upload size={16} />
                  Choose file
                </button>
              )}

              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.docx,.doc,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/msword"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleDocFile(file);
                  e.target.value = "";
                }}
              />
            </motion.div>
          )}

          {/* === TEXT MODE === */}
          {mode === "text" && (
            <motion.div
              key="text"
              initial={{ opacity: 0, x: 8 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -8 }}
              className="flex flex-col gap-2"
            >
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Paste the confusing message, letter, bill, or error here…"
                className="w-full rounded-2xl p-4 text-sm resize-none min-h-[200px] border outline-none transition-all"
                style={{
                  background: "var(--card)",
                  borderColor: "var(--border)",
                  color: "var(--foreground)",
                  lineHeight: "1.6",
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = "var(--primary)";
                  e.target.style.boxShadow = "0 0 0 3px rgb(99 102 241 / 0.15)";
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = "var(--border)";
                  e.target.style.boxShadow = "";
                }}
              />
              <p className="text-xs text-right" style={{ color: "var(--muted-foreground)" }}>
                {text.length} characters
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Additional context box — shown when there's primary input */}
        <AnimatePresence>
          {showContextBox && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="flex flex-col gap-2"
            >
              <label
                className="flex items-center gap-2 text-sm font-semibold"
                style={{ color: "var(--foreground)" }}
              >
                <MessageSquarePlus size={16} style={{ color: "var(--primary)" }} />
                Additional details
                <span className="text-xs font-normal" style={{ color: "var(--muted-foreground)" }}>
                  (optional)
                </span>
              </label>
              <textarea
                value={additionalContext}
                onChange={(e) => setAdditionalContext(e.target.value)}
                placeholder="Add any extra context that might help — e.g. 'I've never seen this company before' or 'This is for my elderly mother' or 'I already made a payment last week'…"
                className="w-full rounded-2xl p-4 text-sm resize-none min-h-[100px] border outline-none transition-all"
                style={{
                  background: "var(--card)",
                  borderColor: "var(--border)",
                  color: "var(--foreground)",
                  lineHeight: "1.6",
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = "var(--primary)";
                  e.target.style.boxShadow = "0 0 0 3px rgb(99 102 241 / 0.15)";
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = "var(--border)";
                  e.target.style.boxShadow = "";
                }}
              />
              <p className="text-xs" style={{ color: "var(--muted-foreground)" }}>
                This helps ClearIt give you a more accurate and personalized explanation.
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Error */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="flex items-start gap-3 p-4 rounded-xl border"
              style={{ background: "#fef2f2", borderColor: "#fca5a5" }}
            >
              <AlertCircle size={16} className="text-red-500 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-700">{error}</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Processing indicator */}
        <AnimatePresence>
          {processingFile && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex items-center justify-center gap-2 py-2"
              style={{ color: "var(--muted-foreground)" }}
            >
              <Loader2 size={16} className="animate-spin" />
              <span className="text-sm">Processing file…</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Analyze button */}
        <button
          onClick={handleAnalyze}
          disabled={!hasInput || processingFile}
          className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl text-base font-semibold transition-all active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed"
          style={{
            background: hasInput && !processingFile
              ? "linear-gradient(135deg, #3730a3, #6366f1)"
              : "var(--muted)",
            color: hasInput && !processingFile ? "white" : "var(--muted-foreground)",
            boxShadow: hasInput && !processingFile ? "0 4px 20px rgb(99 102 241 / 0.35)" : "none",
          }}
        >
          <ScanLine size={20} />
          Clear this up
        </button>

        <p className="text-xs text-center" style={{ color: "var(--muted-foreground)" }}>
          Your content is sent securely and not stored after analysis.
        </p>
      </div>
    </AppShell>
  );
}

export default function AnalyzePageWrapper() {
  return (
    <Suspense>
      <AnalyzePage />
    </Suspense>
  );
}
