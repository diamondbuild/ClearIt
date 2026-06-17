"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import { AppShell } from "@/components/AppShell";
import { LoadingAnalysis } from "@/components/LoadingAnalysis";
import { PasteTextBox } from "@/components/PasteTextBox";
import { UploadCard } from "@/components/UploadCard";
import { getDemoMode, setCurrentResult } from "@/lib/storage/history";

const MAX_UPLOAD_BYTES = 8 * 1024 * 1024;

const maybeCompressImage = async (file: File) => {
  if (!file.type.startsWith("image/")) return file;
  if (file.type.includes("heic") || file.type.includes("heif")) return file;
  if (file.size < 2 * 1024 * 1024) return file;

  const dataUrl = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result ?? ""));
    reader.onerror = () => reject(new Error("Could not read image"));
    reader.readAsDataURL(file);
  });

  const image = await new Promise<HTMLImageElement>((resolve, reject) => {
    const nextImage = new Image();
    nextImage.onload = () => resolve(nextImage);
    nextImage.onerror = () => reject(new Error("Could not load image"));
    nextImage.src = dataUrl;
  });

  const maxDimension = 1600;
  const scale = Math.min(1, maxDimension / Math.max(image.width, image.height));
  const width = Math.round(image.width * scale);
  const height = Math.round(image.height * scale);

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext("2d");

  if (!context) return file;
  context.drawImage(image, 0, 0, width, height);

  const compressedBlob = await new Promise<Blob | null>((resolve) => {
    canvas.toBlob(resolve, "image/jpeg", 0.86);
  });

  if (!compressedBlob || compressedBlob.size >= file.size) return file;

  return new File([compressedBlob], file.name.replace(/\.\w+$/, ".jpg"), {
    type: "image/jpeg",
  });
};

export default function AnalyzePage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [text, setText] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [demoMode, setDemoMode] = useState(false);

  const shouldFocusText = searchParams.get("focus") === "text";

  useEffect(() => {
    setDemoMode(getDemoMode());
  }, []);

  useEffect(() => {
    if (!selectedFile) {
      setPreviewUrl(null);
      return;
    }

    const url = URL.createObjectURL(selectedFile);
    setPreviewUrl(url);

    return () => URL.revokeObjectURL(url);
  }, [selectedFile]);

  const onPickFile = async (file: File | null) => {
    setError("");
    if (!file) {
      setSelectedFile(null);
      return;
    }

    if (!file.type.startsWith("image/")) {
      setError("Unsupported file type. Use PNG, JPG, JPEG, or HEIC.");
      return;
    }

    if (file.size > MAX_UPLOAD_BYTES) {
      setError("Image too large. Try a file smaller than 8MB.");
      return;
    }

    try {
      const processed = await maybeCompressImage(file);
      setSelectedFile(processed);
    } catch {
      setSelectedFile(file);
    }
  };

  const hasInput = useMemo(
    () => Boolean(text.trim().length > 0 || selectedFile),
    [selectedFile, text],
  );

  const onSubmit = async () => {
    if (!hasInput) {
      setError("Please upload an image or paste text first.");
      return;
    }

    setError("");
    setIsLoading(true);

    try {
      const formData = new FormData();
      if (text.trim()) formData.append("text", text.trim());
      if (selectedFile) formData.append("image", selectedFile);
      formData.append("demoMode", String(demoMode));

      const response = await fetch("/api/analyze", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok || !data.ok || !data.result) {
        throw new Error(
          data?.error ??
            "ClearIt couldn’t read this image clearly. Try taking the photo closer, with better lighting, or paste the text instead.",
        );
      }

      setCurrentResult({
        result: data.result,
        originalTextSnippet: text.trim().slice(0, 180),
        usedImage: Boolean(selectedFile),
      });

      router.push(`/result?id=${data.result.id}`);
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "We couldn’t analyze this clearly. Try a sharper photo or paste the text instead.",
      );
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <AppShell>
        <LoadingAnalysis />
      </AppShell>
    );
  }

  return (
    <AppShell className="space-y-4">
      <section className="clearit-card">
        <h1 className="font-display text-2xl font-semibold text-slate-900">Explain something</h1>
        <p className="mt-2 text-sm text-slate-600">
          Upload a photo, take a picture, or paste text to get a plain-English explanation.
        </p>
      </section>

      <UploadCard
        previewUrl={previewUrl}
        fileName={selectedFile?.name ?? ""}
        onPickFile={onPickFile}
      />

      <PasteTextBox value={text} onChange={setText} />

      {shouldFocusText ? (
        <p className="rounded-xl border border-indigo-200 bg-indigo-50 px-3 py-2 text-xs text-indigo-700">
          Tip: paste text from any message, bill, or notice and tap “Clear this up.”
        </p>
      ) : null}

      {error ? (
        <p className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
          {error}
        </p>
      ) : null}

      <button
        type="button"
        disabled={!hasInput}
        onClick={onSubmit}
        className="clearit-primary-btn h-12 w-full justify-center disabled:cursor-not-allowed disabled:bg-indigo-300"
      >
        Clear this up
      </button>
    </AppShell>
  );
}
