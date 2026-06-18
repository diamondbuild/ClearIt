"use client";

import { Header } from "@/components/Header";
import { BottomNav } from "@/components/BottomNav";

interface AppShellProps {
  children: React.ReactNode;
  title?: string;
  showWordmark?: boolean;
  backHref?: string;
  onBack?: () => void;
  rightSlot?: React.ReactNode;
  showShare?: boolean;
  onShare?: () => void;
  dark?: boolean;
  noHeader?: boolean;
}

export function AppShell({
  children,
  title,
  showWordmark = false,
  backHref,
  onBack,
  rightSlot,
  showShare,
  onShare,
  dark = false,
  noHeader = false,
}: AppShellProps) {
  return (
    <div
      className="flex flex-col min-h-screen max-w-md mx-auto relative"
      style={{ background: dark ? "var(--bg)" : "var(--bg)" }}
    >
      {!noHeader && (
        <Header
          title={title}
          showWordmark={showWordmark}
          backHref={backHref}
          onBack={onBack}
          rightSlot={rightSlot}
          showShare={showShare}
          onShare={onShare}
          dark={dark}
        />
      )}
      <main className="flex-1 safe-bottom-nav">{children}</main>
      <BottomNav dark={dark} />
    </div>
  );
}
