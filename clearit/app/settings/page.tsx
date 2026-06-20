"use client";

import { useState, useEffect } from "react";
import { ChevronRight, Focus, LogOut, Loader2 } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { clearHistory, getHistory } from "@/lib/storage/history";
import { useDarkMode } from "@/lib/theme";
import { useAuth } from "@/components/AuthProvider";

function GoogleMark() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
      <path fill="#4285F4" d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84a4.14 4.14 0 0 1-1.8 2.72v2.26h2.92c1.71-1.57 2.68-3.89 2.68-6.62z"/>
      <path fill="#34A853" d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.92-2.26c-.81.54-1.85.86-3.04.86-2.34 0-4.32-1.58-5.03-3.7H.96v2.33A9 9 0 0 0 9 18z"/>
      <path fill="#FBBC05" d="M3.97 10.72a5.4 5.4 0 0 1 0-3.44V4.95H.96a9 9 0 0 0 0 8.1l3.01-2.33z"/>
      <path fill="#EA4335" d="M9 3.58c1.32 0 2.5.45 3.44 1.35l2.58-2.58C13.46.89 11.43 0 9 0A9 9 0 0 0 .96 4.95l3.01 2.33C4.68 5.16 6.66 3.58 9 3.58z"/>
    </svg>
  );
}

function AccountSection() {
  const { user, loading, authEnabled, signInWithGoogle, signOut } = useAuth();
  const [busy, setBusy] = useState(false);

  if (!authEnabled) return null;

  const handleSignIn = async () => {
    setBusy(true);
    try { await signInWithGoogle(); } finally { setBusy(false); }
  };

  return (
    <div>
      <p className="text-xs font-bold uppercase tracking-widest mb-2 px-0.5"
        style={{ color: "var(--muted)", letterSpacing: "0.1em" }}>
        Account
      </p>
      <div className="rounded-2xl border overflow-hidden px-4"
        style={{ background: "var(--surface)", borderColor: "var(--border)" }}>
        {loading ? (
          <div className="py-4 flex items-center gap-2" style={{ color: "var(--muted)" }}>
            <Loader2 size={16} className="animate-spin" />
            <span className="text-sm">Checking sign-in…</span>
          </div>
        ) : user ? (
          <div className="py-3.5 flex items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="text-sm font-semibold truncate" style={{ color: "var(--ink)" }}>
                {(user.user_metadata?.full_name as string) || "Signed in"}
              </p>
              <p className="text-xs truncate" style={{ color: "var(--muted)" }}>
                {user.email}
              </p>
            </div>
            <button onClick={() => signOut()}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-semibold flex-shrink-0 border"
              style={{ background: "var(--surface-2)", borderColor: "var(--border)", color: "var(--ink)" }}>
              <LogOut size={15} /> Sign out
            </button>
          </div>
        ) : (
          <div className="py-3.5">
            <button onClick={handleSignIn} disabled={busy}
              className="w-full flex items-center justify-center gap-2.5 py-3 rounded-2xl text-sm font-semibold border transition-all active:scale-[0.98] disabled:opacity-60"
              style={{ background: "var(--bg)", borderColor: "var(--border)", color: "var(--ink)" }}>
              {busy ? <Loader2 size={16} className="animate-spin" /> : <GoogleMark />}
              Continue with Google
            </button>
            <p className="text-xs mt-2 text-center" style={{ color: "var(--muted)" }}>
              Sign in to sync your history across devices.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

function Toggle({ on, onToggle }: { on: boolean; onToggle: () => void }) {
  return (
    <div className={`toggle-track ${on ? "on" : "off"}`} onClick={onToggle}>
      <div className="toggle-knob" />
    </div>
  );
}

export default function SettingsPage() {
  const { dark, set: setDark } = useDarkMode();
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
          {/* Account */}
          <AccountSection />

          {/* Appearance */}
          <Section label="Appearance">
            <SettingRow label="Dark mode"
              right={<Toggle on={dark} onToggle={() => setDark(!dark)} />} />
          </Section>

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
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 p-4">
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
