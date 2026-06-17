"use client";

import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import { Info, Moon, ShieldCheck, Trash2 } from "lucide-react";
import { ActionButton } from "@/components/ActionButton";
import { clearHistory } from "@/lib/storage/history";

const demoModeKey = "clearit.demoMode.v1";

function SettingsCard({ title, body, children }: { title: string; body?: string; children?: ReactNode }) {
  return (
    <section className="glass-card rounded-[2rem] p-5">
      <h2 className="text-lg font-black tracking-tight text-slate-950 dark:text-white">{title}</h2>
      {body ? <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">{body}</p> : null}
      {children ? <div className="mt-4">{children}</div> : null}
    </section>
  );
}

export default function SettingsPage() {
  const [demoMode, setDemoMode] = useState(false);
  const [cleared, setCleared] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => setDemoMode(window.localStorage.getItem(demoModeKey) === "true"), 0);
    return () => window.clearTimeout(timer);
  }, []);

  function toggleDemoMode() {
    const next = !demoMode;
    setDemoMode(next);
    window.localStorage.setItem(demoModeKey, String(next));
  }

  function handleClearHistory() {
    clearHistory();
    setCleared(true);
    window.setTimeout(() => setCleared(false), 1800);
  }

  return (
    <div className="space-y-4">
      <section className="px-1">
        <p className="text-sm font-black uppercase tracking-[0.18em] text-blue-700 dark:text-blue-300">Settings</p>
        <h1 className="mt-2 text-3xl font-black tracking-tight text-slate-950 dark:text-white">Simple controls</h1>
      </section>

      <SettingsCard title="Demo mode" body="Force realistic mock results even when an OpenAI key is configured. Useful for demos and UI testing.">
        <button
          type="button"
          onClick={toggleDemoMode}
          className="flex min-h-14 w-full items-center justify-between rounded-3xl border border-slate-200 bg-white p-2 pl-4 text-left dark:border-white/10 dark:bg-white/10"
          aria-pressed={demoMode}
        >
          <span className="font-black text-slate-800 dark:text-white">{demoMode ? "Demo mode is on" : "Demo mode is off"}</span>
          <span className={`relative h-9 w-16 rounded-full transition ${demoMode ? "bg-blue-700 dark:bg-blue-500" : "bg-slate-200 dark:bg-slate-700"}`}>
            <span className={`absolute top-1 size-7 rounded-full bg-white shadow transition ${demoMode ? "left-8" : "left-1"}`} />
          </span>
        </button>
      </SettingsCard>

      <SettingsCard title="Privacy note">
        <div className="flex gap-3 text-sm leading-6 text-slate-600 dark:text-slate-300">
          <ShieldCheck className="mt-0.5 size-5 shrink-0 text-teal-700 dark:text-teal-200" aria-hidden="true" />
          <p>
            ClearIt sends the content you analyze to our AI provider only to generate your explanation. Do not upload information you are not comfortable analyzing. The MVP does not permanently store uploaded images.
          </p>
        </div>
      </SettingsCard>

      <SettingsCard title="Clear history" body="Saved explanations are stored only in this browser's LocalStorage for the MVP.">
        <ActionButton type="button" variant="danger" className="w-full" onClick={handleClearHistory}>
          <Trash2 className="size-4" aria-hidden="true" />
          {cleared ? "History cleared" : "Clear history"}
        </ActionButton>
      </SettingsCard>

      <SettingsCard title="Display" body="ClearIt follows your device light or dark mode automatically.">
        <div className="flex items-center gap-3 rounded-3xl bg-slate-50 p-4 text-sm font-bold text-slate-700 dark:bg-white/5 dark:text-slate-200">
          <Moon className="size-5 text-blue-700 dark:text-blue-300" aria-hidden="true" />
          System theme support enabled
        </div>
      </SettingsCard>

      <SettingsCard title="About ClearIt">
        <div className="flex gap-3 text-sm leading-6 text-slate-600 dark:text-slate-300">
          <Info className="mt-0.5 size-5 shrink-0 text-blue-700 dark:text-blue-300" aria-hidden="true" />
          <p>
            ClearIt is a mobile-first MVP for turning confusing real-life items into plain-English explanations and safe next steps.
          </p>
        </div>
      </SettingsCard>

      <p className="px-2 text-center text-xs leading-5 text-slate-500 dark:text-slate-400">
        ClearIt helps explain information. It does not replace professional legal, medical, financial, tax, emergency, or other expert advice.
      </p>
    </div>
  );
}
