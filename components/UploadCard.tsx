"use client";

import { useRef, useState } from "react";
import { Camera, ImageUp, X, Loader2 } from "lucide-react";
import {
  compressImage,
  isAcceptedImage,
  MAX_IMAGE_BYTES,
} from "@/lib/image";
import { cn } from "@/lib/utils";

export function UploadCard({
  imageDataUrl,
  onImageReady,
  onClear,
  onError,
}: {
  imageDataUrl: string | null;
  onImageReady: (dataUrl: string) => void;
  onClear: () => void;
  onError: (message: string) => void;
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const [processing, setProcessing] = useState(false);

  const handleFile = async (file: File | undefined) => {
    if (!file) return;
    if (!isAcceptedImage(file)) {
      onError("That file type isn't supported. Try a PNG, JPG, or HEIC photo.");
      return;
    }
    if (file.size > MAX_IMAGE_BYTES) {
      onError("That image is a bit too large. Try a smaller photo.");
      return;
    }
    setProcessing(true);
    try {
      const { dataUrl } = await compressImage(file);
      onImageReady(dataUrl);
    } catch {
      onError(
        "ClearIt couldn't read this image. Try another photo or paste the text instead.",
      );
    } finally {
      setProcessing(false);
    }
  };

  if (imageDataUrl) {
    return (
      <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-soft">
        <div className="relative">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={imageDataUrl}
            alt="Preview of what you uploaded"
            className="max-h-72 w-full object-contain bg-muted"
          />
          <button
            type="button"
            onClick={onClear}
            aria-label="Remove image"
            className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-background/90 text-foreground shadow-soft backdrop-blur transition hover:bg-background"
          >
            <X className="h-4.5 w-4.5" />
          </button>
        </div>
        <div className="flex items-center justify-between gap-2 p-3">
          <p className="text-xs text-muted-foreground">
            Make sure the text is clear and not cut off.
          </p>
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="shrink-0 rounded-xl border border-border px-3 py-1.5 text-xs font-semibold transition hover:bg-muted"
          >
            Change
          </button>
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/png,image/jpeg,image/jpg,image/heic,image/heif,image/webp"
          className="hidden"
          onChange={(e) => handleFile(e.target.files?.[0])}
        />
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <button
        type="button"
        onClick={() => fileInputRef.current?.click()}
        disabled={processing}
        className={cn(
          "flex w-full flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-border bg-card px-6 py-10 text-center shadow-soft transition hover:border-primary/40 hover:bg-primary/5",
          processing && "opacity-70",
        )}
      >
        <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
          {processing ? (
            <Loader2 className="h-7 w-7 animate-spin" />
          ) : (
            <ImageUp className="h-7 w-7" />
          )}
        </span>
        <span className="text-base font-semibold">
          {processing ? "Preparing image…" : "Upload an image"}
        </span>
        <span className="text-xs text-muted-foreground">
          PNG, JPG, or HEIC · Make sure the text is clear and not cut off.
        </span>
      </button>

      <button
        type="button"
        onClick={() => cameraInputRef.current?.click()}
        disabled={processing}
        className="flex w-full items-center justify-center gap-2 rounded-2xl border border-border bg-card px-5 py-3.5 text-sm font-semibold shadow-soft transition hover:bg-muted"
      >
        <Camera className="h-4.5 w-4.5" />
        Take a photo
      </button>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/png,image/jpeg,image/jpg,image/heic,image/heif,image/webp"
        className="hidden"
        onChange={(e) => handleFile(e.target.files?.[0])}
      />
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={(e) => handleFile(e.target.files?.[0])}
      />
    </div>
  );
}
