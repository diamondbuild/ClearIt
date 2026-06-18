"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronLeft, Share2, Focus } from "lucide-react";

interface HeaderProps {
  title?: string;
  showWordmark?: boolean;
  backHref?: string;
  onBack?: () => void;
  rightSlot?: React.ReactNode;
  showShare?: boolean;
  onShare?: () => void;
  dark?: boolean;
}

export function Header({
  title,
  showWordmark = false,
  backHref,
  onBack,
  rightSlot,
  showShare,
  onShare,
  dark = false,
}: HeaderProps) {
  const router = useRouter();

  const handleBack = () => {
    if (onBack) { onBack(); return; }
    if (backHref) { router.push(backHref); return; }
    router.back();
  };

  const iconBg = dark ? "rgba(255,255,255,.1)" : "var(--surface-2)";
  const iconColor = dark ? "#fff" : "var(--ink)";
  const titleColor = dark ? "#fff" : "var(--ink)";

  return (
    <header
      className="sticky top-0 z-40 safe-top"
      style={{
        background: dark ? "transparent" : "var(--surface)",
        borderBottom: dark ? "none" : "1px solid var(--border)",
      }}
    >
      <div className="flex items-center justify-between h-14 px-4 max-w-md mx-auto">
        {/* Left */}
        <div className="flex items-center gap-2 min-w-0">
          {(backHref || onBack) ? (
            <button
              onClick={handleBack}
              className="w-9 h-9 rounded-xl flex items-center justify-center transition-all active:scale-90 mr-1"
              style={{ background: iconBg }}
            >
              <ChevronLeft size={20} style={{ color: iconColor }} strokeWidth={2.2} />
            </button>
          ) : null}

          {showWordmark ? (
            <Link href="/" className="flex items-center gap-2.5">
              <div
                className="w-8 h-8 rounded-[10px] flex items-center justify-center flex-shrink-0"
                style={{ background: "var(--brand-gradient)", boxShadow: "var(--brand-glow)" }}
              >
                <Focus size={16} className="text-white" strokeWidth={2.2} />
              </div>
              <span
                className="text-xl font-display font-extrabold tracking-tight"
                style={{ color: dark ? "#fff" : "var(--ink)", fontFamily: "var(--font-bricolage), sans-serif" }}
              >
                ClearIt
              </span>
            </Link>
          ) : title ? (
            <span
              className="text-sm font-semibold"
              style={{ color: titleColor, fontFamily: "var(--font-hanken), sans-serif" }}
            >
              {title}
            </span>
          ) : null}
        </div>

        {/* Right */}
        <div className="flex items-center gap-2">
          {showShare && (
            <button
              onClick={onShare}
              className="w-9 h-9 rounded-xl flex items-center justify-center transition-all active:scale-90"
              style={{ background: iconBg }}
            >
              <Share2 size={17} style={{ color: iconColor }} strokeWidth={2.2} />
            </button>
          )}
          {rightSlot}
        </div>
      </div>
    </header>
  );
}
