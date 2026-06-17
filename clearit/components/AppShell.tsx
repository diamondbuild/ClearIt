"use client";

import { Header } from "@/components/Header";
import { BottomNav } from "@/components/BottomNav";

interface AppShellProps {
  children: React.ReactNode;
  title?: string;
  showWordmark?: boolean;
  rightSlot?: React.ReactNode;
}

export function AppShell({
  children,
  title,
  showWordmark = false,
  rightSlot,
}: AppShellProps) {
  return (
    <div
      className="flex flex-col min-h-screen max-w-md mx-auto"
      style={{ background: "var(--background)" }}
    >
      <Header
        title={title}
        showWordmark={showWordmark}
        rightSlot={rightSlot}
      />
      <main className="flex-1 safe-bottom-nav">{children}</main>
      <BottomNav />
    </div>
  );
}
