"use client";

import Link from "next/link";
import { ShieldCheck } from "lucide-react";

interface HeaderProps {
  title?: string;
  showWordmark?: boolean;
  rightSlot?: React.ReactNode;
  backHref?: string;
}

export function Header({
  title,
  showWordmark = false,
  rightSlot,
}: HeaderProps) {
  return (
    <header
      className="sticky top-0 z-40 safe-top"
      style={{
        background: "var(--card)",
        borderBottom: "1px solid var(--card-border)",
        boxShadow: "var(--shadow-sm)",
      }}
    >
      <div className="flex items-center justify-between h-14 px-4 max-w-md mx-auto">
        <div className="flex items-center gap-2 min-w-0">
          {showWordmark ? (
            <Link href="/" className="flex items-center gap-2">
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                style={{ background: "var(--primary)" }}
              >
                <ShieldCheck size={18} className="text-white" />
              </div>
              <span
                className="text-lg font-bold tracking-tight"
                style={{ color: "var(--foreground)" }}
              >
                ClearIt
              </span>
            </Link>
          ) : (
            <span
              className="text-base font-semibold truncate"
              style={{ color: "var(--foreground)" }}
            >
              {title}
            </span>
          )}
        </div>
        {rightSlot && <div className="flex-shrink-0 ml-2">{rightSlot}</div>}
      </div>
    </header>
  );
}
