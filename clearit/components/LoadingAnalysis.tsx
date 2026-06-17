"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ShieldCheck } from "lucide-react";

const steps = [
  { label: "Reading the content…", emoji: "📖" },
  { label: "Figuring out what it is…", emoji: "🔍" },
  { label: "Checking urgency…", emoji: "⚡" },
  { label: "Creating next steps…", emoji: "✅" },
];

export function LoadingAnalysis() {
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentStep((prev) => (prev < steps.length - 1 ? prev + 1 : prev));
    }, 900);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-6">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="flex flex-col items-center gap-8"
      >
        {/* Animated logo */}
        <div className="relative">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
            className="w-20 h-20 rounded-2xl flex items-center justify-center"
            style={{
              background: "linear-gradient(135deg, var(--primary), #6366f1)",
              boxShadow: "0 8px 32px rgb(99 102 241 / 0.3)",
            }}
          >
            <ShieldCheck size={36} className="text-white" />
          </motion.div>
          <motion.div
            animate={{ scale: [1, 1.3, 1], opacity: [0.4, 0, 0.4] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="absolute inset-0 rounded-2xl"
            style={{ background: "var(--primary)", opacity: 0.2 }}
          />
        </div>

        <div className="text-center">
          <h2
            className="text-xl font-bold mb-1"
            style={{ color: "var(--foreground)" }}
          >
            Clearing this up…
          </h2>
          <p
            className="text-sm"
            style={{ color: "var(--muted-foreground)" }}
          >
            Just a moment.
          </p>
        </div>

        <div className="flex flex-col gap-3 w-full max-w-xs">
          {steps.map((step, i) => (
            <motion.div
              key={step.label}
              initial={{ opacity: 0, x: -12 }}
              animate={{
                opacity: i <= currentStep ? 1 : 0.3,
                x: 0,
              }}
              transition={{ delay: i * 0.15 }}
              className="flex items-center gap-3 px-4 py-3 rounded-xl"
              style={{
                background:
                  i === currentStep
                    ? "var(--primary)"
                    : i < currentStep
                    ? "var(--muted)"
                    : "transparent",
                border: "1px solid",
                borderColor:
                  i === currentStep
                    ? "transparent"
                    : i < currentStep
                    ? "var(--border)"
                    : "transparent",
              }}
            >
              <span className="text-lg leading-none">{step.emoji}</span>
              <span
                className="text-sm font-medium"
                style={{
                  color:
                    i === currentStep
                      ? "white"
                      : i < currentStep
                      ? "var(--foreground)"
                      : "var(--muted-foreground)",
                }}
              >
                {step.label}
              </span>
              {i < currentStep && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="ml-auto text-emerald-600 text-sm"
                >
                  ✓
                </motion.span>
              )}
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
