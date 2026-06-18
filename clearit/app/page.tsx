"use client";

import { useRouter } from "next/navigation";
import { Camera, Image as ImageIcon, ScanLine, Focus, User } from "lucide-react";
import { BottomNav } from "@/components/BottomNav";
import { motion } from "framer-motion";

const chips = [
  "Is this a scam?",
  "Explain this bill",
  "What is this pill?",
  "Who is this?",
  "What is this error?",
];

export default function HomePage() {
  const router = useRouter();

  return (
    <div
      className="flex flex-col min-h-screen max-w-md mx-auto relative overflow-hidden"
      style={{
        background: "radial-gradient(ellipse 80% 60% at 50% 20%, rgba(108,60,224,.35) 0%, transparent 70%), #141019",
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-5 pt-4 pb-2 safe-top">
        <div className="flex items-center gap-2.5">
          <div
            className="w-8 h-8 rounded-[10px] flex items-center justify-center"
            style={{ background: "var(--brand-gradient)", boxShadow: "var(--brand-glow)" }}
          >
            <Focus size={16} className="text-white" strokeWidth={2.2} />
          </div>
          <span
            className="text-xl font-extrabold tracking-tight text-white"
            style={{ fontFamily: "var(--font-bricolage), sans-serif" }}
          >
            ClearIt
          </span>
        </div>
        <button
          className="w-9 h-9 rounded-full flex items-center justify-center"
          style={{ background: "rgba(255,255,255,.1)" }}
          onClick={() => router.push("/settings")}
        >
          <User size={18} className="text-white" strokeWidth={2} />
        </button>
      </div>

      {/* Viewfinder */}
      <div className="flex flex-col items-center pt-4 pb-0 px-5">
        <div
          className="relative animate-scanpulse"
          style={{ width: 192, height: 192 }}
        >
          {/* Diagonal hatch fill */}
          <div
            className="absolute inset-0 rounded-[34px] overflow-hidden"
            style={{
              background: "rgba(108,60,224,.12)",
              backgroundImage:
                "repeating-linear-gradient(45deg, rgba(108,60,224,.08) 0px, rgba(108,60,224,.08) 1px, transparent 1px, transparent 12px)",
            }}
          />

          {/* Sweep line */}
          <div className="absolute inset-0 rounded-[34px] overflow-hidden">
            <div
              className="animate-sweep absolute left-0 right-0 h-8"
              style={{
                background:
                  "linear-gradient(180deg, transparent, rgba(108,60,224,.5) 50%, transparent)",
                borderRadius: 2,
              }}
            />
          </div>

          {/* Corner brackets */}
          {[
            { top: 0, left: 0, rotate: "0deg" },
            { top: 0, right: 0, rotate: "90deg" },
            { bottom: 0, right: 0, rotate: "180deg" },
            { bottom: 0, left: 0, rotate: "270deg" },
          ].map((pos, i) => (
            <div
              key={i}
              className="absolute w-8 h-8"
              style={{ ...pos }}
            >
              <svg
                viewBox="0 0 32 32"
                fill="none"
                style={{
                  transform: `rotate(${pos.rotate ?? "0deg"})`,
                  width: 32,
                  height: 32,
                }}
              >
                <path
                  d="M2 14V4a2 2 0 0 1 2-2h10"
                  stroke="url(#bracket-grad)"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                />
                <defs>
                  <linearGradient id="bracket-grad" x1="2" y1="2" x2="14" y2="14" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#6C3CE0" />
                    <stop offset="1" stopColor="#FF6A45" />
                  </linearGradient>
                </defs>
              </svg>
            </div>
          ))}
        </div>

        {/* Headline */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-center mt-6 mb-2"
        >
          <h1
            className="text-3xl font-extrabold text-white tracking-tight"
            style={{ fontFamily: "var(--font-bricolage), sans-serif", letterSpacing: "-0.02em" }}
          >
            What is this?
          </h1>
          <p
            className="text-sm mt-2 leading-relaxed"
            style={{ color: "#B7AECB" }}
          >
            A bill, a meme, a pill, a letter, an error.
            <br />Point and get a plain answer.
          </p>
        </motion.div>

        {/* Quick-action chips */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="flex gap-2 overflow-x-auto pb-1 mt-3 w-full scrollbar-none"
          style={{ msOverflowStyle: "none", scrollbarWidth: "none" }}
        >
          {chips.map((chip) => (
            <button
              key={chip}
              onClick={() => router.push("/analyze?mode=text")}
              className="flex-shrink-0 px-3.5 py-2 rounded-full text-sm font-medium text-white transition-all active:scale-95 whitespace-nowrap"
              style={{ background: "rgba(255,255,255,.1)", border: "1px solid rgba(255,255,255,.12)" }}
            >
              {chip}
            </button>
          ))}
        </motion.div>
      </div>

      {/* Capture controls */}
      <div className="flex items-center justify-center gap-8 mt-auto mb-24 pt-6">
        {/* Gallery */}
        <button
          onClick={() => router.push("/analyze")}
          className="w-[50px] h-[50px] rounded-2xl flex items-center justify-center transition-all active:scale-90"
          style={{ background: "rgba(255,255,255,.1)", border: "1px solid rgba(255,255,255,.12)" }}
        >
          <ImageIcon size={22} className="text-white" strokeWidth={2} />
        </button>

        {/* Shutter FAB */}
        <button
          onClick={() => router.push("/analyze")}
          className="relative flex items-center justify-center transition-all active:scale-90"
          style={{
            width: 78,
            height: 78,
            borderRadius: "50%",
            background: "var(--brand-gradient)",
            boxShadow: "var(--brand-glow), 0 0 0 4px rgba(108,60,224,.2)",
          }}
        >
          <Camera size={30} className="text-white" strokeWidth={2.2} />
        </button>

        {/* Scan/crop */}
        <button
          onClick={() => router.push("/analyze")}
          className="w-[50px] h-[50px] rounded-2xl flex items-center justify-center transition-all active:scale-90"
          style={{ background: "rgba(255,255,255,.1)", border: "1px solid rgba(255,255,255,.12)" }}
        >
          <ScanLine size={22} className="text-white" strokeWidth={2} />
        </button>
      </div>

      <BottomNav dark />
    </div>
  );
}
