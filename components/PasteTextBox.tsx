"use client";

import { ClipboardPaste } from "lucide-react";

export function PasteTextBox({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) onChange(text);
    } catch {
      // Clipboard access denied — user can paste manually.
    }
  };

  return (
    <div className="space-y-2">
      <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-soft focus-within:border-primary/50 focus-within:ring-2 focus-within:ring-primary/20">
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          rows={8}
          placeholder="Paste the confusing message, letter, bill, or error here…"
          className="w-full resize-none bg-transparent p-4 text-[15px] leading-relaxed outline-none placeholder:text-muted-foreground"
        />
        <div className="flex items-center justify-between border-t border-border px-3 py-2">
          <span className="text-xs text-muted-foreground">
            {value.trim().length > 0
              ? `${value.trim().length} characters`
              : "Tip: include the whole message for the best result."}
          </span>
          <button
            type="button"
            onClick={handlePaste}
            className="inline-flex items-center gap-1.5 rounded-xl border border-border px-2.5 py-1.5 text-xs font-semibold transition hover:bg-muted"
          >
            <ClipboardPaste className="h-3.5 w-3.5" />
            Paste
          </button>
        </div>
      </div>
    </div>
  );
}
