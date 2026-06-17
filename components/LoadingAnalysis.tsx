"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { LoaderCircle } from "lucide-react";

const steps = [
  "Reading the text",
  "Figuring out what it is",
  "Checking urgency",
  "Creating next steps",
];

export const LoadingAnalysis = () => {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const id = window.setInterval(() => {
      setIndex((current) => (current + 1) % steps.length);
    }, 900);

    return () => window.clearInterval(id);
  }, []);

  return (
    <section className="clearit-card flex min-h-72 flex-col justify-center">
      <div className="mb-4 flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1.1, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
          className="rounded-full bg-indigo-100 p-3 text-indigo-700"
        >
          <LoaderCircle size={24} />
        </motion.div>
      </div>
      <h2 className="text-center font-display text-xl font-semibold text-slate-900">Reading it…</h2>
      <p className="mt-2 text-center text-sm text-slate-600">
        ClearIt is creating a plain-English summary for you.
      </p>
      <div className="mt-5 space-y-2">
        {steps.map((step, stepIndex) => (
          <motion.div
            key={step}
            initial={{ opacity: 0.35 }}
            animate={{
              opacity: stepIndex <= index ? 1 : 0.35,
              scale: stepIndex === index ? 1.01 : 1,
            }}
            className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700"
          >
            {step}
          </motion.div>
        ))}
      </div>
    </section>
  );
};
