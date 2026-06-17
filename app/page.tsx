import Link from "next/link";
import { ArrowRight, Camera, CheckCircle2, LockKeyhole, MessageSquareText, ShieldCheck, Sparkles } from "lucide-react";

const examples = ["Bill", "School form", "Insurance letter", "App error", "Bank alert", "Medical message", "Scam check"];

const trustItems = [
  { label: "Private by default", icon: LockKeyhole },
  { label: "Plain English", icon: MessageSquareText },
  { label: "Safe next steps", icon: ShieldCheck },
];

export default function HomePage() {
  return (
    <div className="space-y-5">
      <section className="glass-card overflow-hidden rounded-[2.5rem] p-6">
        <div className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1.5 text-xs font-black text-blue-700 ring-1 ring-blue-100 dark:bg-blue-400/10 dark:text-blue-200 dark:ring-blue-300/20">
          <Sparkles className="size-3.5" aria-hidden="true" />
          Clear answers for confusing stuff
        </div>
        <h1 className="text-balance mt-5 text-5xl font-black tracking-[-0.06em] text-slate-950 dark:text-white">
          Take a picture. Know what to do.
        </h1>
        <p className="mt-4 text-base leading-7 text-slate-600 dark:text-slate-300">
          ClearIt explains confusing bills, forms, alerts, errors, and messages in plain English.
        </p>

        <div className="mt-7 grid gap-3">
          <Link
            href="/analyze"
            className="inline-flex min-h-14 items-center justify-center gap-2 rounded-3xl bg-blue-700 px-6 py-4 text-base font-black text-white shadow-2xl shadow-blue-700/25 transition hover:bg-blue-800 dark:bg-blue-500 dark:hover:bg-blue-400"
          >
            <Camera className="size-5" aria-hidden="true" />
            Explain something
            <ArrowRight className="size-5" aria-hidden="true" />
          </Link>
          <Link
            href="/analyze?mode=text"
            className="inline-flex min-h-14 items-center justify-center gap-2 rounded-3xl border border-slate-200 bg-white/80 px-6 py-4 text-base font-black text-slate-800 shadow-sm transition hover:bg-white dark:border-white/10 dark:bg-white/10 dark:text-white dark:hover:bg-white/15"
          >
            <MessageSquareText className="size-5" aria-hidden="true" />
            Paste text instead
          </Link>
        </div>
      </section>

      <section className="glass-card rounded-[2rem] p-5">
        <h2 className="text-sm font-black uppercase tracking-[0.16em] text-slate-500 dark:text-slate-400">Try it with</h2>
        <div className="mt-4 flex flex-wrap gap-2">
          {examples.map((example) => (
            <span
              key={example}
              className="rounded-full border border-slate-200 bg-white px-3 py-2 text-sm font-bold text-slate-700 shadow-sm dark:border-white/10 dark:bg-white/10 dark:text-slate-200"
            >
              {example}
            </span>
          ))}
        </div>
      </section>

      <section className="grid grid-cols-3 gap-3">
        {trustItems.map((item) => {
          const Icon = item.icon;
          return (
            <div key={item.label} className="rounded-3xl border border-white/70 bg-white/70 p-3 text-center shadow-sm backdrop-blur dark:border-white/10 dark:bg-white/10">
              <Icon className="mx-auto size-5 text-teal-700 dark:text-teal-200" aria-hidden="true" />
              <p className="mt-2 text-xs font-black leading-4 text-slate-700 dark:text-slate-200">{item.label}</p>
            </div>
          );
        })}
      </section>

      <section className="rounded-[1.75rem] border border-slate-200/80 bg-white/60 p-4 text-sm leading-6 text-slate-600 dark:border-white/10 dark:bg-white/5 dark:text-slate-300">
        <div className="flex gap-3">
          <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-blue-700 dark:text-blue-300" aria-hidden="true" />
          <p>
            ClearIt helps explain information. It does not replace professional legal, medical, financial, or emergency advice.
          </p>
        </div>
      </section>
    </div>
  );
}
