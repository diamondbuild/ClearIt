"use client";

import { motion } from "framer-motion";

export function LoadingAnalysis() {
  return (
    <div
      className="flex flex-col items-center justify-center min-h-screen px-6"
      style={{ background: "radial-gradient(ellipse 80% 60% at 50% 30%, rgba(108,60,224,.25) 0%, transparent 70%), #141019" }}
    >
      {/* Scanning card */}
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.4 }}
        className="relative overflow-hidden mb-8"
        style={{
          width: 178, height: 224,
          background: "#1E1826",
          borderRadius: 22,
          boxShadow: "0 18px 40px rgba(26,22,38,.5)",
        }}
      >
        {/* Skeleton lines */}
        <div className="p-4 flex flex-col gap-2.5 mt-2">
          <div className="h-3 rounded-full w-4/5" style={{ background: "#2A2138" }} />
          <div className="h-2.5 rounded-full w-full" style={{ background: "#2A2138" }} />
          <div className="h-2.5 rounded-full w-full" style={{ background: "#2A2138" }} />
          <div className="h-2.5 rounded-full w-3/4" style={{ background: "#2A2138" }} />
          <div className="h-2.5 rounded-full w-full" style={{ background: "#2A2138" }} />
          <div className="h-2.5 rounded-full w-4/5" style={{ background: "#2A2138" }} />
        </div>

        {/* Sweep band */}
        <div className="animate-sweep absolute left-0 right-0 h-14 pointer-events-none"
          style={{ background: "linear-gradient(180deg, transparent 0%, rgba(108,60,224,.35) 50%, transparent 100%)" }} />
      </motion.div>

      {/* Dots */}
      <div className="flex gap-2 mb-5">
        <span className="w-2.5 h-2.5 rounded-full animate-blip-1" style={{ background: "var(--violet-600)" }} />
        <span className="w-2.5 h-2.5 rounded-full animate-blip-2" style={{ background: "var(--violet-400)" }} />
        <span className="w-2.5 h-2.5 rounded-full animate-blip-3" style={{ background: "var(--coral-500)" }} />
      </div>

      {/* Text */}
      <h2
        className="text-2xl font-extrabold text-white text-center"
        style={{ fontFamily: "var(--font-bricolage), sans-serif", letterSpacing: "-0.01em" }}
      >
        Reading the details…
      </h2>
      <p className="text-sm mt-2 text-center" style={{ color: "#B7AECB" }}>
        Checking what it is, what it means,
        <br />and whether it&apos;s safe.
      </p>
    </div>
  );
}
