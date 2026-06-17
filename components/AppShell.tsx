import type { ReactNode } from "react";

import { BottomNav } from "@/components/BottomNav";
import { Header } from "@/components/Header";
import { cn } from "@/lib/utils";

type AppShellProps = {
  children: ReactNode;
  className?: string;
};

export const AppShell = ({ children, className }: AppShellProps) => {
  return (
    <div className="min-h-screen bg-clearit-gradient pb-24">
      <Header />
      <main className={cn("mx-auto w-full max-w-xl px-4 py-6", className)}>{children}</main>
      <BottomNav />
    </div>
  );
};
