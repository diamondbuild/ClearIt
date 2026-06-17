"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Check, Loader2, ScanText, Search, ShieldCheck, ListChecks } from "lucide-react";
import { cn } from "@/lib/utils";

const steps = [
  { label: "Reading the text", icon: ScanText },
  { label: "Figuring out what it is", icon: Search },
  { label: "Checking urgency", icon: ShieldCheck },
  { label: "Creating next steps", icon: ListChecks },
];

export function LoadingAnalysis({ done }: { done?: boolean }) {
  const [active, setActive] = useState(0);

  useEffect(() => {
    if (done) {
      setActive(steps.length);
      return;
    }
    const timer = setInterval(() => {
      setActive((a) => (a < steps.length - 1 ? a + 1 : a));
    }, 850);
    return () => clearInterval(timer);
  }, [done]);

  return (
    <div className="flex flex-col items-center pt-10 animate-fade-in">
      <motion.div
        animate={{ scale: [1, 1.06, 1] }}
        transition={{ repeat: Infinity, duration: 2 }}
        className="mb-6 flex h-16 w-16 items-center justify-center rounded-3xl bg-primary text-primary-foreground shadow-glow"
      >
        <ShieldCheck className="h-8 w-8" />
      </motion.div>
      <h2 className="text-xl font-bold">Reading it…</h2>
      <p className="mt-1 text-sm text-muted-foreground">
        Hang tight — this only takes a moment.
      </p>

      <div className="mt-8 w-full max-w-sm space-y-2.5">
        {steps.map((step, i) => {
          const isDone = i < active || done;
          const isActive = i === active && !done;
          const Icon = step.icon;
          return (
            <motion.div
              key={step.label}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.08 }}
              className={cn(
                "flex items-center gap-3 rounded-2xl border px-4 py-3 transition",
                isDone
                  ? "border-accent/30 bg-accent/5"
                  : isActive
                    ? "border-primary/30 bg-primary/5"
                    : "border-border bg-card",
              )}
            >
              <span
                className={cn(
                  "flex h-9 w-9 items-center justify-center rounded-xl transition",
                  isDone
                    ? "bg-accent text-accent-foreground"
                    : isActive
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground",
                )}
              >
                {isDone ? (
                  <Check className="h-4.5 w-4.5" />
                ) : isActive ? (
                  <Loader2 className="h-4.5 w-4.5 animate-spin" />
                ) : (
                  <Icon className="h-4.5 w-4.5" />
                )}
              </span>
              <span
                className={cn(
                  "text-sm font-medium",
                  !isDone && !isActive && "text-muted-foreground",
                )}
              >
                {step.label}
              </span>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
