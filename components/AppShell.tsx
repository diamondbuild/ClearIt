import type { ReactNode } from "react";
import { BottomNav } from "@/components/BottomNav";
import { Header } from "@/components/Header";

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="mx-auto flex min-h-screen w-full max-w-md flex-col px-4 pt-4 sm:px-5">
      <Header />
      <main className="safe-bottom flex-1">{children}</main>
      <BottomNav />
    </div>
  );
}
