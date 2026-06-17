"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { AlertCircle, WandSparkles } from "lucide-react";
import { ActionButton } from "@/components/ActionButton";
import { LoadingAnalysis } from "@/components/LoadingAnalysis";
import { PasteTextBox } from "@/components/PasteTextBox";
import { UploadCard } from "@/components/UploadCard";
import { storeLastInput, storeLastResult } from "@/lib/storage/history";
import type { ClearItAnalysis } from "@/lib/types";

const allowedTypes = new Set(["image/png", "image/jpeg", "image/jpg", "image/heic", "image/heif"]);
const demoModeKey = "clearit.demoMode.v1";

function readFileAsDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error("Could not read this image."));
    reader.readAsDataURL(file);
  });
}

async function resizeImage(file: File) {
  if (!["image/png", "image/jpeg", "image/jpg"].includes(file.type)) {
    return readFileAsDataUrl(file);
  }

  const dataUrl = await readFileAsDataUrl(file);

  return new Promise<string>((resolve) => {
    const image = new Image();
    image.onload = () => {
      const maxDimension = 1800;
      const scale = Math.min(1, maxDimension / Math.max(image.width, image.height));
      const canvas = document.createElement("canvas");
      canvas.width = Math.round(image.width * scale);
      canvas.height = Math.round(image.height * scale);
      const context = canvas.getContext("2d");

      if (!context) {
        resolve(dataUrl);
        return;
      }

      context.drawImage(image, 0, 0, canvas.width, canvas.height);
      resolve(canvas.toDataURL("image/jpeg", 0.84));
    };
    image.onerror = () => resolve(dataUrl);
    image.src = dataUrl;
  });
}

export default function AnalyzePage() {
  const router = useRouter();
  const [text, setText] = useState("");
  const [imageDataUrl, setImageDataUrl] = useState<string>();
  const [imageMimeType, setImageMimeType] = useState<string>();
  const [fileName, setFileName] = useState<string>();
  const [previewUrl, setPreviewUrl] = useState<string>();
  const [error, setError] = useState<string>();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("mode") === "text") {
      document.getElementById("clearit-paste-text")?.focus();
    }
  }, []);

  async function handleFile(file: File) {
    setError(undefined);

    if (!allowedTypes.has(file.type)) {
      setError("ClearIt supports PNG, JPG, JPEG, and HEIC images for this MVP.");
      return;
    }

    if (file.size > 14 * 1024 * 1024) {
      setError("This image is too large. Try a closer crop, screenshot, or paste the text instead.");
      return;
    }

    try {
      const compressed = await resizeImage(file);
      setImageDataUrl(compressed);
      setImageMimeType(compressed.startsWith("data:image/jpeg") ? "image/jpeg" : file.type);
      setFileName(file.name);
      setPreviewUrl(compressed);
    } catch {
      setError("ClearIt could not read this image. Try a different photo or paste the text instead.");
    }
  }

  function removeImage() {
    setImageDataUrl(undefined);
    setImageMimeType(undefined);
    setFileName(undefined);
    setPreviewUrl(undefined);
  }

  async function analyze() {
    if (!text.trim() && !imageDataUrl) {
      setError("Add a clear photo or paste text to analyze.");
      return;
    }

    setLoading(true);
    setError(undefined);

    try {
      const demoMode = window.localStorage.getItem(demoModeKey) === "true";
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: text.trim() || undefined,
          imageBase64: imageDataUrl,
          imageMimeType,
          fileName,
          demoMode,
        }),
      });

      const payload = (await response.json()) as ClearItAnalysis | { error?: string };

      if (!response.ok || "error" in payload) {
        throw new Error("error" in payload ? payload.error : "Network error");
      }

      storeLastResult(payload);
      storeLastInput({ text: text.trim() || undefined, imageUsed: Boolean(imageDataUrl) });
      router.push("/result");
    } catch (caught) {
      const message = caught instanceof Error ? caught.message : "Network error";
      setError(
        message === "Network error"
          ? "ClearIt could not connect. Check your connection and try again."
          : message || "ClearIt couldn't read this clearly. Try a sharper photo or paste the text instead.",
      );
      setLoading(false);
    }
  }

  if (loading) {
    return <LoadingAnalysis />;
  }

  const canAnalyze = Boolean(text.trim() || imageDataUrl);

  return (
    <div className="space-y-4">
      <section className="px-1">
        <p className="text-sm font-black uppercase tracking-[0.18em] text-blue-700 dark:text-blue-300">Analyze</p>
        <h1 className="mt-2 text-3xl font-black tracking-tight text-slate-950 dark:text-white">What do you want ClearIt to explain?</h1>
        <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">Use a clear image or paste the exact words from the message.</p>
      </section>

      <UploadCard previewUrl={previewUrl} fileName={fileName} onFile={handleFile} onRemove={removeImage} />
      <PasteTextBox value={text} onChange={setText} />

      {error ? (
        <div className="flex gap-3 rounded-3xl border border-red-200 bg-red-50 p-4 text-sm font-bold leading-6 text-red-800 dark:border-red-300/20 dark:bg-red-500/10 dark:text-red-100">
          <AlertCircle className="mt-0.5 size-5 shrink-0" aria-hidden="true" />
          <p>{error}</p>
        </div>
      ) : null}

      <ActionButton type="button" className="w-full text-base" disabled={!canAnalyze} onClick={analyze}>
        <WandSparkles className="size-5" aria-hidden="true" />
        Clear this up
      </ActionButton>
    </div>
  );
}
