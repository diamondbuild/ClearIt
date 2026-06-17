import Link from "next/link";
import { ShieldCheck } from "lucide-react";

export const Header = () => {
  return (
    <header className="sticky top-0 z-30 border-b border-slate-200/70 bg-white/80 backdrop-blur-md">
      <div className="mx-auto flex w-full max-w-xl items-center justify-between px-4 py-3">
        <Link href="/" className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-600 text-white shadow-sm">
            <ShieldCheck size={17} />
          </span>
          <div>
            <p className="font-display text-[1.05rem] font-semibold tracking-tight text-slate-900">
              ClearIt
            </p>
            <p className="text-xs text-slate-500">Take a picture. Know what to do.</p>
          </div>
        </Link>
      </div>
    </header>
  );
};
