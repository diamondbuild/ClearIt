"use client";

import { ClipboardPaste } from "lucide-react";

export function PasteTextBox({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  return (
    <section className="glass-card rounded-[2rem] p-5">
      <div className="mb-4 flex items-start gap-3">
        <span className="grid size-10 shrink-0 place-items-center rounded-2xl bg-teal-50 text-teal-700 dark:bg-teal-400/10 dark:text-teal-200">
          <ClipboardPaste className="size-5" aria-hidden="true" />
        </span>
        <div>
          <h2 className="text-lg font-black tracking-tight text-slate-950 dark:text-white">Paste text instead</h2>
          <p className="mt-1 text-sm leading-6 text-slate-600 dark:text-slate-300">Works well for emails, texts, error messages, and notices.</p>
        </div>
      </div>
      <label className="sr-only" htmlFor="clearit-paste-text">
        Paste confusing message, letter, bill, or error
      </label>
      <textarea
        id="clearit-paste-text"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder="Paste the confusing message, letter, bill, or error here..."
        className="min-h-44 w-full resize-none rounded-3xl border border-slate-200 bg-white/80 p-4 text-base leading-7 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-400 focus:ring-4 focus:ring-blue-100 dark:border-white/10 dark:bg-slate-950/60 dark:text-white dark:focus:border-blue-300 dark:focus:ring-blue-300/10"
        maxLength={20000}
      />
      <div className="mt-2 text-right text-xs font-medium text-slate-500 dark:text-slate-400">{value.length.toLocaleString()} / 20,000</div>
    </section>
  );
}
