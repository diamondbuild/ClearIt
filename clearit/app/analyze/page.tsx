"use client";

import { useState, useRef, useEffect, Suspense } from "react";
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
} from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { LoadingAnalysis } from "@/components/LoadingAnalysis";
import { compressImage } from "@/lib/utils";
import { ClearItAnalysis } from "@/lib/types";

function AnalyzePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialMode = searchParams.get("mode") === "text" ? "text" : "image";

  const [mode, setMode] = useState<"image" | "text">(initialMode);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [text, setText] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const hasInput = mode === "image" ? !!imageFile : text.trim().length > 10;

  const handleFileSelect = async (file: File) => {
    setError(null);

    const validTypes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/heic",
      "image/heif",
      "image/webp",
    ];
    if (!validTypes.includes(file.type) && !file.name.match(/\.(heic|heif)$/i)) {
      setError("Please use a JPG, PNG, HEIC, or WebP image.");
      return;
    }

    if (file.size > 20 * 1024 * 1024) {
      setError("Image is too large. Please use an image under 20MB.");
      return;
    }

    const previewUrl = URL.createObjectURL(file);
    setImagePreview(previewUrl);
    setImageFile(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) handleFileSelect(file);
  };

  const handleAnalyze = async () => {
    if (!hasInput) return;
    setIsAnalyzing(true);
    setError(null);

    try {
      let body: Record<string, string> = {};

      if (mode === "image" && imageFile) {
        const base64 = await compressImage(imageFile);
        const mediaType =
          imageFile.type === "image/png" ? "image/png" : "image/jpeg";
        body = { imageBase64: base64, imageMediaType: mediaType };
      } else {
        body = { text: text.trim() };
      }

      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (!data.success || !data.data) {
        throw new Error(
          data.error || "Couldn't analyze this. Please try again."
        );
      }

      const analysis: ClearItAnalysis = data.data;
      const key = `clearit_pending_${analysis.id}`;
      sessionStorage.setItem(
        key,
        JSON.stringify({
          analysis,
          textSnippet: mode === "text" ? text.slice(0, 200) : undefined,
          usedImage: mode === "image",
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
    }
  };

  if (isAnalyzing) {
    return (
      <AppShell title="Analyzing…">
        <LoadingAnalysis />
      </AppShell>
    );
  }

  return (
    <AppShell title="Explain something">
      <div className="flex flex-col px-4 pt-4 pb-6 gap-5">
        {/* Mode toggle */}
        <div
          className="flex rounded-xl p-1 gap-1"
          style={{ background: "var(--muted)" }}
        >
          <button
            onClick={() => setMode("image")}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold transition-all"
            style={
              mode === "image"
                ? {
                    background: "var(--card)",
                    color: "var(--primary)",
                    boxShadow: "var(--shadow-sm)",
                  }
                : { color: "var(--muted-foreground)" }
            }
          >
            <ImageIcon size={16} />
            Photo / Image
          </button>
          <button
            onClick={() => setMode("text")}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold transition-all"
            style={
              mode === "text"
                ? {
                    background: "var(--card)",
                    color: "var(--primary)",
                    boxShadow: "var(--shadow-sm)",
                  }
                : { color: "var(--muted-foreground)" }
            }
          >
            <Type size={16} />
            Paste text
          </button>
        </div>

        {/* Content area */}
        <AnimatePresence mode="wait">
          {mode === "image" ? (
            <motion.div
              key="image"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              className="flex flex-col gap-4"
            >
              {imagePreview ? (
                <div className="relative rounded-2xl overflow-hidden border" style={{ borderColor: "var(--border)" }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={imagePreview}
                    alt="Selected"
                    className="w-full max-h-72 object-contain bg-slate-50 dark:bg-slate-900"
                  />
                  <button
                    onClick={() => {
                      setImageFile(null);
                      setImagePreview(null);
                    }}
                    className="absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center bg-black/50 text-white hover:bg-black/70 transition-all"
                  >
                    <X size={16} />
                  </button>
                  <div className="absolute bottom-0 left-0 right-0 px-3 py-2 bg-black/30">
                    <p className="text-white text-xs font-medium truncate">
                      {imageFile?.name}
                    </p>
                  </div>
                </div>
              ) : (
                <div
                  className="border-2 border-dashed rounded-2xl p-8 flex flex-col items-center justify-center gap-4 transition-all cursor-pointer"
                  style={{ borderColor: "var(--border)", background: "var(--card)" }}
                  onClick={() => fileInputRef.current?.click()}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={handleDrop}
                >
                  <div
                    className="w-14 h-14 rounded-2xl flex items-center justify-center"
                    style={{ background: "var(--muted)" }}
                  >
                    <Upload size={24} style={{ color: "var(--primary)" }} />
                  </div>
                  <div className="text-center">
                    <p className="font-semibold text-sm mb-1" style={{ color: "var(--foreground)" }}>
                      Tap to choose a photo
                    </p>
                    <p className="text-xs" style={{ color: "var(--muted-foreground)" }}>
                      JPG, PNG, HEIC or drag & drop
                    </p>
                  </div>
                </div>
              )}

              <div className="flex gap-2">
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold border transition-all active:scale-95"
                  style={{
                    background: "var(--card)",
                    borderColor: "var(--border)",
                    color: "var(--foreground)",
                  }}
                >
                  <Upload size={16} />
                  Upload file
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
                  Take photo
                </button>
              </div>

              <p
                className="text-xs text-center"
                style={{ color: "var(--muted-foreground)" }}
              >
                Make sure the text is clear and not cut off.
              </p>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/jpg,image/png,image/heic,image/heif,image/webp"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleFileSelect(file);
                }}
              />
              <input
                ref={cameraInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleFileSelect(file);
                }}
              />
            </motion.div>
          ) : (
            <motion.div
              key="text"
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              className="flex flex-col gap-2"
            >
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Paste the confusing message, letter, bill, or error here…"
                className="w-full rounded-2xl p-4 text-sm resize-none min-h-[200px] border outline-none focus:ring-2 transition-all"
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
              <p
                className="text-xs text-right"
                style={{ color: "var(--muted-foreground)" }}
              >
                {text.length} characters
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
              style={{
                background: "#fef2f2",
                borderColor: "#fca5a5",
              }}
            >
              <AlertCircle size={16} className="text-red-500 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-700">{error}</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Analyze button */}
        <button
          onClick={handleAnalyze}
          disabled={!hasInput}
          className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl text-base font-semibold text-white transition-all active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed"
          style={{
            background: hasInput
              ? "linear-gradient(135deg, #3730a3, #6366f1)"
              : "var(--muted)",
            color: hasInput ? "white" : "var(--muted-foreground)",
            boxShadow: hasInput ? "0 4px 20px rgb(99 102 241 / 0.35)" : "none",
          }}
        >
          <ScanLine size={20} />
          Clear this up
        </button>
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
