"use client";

import { Camera, ImagePlus, Trash2 } from "lucide-react";

type UploadCardProps = {
  previewUrl: string | null;
  fileName: string;
  onPickFile: (file: File | null) => void;
};

export const UploadCard = ({ previewUrl, fileName, onPickFile }: UploadCardProps) => {
  return (
    <section className="clearit-card">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="text-base font-semibold text-slate-900">Upload a photo or screenshot</h2>
          <p className="text-sm text-slate-600">
            Make sure the text is clear and not cut off.
          </p>
        </div>
      </div>

      <div className="flex gap-3">
        <label className="clearit-secondary-btn flex-1 cursor-pointer justify-center">
          <ImagePlus size={16} />
          Upload image
          <input
            hidden
            type="file"
            accept=".png,.jpg,.jpeg,.heic,image/png,image/jpeg,image/heic,image/heif"
            onChange={(event) => onPickFile(event.target.files?.[0] ?? null)}
          />
        </label>
        <label className="clearit-secondary-btn flex-1 cursor-pointer justify-center">
          <Camera size={16} />
          Take photo
          <input
            hidden
            type="file"
            capture="environment"
            accept=".png,.jpg,.jpeg,.heic,image/png,image/jpeg,image/heic,image/heif"
            onChange={(event) => onPickFile(event.target.files?.[0] ?? null)}
          />
        </label>
      </div>

      {previewUrl ? (
        <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-3">
          <div className="relative mb-3 h-48 overflow-hidden rounded-xl border border-slate-200 bg-white">
            <img
              src={previewUrl}
              alt="Selected upload preview"
              className="h-full w-full object-contain"
            />
          </div>
          <div className="flex items-center justify-between gap-3">
            <p className="truncate text-sm text-slate-600">{fileName}</p>
            <button
              type="button"
              className="clearit-secondary-btn"
              onClick={() => onPickFile(null)}
            >
              <Trash2 size={15} />
              Remove
            </button>
          </div>
        </div>
      ) : null}
    </section>
  );
};
