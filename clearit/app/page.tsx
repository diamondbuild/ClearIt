"use client";

import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import {
  ShieldCheck,
  Camera,
  Type,
  Lock,
  BookOpen,
  ArrowRight,
} from "lucide-react";
import { AppShell } from "@/components/AppShell";

const exampleChips = [
  "Bill",
  "School form",
  "Insurance letter",
  "App error",
  "Bank alert",
  "Medical message",
  "Scam check",
  "Parking ticket",
];

const trustFeatures = [
  { icon: Lock, label: "Private by default" },
  { icon: BookOpen, label: "Plain English" },
  { icon: ShieldCheck, label: "Safe next steps" },
];

export default function HomePage() {
  const router = useRouter();

  return (
    <AppShell showWordmark>
      <div className="flex flex-col min-h-full px-4 pt-4 pb-6">
        {/* Hero */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="text-center pt-6 pb-8"
        >
          <div
            className="inline-flex items-center justify-center w-20 h-20 rounded-[1.5rem] mb-5 mx-auto"
            style={{
              background: "linear-gradient(135deg, #3730a3, #6366f1)",
              boxShadow: "0 8px 32px rgb(99 102 241 / 0.25)",
            }}
          >
            <ShieldCheck size={36} className="text-white" />
          </div>

          <h1
            className="text-3xl font-bold tracking-tight mb-2"
            style={{ color: "var(--foreground)" }}
          >
            ClearIt
          </h1>
          <p
            className="text-base font-medium mb-3"
            style={{ color: "var(--primary)" }}
          >
            Take a picture. Know what to do.
          </p>
          <p
            className="text-sm leading-relaxed max-w-xs mx-auto"
            style={{ color: "var(--muted-foreground)" }}
          >
            ClearIt explains confusing bills, forms, alerts, errors, and
            messages in plain English.
          </p>
        </motion.div>

        {/* Main CTA */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.4 }}
          className="flex flex-col gap-3 mb-6"
        >
          <button
            onClick={() => router.push("/analyze")}
            className="w-full flex items-center justify-center gap-3 py-4 rounded-2xl text-white text-base font-semibold transition-all active:scale-[0.98]"
            style={{
              background: "linear-gradient(135deg, #3730a3, #6366f1)",
              boxShadow: "0 4px 20px rgb(99 102 241 / 0.35)",
            }}
          >
            <Camera size={22} />
            Explain something
            <ArrowRight size={18} className="ml-1 opacity-75" />
          </button>

          <button
            onClick={() => router.push("/analyze?mode=text")}
            className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl text-sm font-semibold transition-all active:scale-[0.98] border"
            style={{
              background: "var(--card)",
              borderColor: "var(--border)",
              color: "var(--foreground)",
            }}
          >
            <Type size={18} />
            Paste text instead
          </button>
        </motion.div>

        {/* Example chips */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.25 }}
          className="mb-6"
        >
          <p
            className="text-xs font-semibold uppercase tracking-wider mb-3 text-center"
            style={{ color: "var(--muted-foreground)" }}
          >
            Works with
          </p>
          <div className="flex flex-wrap justify-center gap-2">
            {exampleChips.map((chip) => (
              <button
                key={chip}
                onClick={() => router.push("/analyze")}
                className="px-3 py-1.5 rounded-full text-sm font-medium transition-all active:scale-95 border"
                style={{
                  background: "var(--card)",
                  borderColor: "var(--border)",
                  color: "var(--foreground)",
                }}
              >
                {chip}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Trust strip */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.35 }}
          className="mb-6"
        >
          <div
            className="rounded-2xl p-4 border"
            style={{
              background: "var(--card)",
              borderColor: "var(--card-border)",
              boxShadow: "var(--shadow-sm)",
            }}
          >
            <div className="flex justify-around">
              {trustFeatures.map(({ icon: Icon, label }) => (
                <div
                  key={label}
                  className="flex flex-col items-center gap-2 flex-1"
                >
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center"
                    style={{ background: "var(--muted)" }}
                  >
                    <Icon size={20} style={{ color: "var(--primary)" }} />
                  </div>
                  <span
                    className="text-xs font-medium text-center leading-tight"
                    style={{ color: "var(--foreground)" }}
                  >
                    {label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Disclaimer */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-xs text-center leading-relaxed px-4"
          style={{ color: "var(--muted-foreground)" }}
        >
          ClearIt helps explain information. It does not replace professional
          legal, medical, financial, or emergency advice.
        </motion.p>
      </div>
    </AppShell>
  );
}
