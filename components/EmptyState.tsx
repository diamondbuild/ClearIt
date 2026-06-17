import type { ReactNode } from "react";
import { FileQuestion } from "lucide-react";

export function EmptyState({ title, body, action }: { title: string; body: string; action?: ReactNode }) {
  return (
    <div className="glass-card flex flex-col items-center rounded-[2rem] p-8 text-center">
      <div className="mb-4 grid size-14 place-items-center rounded-3xl bg-blue-50 text-blue-700 dark:bg-blue-400/10 dark:text-blue-200">
        <FileQuestion className="size-7" aria-hidden="true" />
      </div>
      <h2 className="text-xl font-black tracking-tight text-slate-950 dark:text-white">{title}</h2>
      <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">{body}</p>
      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  );
}
