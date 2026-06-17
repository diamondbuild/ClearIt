"use client";

import { motion } from "framer-motion";
import { CheckCircle2, ScanText } from "lucide-react";

const steps = ["Reading the text", "Figuring out what it is", "Checking urgency", "Creating next steps"];

export function LoadingAnalysis() {
  return (
    <div className="glass-card rounded-[2.25rem] p-6 text-center">
      <motion.div
        className="mx-auto grid size-16 place-items-center rounded-[1.5rem] bg-blue-700 text-white shadow-xl shadow-blue-700/20 dark:bg-blue-500"
        animate={{ scale: [1, 1.04, 1], rotate: [0, -2, 2, 0] }}
        transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
      >
        <ScanText className="size-8" aria-hidden="true" />
      </motion.div>
      <h2 className="mt-5 text-2xl font-black tracking-tight text-slate-950 dark:text-white">Reading it...</h2>
      <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">ClearIt is turning this into plain English.</p>
      <div className="mt-6 space-y-3 text-left">
        {steps.map((step, index) => (
          <motion.div
            key={step}
            className="flex items-center gap-3 rounded-2xl bg-white/70 p-3 dark:bg-white/5"
            initial={{ opacity: 0.35, x: -8 }}
            animate={{ opacity: [0.45, 1, 0.75], x: 0 }}
            transition={{ duration: 1.4, repeat: Infinity, delay: index * 0.2 }}
          >
            <CheckCircle2 className="size-5 text-teal-600 dark:text-teal-300" aria-hidden="true" />
            <span className="text-sm font-bold text-slate-700 dark:text-slate-200">{step}</span>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
