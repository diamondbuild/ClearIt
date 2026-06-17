"use client";

import { useState } from "react";
import { Copy, Check, Share2, ShieldCheck } from "lucide-react";
import { ClearItAnalysis } from "@/lib/types";
import { ActionButton } from "@/components/ActionButton";

function buildShareText(result: ClearItAnalysis): string {
  const c = result.shareCard;
  return [
    "ClearIt Summary",
    "",
    "This is:",
    c.title,
    "",
    "Urgency:",
    c.urgency,
    "",
    "What it means:",
    c.meaning,
    "",
    "Next step:",
    c.nextStep,
    "",
    "Explained by ClearIt",
  ].join("\n");
}

export function ClearItCard({ result }: { result: ClearItAnalysis }) {
  const [copied, setCopied] = useState(false);
  const shareText = buildShareText(result);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // ignore
    }
  };

  const handleShare = async () => {
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({
          title: "ClearIt Summary",
          text: shareText,
        });
      } catch {
        // user cancelled
      }
    } else {
      handleCopy();
    }
  };

  return (
    <div className="space-y-4">
      <div className="overflow-hidden rounded-3xl border border-primary/20 bg-gradient-to-br from-primary/10 via-card to-accent/10 p-5 shadow-card">
        <div className="mb-4 flex items-center gap-2">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <ShieldCheck className="h-4 w-4" />
          </span>
          <span className="text-sm font-bold tracking-tight">
            ClearIt Summary
          </span>
        </div>

        <CardRow label="This is" value={result.shareCard.title} emphasize />
        <CardRow label="Urgency" value={result.shareCard.urgency} />
        <CardRow label="What it means" value={result.shareCard.meaning} />
        <CardRow label="Next step" value={result.shareCard.nextStep} />

        <div className="mt-4 border-t border-border/60 pt-3 text-right text-xs font-medium text-muted-foreground">
          Explained by ClearIt
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <ActionButton variant="secondary" icon={copied ? Check : Copy} onClick={handleCopy}>
          {copied ? "Copied" : "Copy"}
        </ActionButton>
        <ActionButton variant="primary" icon={Share2} onClick={handleShare}>
          Share
        </ActionButton>
      </div>
    </div>
  );
}

function CardRow({
  label,
  value,
  emphasize,
}: {
  label: string;
  value: string;
  emphasize?: boolean;
}) {
  return (
    <div className="mb-3 last:mb-0">
      <div className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
        {label}
      </div>
      <div
        className={
          emphasize
            ? "text-base font-bold leading-snug"
            : "text-sm leading-snug"
        }
      >
        {value}
      </div>
    </div>
  );
}
