"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Clock, Settings } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/",         label: "Home",     icon: Home     },
  { href: "/history",  label: "History",  icon: Clock    },
  { href: "/settings", label: "Settings", icon: Settings },
];

interface BottomNavProps {
  dark?: boolean;
}

export function BottomNav({ dark = false }: BottomNavProps) {
  const pathname = usePathname();

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 safe-bottom"
      style={{
        background: dark ? "rgba(20,16,25,.92)" : "var(--surface)",
        borderTop: `1px solid ${dark ? "rgba(50,41,64,.8)" : "var(--border)"}`,
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
      }}
    >
      <div className="flex items-center justify-around max-w-md mx-auto px-2 py-2">
        {navItems.map(({ href, label, icon: Icon }) => {
          const isActive = href === "/" ? pathname === "/" : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex flex-col items-center gap-0.5 min-w-[56px] min-h-[48px] justify-center rounded-xl transition-all duration-200 px-2"
              )}
            >
              <Icon
                size={22}
                strokeWidth={isActive ? 2.4 : 2}
                style={{
                  color: isActive
                    ? dark ? "#9C7CF0" : "var(--violet-600)"
                    : dark ? "rgba(255,255,255,.4)" : "var(--muted)",
                }}
              />
              <span
                className="text-[10px] font-bold tracking-wide uppercase"
                style={{
                  color: isActive
                    ? dark ? "#9C7CF0" : "var(--violet-600)"
                    : dark ? "rgba(255,255,255,.4)" : "var(--muted)",
                  letterSpacing: "0.08em",
                }}
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
