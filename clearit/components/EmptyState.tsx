"use client";

import Link from "next/link";
import { motion } from "framer-motion";

interface EmptyStateProps {
  icon?: string;
  title: string;
  description: string;
  actionLabel?: string;
  actionHref?: string;
}

export function EmptyState({
  icon = "📭",
  title,
  description,
  actionLabel,
  actionHref,
}: EmptyStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center text-center py-16 px-6"
    >
      <div className="text-5xl mb-4">{icon}</div>
      <h3
        className="text-lg font-semibold mb-2"
        style={{ color: "var(--foreground)" }}
      >
        {title}
      </h3>
      <p
        className="text-sm max-w-xs leading-relaxed"
        style={{ color: "var(--muted-foreground)" }}
      >
        {description}
      </p>
      {actionLabel && actionHref && (
        <Link
          href={actionHref}
          className="mt-6 inline-flex items-center justify-center px-6 py-3 rounded-2xl text-sm font-semibold text-white transition-all active:scale-95"
          style={{ background: "var(--primary)" }}
        >
          {actionLabel}
        </Link>
      )}
    </motion.div>
  );
}
