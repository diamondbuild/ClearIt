"use client";

import { useEffect, useState } from "react";
import {
  Trash2,
  ShieldCheck,
  Info,
  Lock,
  Moon,
  Type,
  Check,
  TriangleAlert,
} from "lucide-react";
import { ActionButton } from "@/components/ActionButton";
import { useTheme } from "@/components/ThemeProvider";
import { clearHistory, getHistory } from "@/lib/storage/history";

export default function SettingsPage() {
  const { theme, toggleTheme, seniorMode, setSeniorMode } = useTheme();
  const [count, setCount] = useState(0);
  const [cleared, setCleared] = useState(false);
  const [confirming, setConfirming] = useState(false);

  useEffect(() => {
    setCount(getHistory().length);
  }, []);

  const handleClear = () => {
    if (!confirming) {
      setConfirming(true);
      return;
    }
    clearHistory();
    setCount(0);
    setConfirming(false);
    setCleared(true);
    setTimeout(() => setCleared(false), 2500);
  };

  return (
    <div className="space-y-5 animate-fade-in">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight">Settings</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Manage your preferences and data.
        </p>
      </div>

      {/* Preferences */}
      <section className="overflow-hidden rounded-3xl border border-border bg-card shadow-soft">
        <ToggleRow
          icon={Moon}
          title="Dark mode"
          description="Easier on the eyes at night."
          checked={theme === "dark"}
          onChange={toggleTheme}
        />
        <div className="border-t border-border" />
        <ToggleRow
          icon={Type}
          title="Senior mode"
          description="Larger text for easier reading."
          checked={seniorMode}
          onChange={() => setSeniorMode(!seniorMode)}
        />
      </section>

      {/* Data */}
      <section className="rounded-3xl border border-border bg-card p-5 shadow-soft">
        <h2 className="mb-1 text-sm font-bold uppercase tracking-wide text-muted-foreground">
          Your data
        </h2>
        <p className="mb-4 text-sm text-muted-foreground">
          {count > 0
            ? `You have ${count} saved explanation${count === 1 ? "" : "s"} on this device.`
            : "You have no saved explanations."}
        </p>
        <ActionButton
          variant="danger"
          fullWidth
          icon={confirming ? TriangleAlert : Trash2}
          onClick={handleClear}
        >
          {cleared
            ? "History cleared"
            : confirming
              ? "Tap again to confirm"
              : "Clear history"}
        </ActionButton>
        {cleared ? (
          <p className="mt-2 flex items-center justify-center gap-1 text-xs text-accent">
            <Check className="h-3.5 w-3.5" /> All saved explanations removed.
          </p>
        ) : null}
      </section>

      {/* Privacy */}
      <InfoCard icon={Lock} title="Privacy">
        ClearIt sends the content you analyze to our AI provider only to generate
        your explanation. Do not upload information you are not comfortable
        analyzing. The MVP does not permanently store uploaded images.
      </InfoCard>

      {/* About */}
      <InfoCard icon={Info} title="About ClearIt">
        ClearIt turns confusing bills, forms, alerts, errors, and messages into
        plain English with safe next steps. Take a picture or paste text, and
        know what to do.
      </InfoCard>

      {/* Disclaimer */}
      <InfoCard icon={ShieldCheck} title="Disclaimer">
        ClearIt helps explain information. It does not replace professional
        legal, medical, financial, or emergency advice. For urgent or serious
        matters, contact the official sender or a qualified professional.
      </InfoCard>

      <p className="pb-2 text-center text-xs text-muted-foreground">
        ClearIt · MVP · v0.1.0
      </p>
    </div>
  );
}

function ToggleRow({
  icon: Icon,
  title,
  description,
  checked,
  onChange,
}: {
  icon: typeof Moon;
  title: string;
  description: string;
  checked: boolean;
  onChange: () => void;
}) {
  return (
    <div className="flex items-center justify-between gap-3 p-4">
      <div className="flex items-center gap-3">
        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-muted text-foreground">
          <Icon className="h-4.5 w-4.5" />
        </span>
        <div>
          <div className="text-sm font-semibold">{title}</div>
          <div className="text-xs text-muted-foreground">{description}</div>
        </div>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={title}
        onClick={onChange}
        className={`relative h-7 w-12 shrink-0 rounded-full transition ${
          checked ? "bg-primary" : "bg-muted-foreground/30"
        }`}
      >
        <span
          className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow transition ${
            checked ? "left-6" : "left-1"
          }`}
        />
      </button>
    </div>
  );
}

function InfoCard({
  icon: Icon,
  title,
  children,
}: {
  icon: typeof Info;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-3xl border border-border bg-card p-5 shadow-soft">
      <div className="mb-2 flex items-center gap-2">
        <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-muted text-foreground">
          <Icon className="h-4.5 w-4.5" />
        </span>
        <h2 className="text-sm font-bold">{title}</h2>
      </div>
      <p className="text-sm leading-relaxed text-muted-foreground">{children}</p>
    </section>
  );
}
