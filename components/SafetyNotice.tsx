import { ShieldAlert, Siren, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

type Tone = "scam" | "emergency" | "warning";

const tones: Record<
  Tone,
  { className: string; Icon: typeof ShieldAlert; title: string }
> = {
  scam: {
    className:
      "border-red-200 bg-red-50 text-red-800 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-200",
    Icon: ShieldAlert,
    title: "This may be a scam",
  },
  emergency: {
    className: "border-red-700 bg-red-600 text-white",
    Icon: Siren,
    title: "This may need immediate attention",
  },
  warning: {
    className:
      "border-amber-200 bg-amber-50 text-amber-900 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-200",
    Icon: AlertTriangle,
    title: "Watch out for",
  },
};

export function SafetyNotice({
  tone,
  items,
  title,
}: {
  tone: Tone;
  items: string[];
  title?: string;
}) {
  if (!items || items.length === 0) return null;
  const { className, Icon, title: defaultTitle } = tones[tone];
  return (
    <div className={cn("rounded-2xl border p-4", className)}>
      <div className="flex items-center gap-2 font-bold">
        <Icon className="h-5 w-5 shrink-0" />
        {title ?? defaultTitle}
      </div>
      <ul className="mt-2 space-y-1.5 text-sm">
        {items.map((item, i) => (
          <li key={i} className="flex gap-2">
            <span aria-hidden className="mt-1.5 block h-1.5 w-1.5 shrink-0 rounded-full bg-current opacity-70" />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
