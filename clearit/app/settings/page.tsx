"use client";

import { useState, useEffect } from "react";
import { ChevronRight, Focus } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { clearHistory, getHistory } from "@/lib/storage/history";

function Toggle({ on, onToggle }: { on: boolean; onToggle: () => void }) {
  return (
    <div className={`toggle-track ${on ? "on" : "off"}`} onClick={onToggle}>
      <div className="toggle-knob" />
    </div>
  );
}

export default function SettingsPage() {
  const [readAloud, setReadAloud] = useState(false);
  const [saveHistory, setSaveHistory] = useState(true);
  const [textSize, setTextSize] = useState(50);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [historyCount, setHistoryCount] = useState(0);

  useEffect(() => {
    setHistoryCount(getHistory().length);
    // Restore saved text size
    const saved = localStorage.getItem("clearit_text_size");
    if (saved === "small") setTextSize(16);
    else if (saved === "large") setTextSize(84);
    else setTextSize(50);
  }, []);

  const sizeLabel = textSize < 33 ? "Small" : textSize < 66 ? "Regular" : "Large";
  const sizePx: Record<string, string> = { small: "14px", regular: "16px", large: "18px" };

  const handleTextSizeChange = (val: number) => {
    setTextSize(val);
    const key = val < 33 ? "small" : val < 66 ? "regular" : "large";
    const px = sizePx[key];
    document.documentElement.style.fontSize = px;
    localStorage.setItem("clearit_text_size", key);
  };

  const handleClearHistory = () => {
    clearHistory();
    setHistoryCount(0);
    setShowClearConfirm(false);
  };

  return (
    <AppShell noHeader>
      <div className="px-5 pt-5 pb-8 safe-top">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-2xl flex items-center justify-center"
            style={{ background: "var(--brand-gradient)", boxShadow: "var(--brand-glow)" }}>
            <Focus size={18} className="text-white" strokeWidth={2.2} />
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight"
            style={{ fontFamily: "var(--font-bricolage), sans-serif", color: "var(--ink)", letterSpacing: "-0.02em" }}>
            Settings
          </h1>
        </div>

        <div className="flex flex-col gap-5">
          {/* Reading */}
          <Section label="Reading">
            <SettingRow label="Text size"
              right={
                <span className="text-sm font-semibold" style={{ color: "var(--violet-600)" }}>
                  {sizeLabel}
                </span>
              }>
              <div className="mt-3 relative">
                <div className="relative h-2 rounded-full" style={{ background: "var(--border)" }}>
                  <div className="absolute left-0 top-0 h-full rounded-full"
                    style={{ width: `${textSize}%`, background: "var(--brand-gradient)" }} />
                  <input type="range" min={0} max={100} value={textSize}
                    onChange={e => handleTextSizeChange(+e.target.value)}
                    className="absolute inset-0 w-full opacity-0 cursor-pointer h-full" />
                  <div className="absolute top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-white shadow-md border pointer-events-none"
                    style={{ left: `calc(${textSize}% - 10px)`, borderColor: "var(--border)" }} />
                </div>
                {/* Size labels */}
                <div className="flex justify-between mt-2">
                  {["Small", "Regular", "Large"].map(l => (
                    <span key={l} className="text-xs"
                      style={{ color: sizeLabel === l ? "var(--violet-600)" : "var(--muted)", fontWeight: sizeLabel === l ? 700 : 400 }}>
                      {l}
                    </span>
                  ))}
                </div>
              </div>
            </SettingRow>

            <div className="h-px" style={{ background: "var(--border)" }} />

            <SettingRow label="Read aloud"
              right={<Toggle on={readAloud} onToggle={() => setReadAloud(!readAloud)} />} />
          </Section>

          {/* Privacy */}
          <Section label="Privacy">
            <SettingRow label="Save history on device"
              right={<Toggle on={saveHistory} onToggle={() => setSaveHistory(!saveHistory)} />} />

            <div className="h-px" style={{ background: "var(--border)" }} />

            <button onClick={() => setShowClearConfirm(true)} className="w-full flex items-center justify-between py-3.5">
              <span className="text-sm font-semibold" style={{ color: "var(--u-scam-text)" }}>
                Clear all history {historyCount > 0 && `(${historyCount})`}
              </span>
              <ChevronRight size={16} style={{ color: "var(--muted)" }} />
            </button>
          </Section>

          {/* About */}
          <Section label="About">
            <div className="py-3.5">
              <p className="text-sm leading-relaxed" style={{ color: "var(--muted)" }}>
                LetsConfirmIt explains confusing real-world things in plain English — bills, memes, pills, letters, errors, and more.
              </p>
            </div>
          </Section>

          {/* Footer */}
          <p className="text-xs text-center" style={{ color: "var(--muted)" }}>
            LetsConfirmIt v2.0 · Explains information.
            <br />Not legal, medical, or financial advice.
          </p>
        </div>
      </div>

      {/* Clear history confirm */}
      {showClearConfirm && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-3xl p-6 flex flex-col gap-4"
            style={{ background: "var(--surface)" }}>
            <h3 className="text-base font-bold" style={{ color: "var(--ink)" }}>Clear all history?</h3>
            <p className="text-sm" style={{ color: "var(--muted)" }}>
              This will permanently delete all saved answers from this device.
            </p>
            <div className="flex gap-2">
              <button onClick={() => setShowClearConfirm(false)}
                className="flex-1 py-3 rounded-2xl text-sm font-semibold border"
                style={{ background: "var(--surface)", borderColor: "var(--border)", color: "var(--ink)" }}>
                Cancel
              </button>
              <button onClick={handleClearHistory}
                className="flex-1 py-3 rounded-2xl text-sm font-bold text-white"
                style={{ background: "var(--u-scam-dot)" }}>
                Clear all
              </button>
            </div>
          </div>
        </div>
      )}
    </AppShell>
  );
}

function Section({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="text-xs font-bold uppercase tracking-widest mb-2 px-0.5"
        style={{ color: "var(--muted)", letterSpacing: "0.1em" }}>
        {label}
      </p>
      <div className="rounded-2xl border overflow-hidden px-4"
        style={{ background: "var(--surface)", borderColor: "var(--border)" }}>
        {children}
      </div>
    </div>
  );
}

function SettingRow({ label, right, children }: {
  label: string; right?: React.ReactNode; children?: React.ReactNode;
}) {
  return (
    <div className="py-3.5">
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold" style={{ color: "var(--ink)" }}>{label}</p>
        {right}
      </div>
      {children}
    </div>
  );
}
