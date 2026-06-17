"use client";

import { useState } from "react";
import { Info, Shield } from "lucide-react";

import { AppShell } from "@/components/AppShell";
import { clearHistory, getDemoMode, setDemoMode } from "@/lib/storage/history";

export default function SettingsPage() {
  const [demoMode, setDemoModeState] = useState(() =>
    typeof window !== "undefined" ? getDemoMode() : false,
  );
  const [historyCleared, setHistoryCleared] = useState(false);

  const onToggleDemoMode = (enabled: boolean) => {
    setDemoModeState(enabled);
    setDemoMode(enabled);
  };

  const onClearHistory = () => {
    clearHistory();
    setHistoryCleared(true);
    window.setTimeout(() => setHistoryCleared(false), 2200);
  };

  return (
    <AppShell className="space-y-4">
      <section className="clearit-card">
        <h1 className="font-display text-2xl font-semibold text-slate-900">Settings</h1>
      </section>

      <section className="clearit-card">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-semibold text-slate-900">Demo mode</h2>
            <p className="text-sm text-slate-600">
              Use realistic mock results, even if an API key is set.
            </p>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={demoMode}
            onClick={() => onToggleDemoMode(!demoMode)}
            className={`relative h-7 w-12 rounded-full transition ${
              demoMode ? "bg-indigo-600" : "bg-slate-300"
            }`}
          >
            <span
              className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow transition ${
                demoMode ? "left-6" : "left-1"
              }`}
            />
          </button>
        </div>
      </section>

      <section className="clearit-card">
        <h2 className="text-base font-semibold text-slate-900">Privacy note</h2>
        <p className="mt-2 text-sm text-slate-700">
          ClearIt sends the content you analyze to our AI provider only to generate your
          explanation. Do not upload information you are not comfortable analyzing. The MVP does
          not permanently store uploaded images.
        </p>
      </section>

      <section className="clearit-card">
        <h2 className="text-base font-semibold text-slate-900">About ClearIt</h2>
        <p className="mt-2 text-sm text-slate-700">
          ClearIt helps you understand confusing real-world messages and documents in plain
          English, with practical next steps and safety warnings.
        </p>
      </section>

      <section className="clearit-card">
        <h2 className="text-base font-semibold text-slate-900">Disclaimer</h2>
        <p className="mt-2 text-sm text-slate-700">
          ClearIt helps explain information and does not replace legal, medical, financial, tax, or
          emergency advice.
        </p>
      </section>

      <button type="button" className="clearit-secondary-btn w-full justify-center" onClick={onClearHistory}>
        Clear history
      </button>
      {historyCleared ? (
        <p className="text-center text-xs text-emerald-700">History cleared.</p>
      ) : null}

      <section className="rounded-2xl border border-slate-200 bg-white/80 p-4 text-xs text-slate-600">
        <div className="mb-2 flex items-center gap-2 text-slate-700">
          <Shield size={14} />
          <Info size={14} />
        </div>
        Keep using official channels for payments, account access, and urgent matters.
      </section>
    </AppShell>
  );
}
