"use client";

import Link from "next/link";
import { ShieldCheck } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";

export function Header() {
  return (
    <header className="sticky top-0 z-30 border-b border-border/70 bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex h-14 w-full max-w-md items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-glow">
            <ShieldCheck className="h-5 w-5" />
          </span>
          <span className="text-lg font-bold tracking-tight">
            Clear<span className="text-primary">It</span>
          </span>
        </Link>
        <ThemeToggle />
      </div>
    </header>
  );
}
