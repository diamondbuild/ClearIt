"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  Camera,
  ClipboardPaste,
  Lock,
  MessageSquareText,
  ListChecks,
  ArrowRight,
  ShieldCheck,
} from "lucide-react";

const exampleChips = [
  "Bill",
  "School form",
  "Insurance letter",
  "App error",
  "Bank alert",
  "Medical message",
  "Scam check",
];

const trustItems = [
  { icon: Lock, label: "Private by default" },
  { icon: MessageSquareText, label: "Plain English" },
  { icon: ListChecks, label: "Safe next steps" },
];

export default function HomePage() {
  const router = useRouter();

  const goAnalyze = (example?: string) => {
    if (example) {
      router.push(`/analyze?example=${encodeURIComponent(example)}`);
    } else {
      router.push("/analyze");
    }
  };

  return (
    <div className="space-y-7 animate-fade-in">
      <motion.section
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="pt-4 text-center"
      >
        <span className="mx-auto mb-4 inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-xs font-medium text-muted-foreground shadow-soft">
          <ShieldCheck className="h-3.5 w-3.5 text-accent" />
          Trusted plain-English explainer
        </span>
        <h1 className="text-balance text-3xl font-extrabold leading-tight tracking-tight">
          Take a picture.
          <br />
          Know what to do.
        </h1>
        <p className="mx-auto mt-3 max-w-xs text-pretty text-[15px] leading-relaxed text-muted-foreground">
          ClearIt explains confusing bills, forms, alerts, errors, and messages
          in plain English.
        </p>
      </motion.section>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.08 }}
        className="space-y-3"
      >
        <button
          onClick={() => goAnalyze()}
          className="group flex w-full items-center justify-center gap-2.5 rounded-2xl bg-primary px-5 py-4 text-base font-semibold text-primary-foreground shadow-glow transition hover:brightness-110 active:brightness-95"
        >
          <Camera className="h-5 w-5" />
          Explain something
          <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
        </button>
        <button
          onClick={() => router.push("/analyze?mode=text")}
          className="flex w-full items-center justify-center gap-2.5 rounded-2xl border border-border bg-card px-5 py-3.5 text-[15px] font-semibold text-foreground shadow-soft transition hover:bg-muted"
        >
          <ClipboardPaste className="h-4.5 w-4.5" />
          Paste text instead
        </button>
      </motion.div>

      <section>
        <p className="mb-2.5 px-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Try an example
        </p>
        <div className="flex flex-wrap gap-2">
          {exampleChips.map((chip) => (
            <button
              key={chip}
              onClick={() => goAnalyze(chip)}
              className="rounded-full border border-border bg-card px-3.5 py-1.5 text-sm font-medium text-foreground shadow-soft transition hover:border-primary/40 hover:bg-primary/5 active:scale-95"
            >
              {chip}
            </button>
          ))}
        </div>
      </section>

      <section className="rounded-2xl border border-border bg-card p-4 shadow-soft">
        <div className="grid grid-cols-3 gap-2">
          {trustItems.map(({ icon: Icon, label }) => (
            <div
              key={label}
              className="flex flex-col items-center gap-2 text-center"
            >
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-accent/10 text-accent">
                <Icon className="h-4.5 w-4.5" />
              </span>
              <span className="text-[11px] font-medium leading-tight text-muted-foreground">
                {label}
              </span>
            </div>
          ))}
        </div>
      </section>

      <p className="px-2 text-center text-xs leading-relaxed text-muted-foreground">
        ClearIt helps explain information. It does not replace professional
        legal, medical, financial, or emergency advice.
      </p>

      <div className="text-center">
        <Link
          href="/history"
          className="text-sm font-medium text-primary underline-offset-4 hover:underline"
        >
          View your saved explanations
        </Link>
      </div>
    </div>
  );
}
