import Link from "next/link";
import { ShieldCheck } from "lucide-react";

export function Header() {
  return (
    <header className="mb-4 flex items-center justify-between rounded-3xl border border-white/60 bg-white/70 px-4 py-3 shadow-sm backdrop-blur dark:border-white/10 dark:bg-slate-950/50">
      <Link href="/" className="flex items-center gap-2" aria-label="ClearIt home">
        <span className="grid size-9 place-items-center rounded-2xl bg-blue-700 text-white shadow-lg shadow-blue-700/20 dark:bg-blue-500">
          <ShieldCheck className="size-5" aria-hidden="true" />
        </span>
        <span>
          <span className="block text-lg font-black tracking-tight text-slate-950 dark:text-white">ClearIt</span>
          <span className="block text-xs font-medium text-slate-500 dark:text-slate-400">Plain-English help</span>
        </span>
      </Link>
      <span className="rounded-full bg-teal-50 px-3 py-1 text-xs font-bold text-teal-700 ring-1 ring-teal-100 dark:bg-teal-400/10 dark:text-teal-200 dark:ring-teal-300/20">
        Private MVP
      </span>
    </header>
  );
}
