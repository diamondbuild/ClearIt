"use client";

import Image from "next/image";
import { Camera, ImagePlus, RotateCcw, X } from "lucide-react";
import { ActionButton } from "@/components/ActionButton";

export function UploadCard({
  previewUrl,
  fileName,
  onFile,
  onRemove,
}: {
  previewUrl?: string;
  fileName?: string;
  onFile: (file: File) => void;
  onRemove: () => void;
}) {
  return (
    <section className="glass-card rounded-[2rem] p-5">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-black tracking-tight text-slate-950 dark:text-white">Upload or take a photo</h2>
          <p className="mt-1 text-sm leading-6 text-slate-600 dark:text-slate-300">Make sure the text is clear and not cut off.</p>
        </div>
        <span className="grid size-10 shrink-0 place-items-center rounded-2xl bg-blue-50 text-blue-700 dark:bg-blue-400/10 dark:text-blue-200">
          <Camera className="size-5" aria-hidden="true" />
        </span>
      </div>

      {previewUrl ? (
        <div className="overflow-hidden rounded-3xl border border-slate-200 bg-slate-100 dark:border-white/10 dark:bg-slate-900">
          <div className="relative aspect-[4/3]">
            <Image src={previewUrl} alt="Selected item preview" fill className="object-cover" unoptimized />
          </div>
          <div className="flex items-center justify-between gap-3 bg-white p-3 dark:bg-slate-950">
            <p className="min-w-0 truncate text-sm font-bold text-slate-700 dark:text-slate-200">{fileName ?? "Selected image"}</p>
            <ActionButton type="button" variant="ghost" className="min-h-10 px-3" onClick={onRemove}>
              <X className="size-4" aria-hidden="true" />
              Remove
            </ActionButton>
          </div>
        </div>
      ) : (
        <label className="flex min-h-44 cursor-pointer flex-col items-center justify-center rounded-3xl border-2 border-dashed border-blue-200 bg-blue-50/60 p-6 text-center transition hover:bg-blue-50 dark:border-blue-300/20 dark:bg-blue-400/10 dark:hover:bg-blue-400/15">
          <ImagePlus className="size-9 text-blue-700 dark:text-blue-200" aria-hidden="true" />
          <span className="mt-3 text-base font-black text-slate-950 dark:text-white">Choose image or open camera</span>
          <span className="mt-1 text-sm text-slate-600 dark:text-slate-300">PNG, JPG, JPEG, or HEIC</span>
          <input
            className="sr-only"
            type="file"
            accept="image/png,image/jpeg,image/jpg,image/heic,image/heif"
            capture="environment"
            onChange={(event) => {
              const file = event.target.files?.[0];
              if (file) {
                onFile(file);
              }
              event.currentTarget.value = "";
            }}
          />
        </label>
      )}

      {previewUrl ? (
        <label className="mt-3 inline-flex cursor-pointer items-center gap-2 rounded-2xl px-2 py-2 text-sm font-extrabold text-blue-700 dark:text-blue-200">
          <RotateCcw className="size-4" aria-hidden="true" />
          Change image
          <input
            className="sr-only"
            type="file"
            accept="image/png,image/jpeg,image/jpg,image/heic,image/heif"
            capture="environment"
            onChange={(event) => {
              const file = event.target.files?.[0];
              if (file) {
                onFile(file);
              }
              event.currentTarget.value = "";
            }}
          />
        </label>
      ) : null}
    </section>
  );
}
