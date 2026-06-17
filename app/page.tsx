import Link from "next/link";
import { Lock, ShieldCheck, Sparkles } from "lucide-react";

import { AppShell } from "@/components/AppShell";

const chips = [
  "Bill",
  "School form",
  "Insurance letter",
  "App error",
  "Bank alert",
  "Medical message",
  "Scam check",
];

export default function Home() {
  return (
    <AppShell>
      <section className="clearit-card">
        <p className="text-sm font-semibold uppercase tracking-[0.14em] text-indigo-600">ClearIt</p>
        <h1 className="mt-2 font-display text-3xl font-semibold leading-tight text-slate-900">
          Take a picture.
          <br />
          Know what to do.
        </h1>
        <p className="mt-3 text-sm text-slate-600">
          ClearIt explains confusing bills, forms, alerts, errors, and messages in plain English.
        </p>

        <div className="mt-6 space-y-2">
          <Link href="/analyze" className="clearit-primary-btn w-full justify-center">
            Explain something
          </Link>
          <Link
            href="/analyze?focus=text"
            className="clearit-secondary-btn w-full justify-center text-sm"
          >
            Paste text instead
          </Link>
        </div>
      </section>

      <section className="clearit-card">
        <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
          Examples
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          {chips.map((chip) => (
            <span
              key={chip}
              className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-medium text-slate-700"
            >
              {chip}
            </span>
          ))}
        </div>
      </section>

      <section className="clearit-card">
        <div className="space-y-2 text-sm text-slate-700">
          <div className="flex items-center gap-2">
            <Lock size={16} className="text-indigo-600" />
            <span>Private by default</span>
          </div>
          <div className="flex items-center gap-2">
            <Sparkles size={16} className="text-indigo-600" />
            <span>Plain English</span>
          </div>
          <div className="flex items-center gap-2">
            <ShieldCheck size={16} className="text-indigo-600" />
            <span>Safe next steps</span>
          </div>
        </div>
      </section>

      <p className="px-2 text-center text-xs leading-5 text-slate-500">
        ClearIt helps explain information. It does not replace professional legal, medical,
        financial, or emergency advice.
      </p>
    </AppShell>
  );
}
