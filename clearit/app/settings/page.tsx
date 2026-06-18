"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ChevronRight, Focus } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { clearHistory, getHistory } from "@/lib/storage/history";

type Theme = "light" | "dark" | "auto";

function Toggle({ on, onToggle }: { on: boolean; onToggle: () => void }) {
  return (
    <div className={`toggle-track ${on ? "on" : "off"}`} onClick={onToggle}>
      <div className="toggle-knob" />
    </div>
  );
}

function SegmentedControl({ options, value, onChange }: {
  options: { label: string; value: string }[];
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="flex rounded-2xl p-1 gap-1" style={{ background: "var(--surface-2)" }}>
      {options.map(opt => (
        <button key={opt.value} onClick={() => onChange(opt.value)}
          className="flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all"
          style={value === opt.value
            ? { background: "var(--brand-gradient)", color: "#fff" }
            : { color: "var(--muted)" }}>
          {opt.label}
        </button>
      ))}
    </div>
  );
}

export default function SettingsPage() {
  const router = useRouter();
  const [theme, setTheme] = useState<Theme>("auto");
  const [readAloud, setReadAloud] = useState(false);
  const [saveHistory, setSaveHistory] = useState(true);
  const [textSize, setTextSize] = useState(50);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [historyCount, setHistoryCount] = useState(0);

  useEffect(() => {
    setHistoryCount(getHistory().length);
    const stored = localStorage.getItem("clearit_theme") as Theme | null;
    if (stored) setTheme(stored);
  }, []);

  const handleThemeChange = (v: string) => {
    setTheme(v as Theme);
    localStorage.setItem("clearit_theme", v);
    if (v === "dark") document.documentElement.classList.add("dark");
    else if (v === "light") document.documentElement.classList.remove("dark");
    else {
      if (window.matchMedia("(prefers-color-scheme: dark)").matches) document.documentElement.classList.add("dark");
      else document.documentElement.classList.remove("dark");
    }
  };

  const handleClearHistory = () => {
    clearHistory();
    setHistoryCount(0);
    setShowClearConfirm(false);
  };

  const isDark = theme === "dark";

  return (
    <AppShell noHeader dark={isDark}>
      <div
        className="px-5 pt-5 pb-8 safe-top"
        style={{ background: isDark ? "var(--bg)" : "var(--bg)" }}
      >
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-2xl flex items-center justify-center"
            style={{ background: "var(--brand-gradient)", boxShadow: "var(--brand-glow)" }}>
            <Focus size={18} className="text-white" strokeWidth={2.2} />
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight"
            style={{ fontFamily: "var(--font-bricolage), sans-serif", color: isDark ? "#fff" : "var(--ink)", letterSpacing: "-0.02em" }}>
            Settings
          </h1>
        </div>

        <div className="flex flex-col gap-5">
          {/* Appearance */}
          <Section label="Appearance" dark={isDark}>
            <SettingRow label="Theme" dark={isDark}>
              <SegmentedControl
                options={[{ label: "Light", value: "light" }, { label: "Dark", value: "dark" }, { label: "Auto", value: "auto" }]}
                value={theme}
                onChange={handleThemeChange}
              />
            </SettingRow>
          </Section>

          {/* Reading */}
          <Section label="Reading" dark={isDark}>
            <SettingRow label="Text size" dark={isDark}
              right={<span className="text-sm font-semibold" style={{ color: isDark ? "var(--violet-400)" : "var(--violet-600)" }}>
                {textSize < 33 ? "Small" : textSize < 66 ? "Regular" : "Large"}
              </span>}>
              <div className="mt-3">
                <div className="relative h-2 rounded-full" style={{ background: "var(--border)" }}>
                  <div className="absolute left-0 top-0 h-full rounded-full"
                    style={{ width: `${textSize}%`, background: "var(--brand-gradient)" }} />
                  <input type="range" min={0} max={100} value={textSize} onChange={e => setTextSize(+e.target.value)}
                    className="absolute inset-0 w-full opacity-0 cursor-pointer h-full" />
                  <div className="absolute top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-white shadow-md border"
                    style={{ left: `calc(${textSize}% - 10px)`, borderColor: "var(--border)", pointerEvents: "none" }} />
                </div>
              </div>
            </SettingRow>

            <div className="h-px my-1" style={{ background: "var(--border)" }} />

            <SettingRow label="Read aloud" dark={isDark}
              right={<Toggle on={readAloud} onToggle={() => setReadAloud(!readAloud)} />} />
          </Section>

          {/* Privacy */}
          <Section label="Privacy" dark={isDark}>
            <SettingRow label="Save history on device" dark={isDark}
              right={<Toggle on={saveHistory} onToggle={() => setSaveHistory(!saveHistory)} />} />

            <div className="h-px my-1" style={{ background: "var(--border)" }} />

            <button onClick={() => setShowClearConfirm(true)} className="w-full flex items-center justify-between py-3">
              <span className="text-sm font-semibold" style={{ color: "var(--u-scam-text)" }}>
                Clear all history {historyCount > 0 && `(${historyCount})`}
              </span>
              <ChevronRight size={16} style={{ color: "var(--muted)" }} />
            </button>
          </Section>

          {/* Footer */}
          <p className="text-xs text-center" style={{ color: "var(--muted)" }}>
            ClearIt v2.0 · Explains information.
            <br />Not legal, medical, or financial advice.
          </p>
        </div>
      </div>

      {/* Clear history confirm */}
      {showClearConfirm && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-3xl p-6 flex flex-col gap-4"
            style={{ background: "var(--surface)" }}>
            <h3 className="text-base font-bold" style={{ color: "var(--ink)" }}>Clear all history?</h3>
            <p className="text-sm" style={{ color: "var(--muted)" }}>This will permanently delete all saved answers from this device.</p>
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

function Section({ label, children, dark }: { label: string; children: React.ReactNode; dark: boolean }) {
  return (
    <div>
      <p className="text-xs font-bold uppercase tracking-widest mb-2 px-0.5"
        style={{ color: "var(--muted)", letterSpacing: "0.1em" }}>
        {label}
      </p>
      <div className="rounded-2xl border overflow-hidden"
        style={{ background: dark ? "var(--surface)" : "var(--surface)", borderColor: "var(--border)" }}>
        <div className="divide-y px-4" style={{ borderColor: "var(--border)" }}>
          {children}
        </div>
      </div>
    </div>
  );
}

function SettingRow({ label, right, children, dark }: {
  label: string; right?: React.ReactNode; children?: React.ReactNode; dark: boolean;
}) {
  return (
    <div className="py-3.5">
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold" style={{ color: dark ? "#F5F0FF" : "var(--ink)" }}>{label}</p>
        {right}
      </div>
      {children}
    </div>
  );
}
