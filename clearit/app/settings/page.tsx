"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Shield,
  Trash2,
  Info,
  ChevronRight,
  ShieldCheck,
  ExternalLink,
  ToggleLeft,
  ToggleRight,
} from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { clearHistory, getHistory } from "@/lib/storage/history";

export default function SettingsPage() {
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [cleared, setCleared] = useState(false);
  const [demoMode, setDemoMode] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("clearit_demo_mode") === "true";
    }
    return false;
  });

  const historyCount = typeof window !== "undefined" ? getHistory().length : 0;

  const handleClearHistory = () => {
    clearHistory();
    setCleared(true);
    setShowClearConfirm(false);
    setTimeout(() => setCleared(false), 2000);
  };

  const toggleDemoMode = () => {
    const next = !demoMode;
    setDemoMode(next);
    localStorage.setItem("clearit_demo_mode", next ? "true" : "false");
  };

  return (
    <AppShell title="Settings">
      <div className="px-4 pt-4 pb-6 flex flex-col gap-6">
        {/* App info */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center py-6"
        >
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center mb-3"
            style={{
              background: "linear-gradient(135deg, #3730a3, #6366f1)",
              boxShadow: "0 8px 24px rgb(99 102 241 / 0.25)",
            }}
          >
            <ShieldCheck size={28} className="text-white" />
          </div>
          <h2
            className="text-lg font-bold mb-1"
            style={{ color: "var(--foreground)" }}
          >
            ClearIt
          </h2>
          <p className="text-sm" style={{ color: "var(--muted-foreground)" }}>
            Take a picture. Know what to do.
          </p>
          <p
            className="text-xs mt-1"
            style={{ color: "var(--muted-foreground)" }}
          >
            MVP v1.0
          </p>
        </motion.div>

        {/* Settings sections */}
        <Section title="Privacy & data">
          <SettingRow
            icon={<Shield size={18} style={{ color: "var(--primary)" }} />}
            label="Privacy"
            description="ClearIt sends your content to our AI provider only to generate your explanation."
          />

          <SettingRow
            icon={<Trash2 size={18} className="text-red-500" />}
            label={`Clear history (${historyCount} saved)`}
            description="Remove all saved analyses from this device."
            onClick={() => setShowClearConfirm(true)}
            chevron
            danger
          />

          <AnimatePresence>
            {cleared && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-sm text-emerald-600 font-medium px-1"
              >
                ✓ History cleared.
              </motion.p>
            )}
          </AnimatePresence>
        </Section>

        <Section title="App preferences">
          <div className="flex items-center justify-between py-3">
            <div className="flex-1">
              <p
                className="text-sm font-semibold"
                style={{ color: "var(--foreground)" }}
              >
                Demo mode
              </p>
              <p
                className="text-xs mt-0.5"
                style={{ color: "var(--muted-foreground)" }}
              >
                Use realistic examples without an API key.
              </p>
            </div>
            <button
              onClick={toggleDemoMode}
              className="ml-4 transition-all"
              style={{ color: demoMode ? "var(--primary)" : "var(--muted-foreground)" }}
            >
              {demoMode ? (
                <ToggleRight size={28} />
              ) : (
                <ToggleLeft size={28} />
              )}
            </button>
          </div>
        </Section>

        <Section title="About ClearIt">
          <div className="py-2">
            <p
              className="text-sm leading-relaxed"
              style={{ color: "var(--muted-foreground)" }}
            >
              ClearIt is a plain-English explanation tool. Upload or paste
              confusing documents, bills, forms, or messages — and get a clear,
              simple explanation with safe next steps.
            </p>
          </div>

          <SettingRow
            icon={<ExternalLink size={18} style={{ color: "var(--primary)" }} />}
            label="Deploy to Vercel"
            description="Deploy your own ClearIt instance."
            chevron
          />
        </Section>

        {/* Disclaimer */}
        <div
          className="rounded-2xl p-4 border"
          style={{
            background: "var(--card)",
            borderColor: "var(--card-border)",
          }}
        >
          <div className="flex items-start gap-2 mb-2">
            <Info size={16} style={{ color: "var(--muted-foreground)" }} className="flex-shrink-0 mt-0.5" />
            <p
              className="text-xs font-semibold"
              style={{ color: "var(--foreground)" }}
            >
              Disclaimer
            </p>
          </div>
          <p
            className="text-xs leading-relaxed"
            style={{ color: "var(--muted-foreground)" }}
          >
            ClearIt helps explain information. It does not replace professional
            legal, medical, financial, or emergency advice. The MVP does not
            permanently store uploaded images. Do not upload information you are
            not comfortable analyzing.
          </p>
        </div>

        <p
          className="text-xs text-center"
          style={{ color: "var(--muted-foreground)" }}
        >
          Made with care. Not affiliated with any financial, legal, or medical institution.
        </p>
      </div>

      {/* Clear history confirm */}
      {showClearConfirm && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-4">
          <motion.div
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="w-full max-w-md rounded-2xl p-6 flex flex-col gap-4"
            style={{ background: "var(--card)" }}
          >
            <div>
              <h3
                className="text-base font-bold mb-1"
                style={{ color: "var(--foreground)" }}
              >
                Clear all history?
              </h3>
              <p className="text-sm" style={{ color: "var(--muted-foreground)" }}>
                This will permanently delete all saved analyses from this device. This cannot be undone.
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setShowClearConfirm(false)}
                className="flex-1 py-3 rounded-xl text-sm font-semibold border"
                style={{
                  background: "var(--card)",
                  borderColor: "var(--border)",
                  color: "var(--foreground)",
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleClearHistory}
                className="flex-1 py-3 rounded-xl text-sm font-semibold text-white bg-red-500"
              >
                Clear all
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AppShell>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <p
        className="text-xs font-semibold uppercase tracking-wider mb-2 px-1"
        style={{ color: "var(--muted-foreground)" }}
      >
        {title}
      </p>
        <div
        className="rounded-2xl border overflow-hidden"
        style={{
          background: "var(--card)",
          borderColor: "var(--card-border)",
        }}
      >
        <div className="flex flex-col divide-y" style={{ borderColor: "var(--border)" }}>
          {children}
        </div>
      </div>
    </div>
  );
}

function SettingRow({
  icon,
  label,
  description,
  onClick,
  chevron,
  danger,
}: {
  icon: React.ReactNode;
  label: string;
  description?: string;
  onClick?: () => void;
  chevron?: boolean;
  danger?: boolean;
}) {
  const Wrapper = onClick ? "button" : "div";

  return (
    <Wrapper
      onClick={onClick}
      className="flex items-center gap-3 w-full text-left py-3 px-4 transition-all"
      style={onClick ? { cursor: "pointer" } : undefined}
    >
      <div className="flex-shrink-0">{icon}</div>
      <div className="flex-1">
        <p
          className="text-sm font-semibold"
          style={{ color: danger ? "#ef4444" : "var(--foreground)" }}
        >
          {label}
        </p>
        {description && (
          <p
            className="text-xs mt-0.5 leading-relaxed"
            style={{ color: "var(--muted-foreground)" }}
          >
            {description}
          </p>
        )}
      </div>
      {chevron && (
        <ChevronRight size={16} style={{ color: "var(--muted-foreground)" }} />
      )}
    </Wrapper>
  );
}
