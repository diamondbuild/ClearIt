"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, ScanLine, Clock, Settings } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/", label: "Home", icon: Home },
  { href: "/analyze", label: "Analyze", icon: ScanLine },
  { href: "/history", label: "History", icon: Clock },
  { href: "/settings", label: "Settings", icon: Settings },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 safe-bottom"
      style={{
        background: "var(--card)",
        borderTop: "1px solid var(--card-border)",
        boxShadow: "0 -4px 12px rgb(0 0 0 / 0.06)",
      }}
    >
      <div className="flex items-center justify-around max-w-md mx-auto px-2 py-2">
        {navItems.map(({ href, label, icon: Icon }) => {
          const isActive =
            href === "/" ? pathname === "/" : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex flex-col items-center gap-1 min-w-[56px] min-h-[44px] justify-center rounded-xl transition-all duration-200 px-3",
                isActive
                  ? "text-[var(--primary)]"
                  : "text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
              )}
            >
              <Icon
                size={22}
                className={cn(
                  "transition-all duration-200",
                  isActive ? "scale-110" : ""
                )}
                strokeWidth={isActive ? 2.5 : 2}
              />
              <span
                className={cn(
                  "text-[10px] font-medium transition-all",
                  isActive ? "font-semibold" : ""
                )}
              >
                {label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
