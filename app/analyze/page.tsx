"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { ImageUp, Type, Sparkles, AlertTriangle } from "lucide-react";
import { UploadCard } from "@/components/UploadCard";
import { PasteTextBox } from "@/components/PasteTextBox";
import { LoadingAnalysis } from "@/components/LoadingAnalysis";
import { setLastResult } from "@/lib/storage/history";
import { AnalyzeApiResponse } from "@/lib/types";
import { cn } from "@/lib/utils";

const EXAMPLE_TEXT: Record<string, string> = {
  Bill:
    "PAST DUE NOTICE — Account 4482910. Your previous balance of $148.32 for electricity service is now past due. Please pay immediately to avoid a late fee and possible service interruption. Pay online or call customer service.",
  "School form":
    "FIELD TRIP PERMISSION SLIP. Dear Parent/Guardian, our class will visit the science museum. Please sign and return this form with the $12 fee by Friday next week. Students without a signed permission form cannot attend.",
  "Insurance letter":
    "THIS IS NOT A BILL. Explanation of Benefits. Claim processed for your recent office visit. Amount billed: $320.00. Plan discount applied. Patient responsibility: $45.00. Keep this for your records.",
  "App error":
    "Installation failed. Error code 0x80070070. The app could not be installed. There may not be enough storage space on your device. Please free up space and try again later.",
  "Bank alert":
    "ALERT: Your bank account has been locked due to unusual activity. Verify your identity now to restore access: http://secure-bank-verify.xyz/login. Failure to act within 24 hours will result in permanent suspension.",
  "Medical message":
    "MyChart message from your care team: Your provider has updated your prescription. Please review the new medication and dosage instructions in your portal and confirm at your next visit.",
  "Scam check":
    "Congratulations! Your package delivery failed. To reschedule, pay a small $1.95 redelivery fee here: http://usps-redelivery.top/track. Act now or your parcel will be returned to sender.",
};

type Tab = "image" | "text";

function AnalyzeInner() {
  const router = useRouter();
  const params = useSearchParams();

  const [tab, setTab] = useState<Tab>("image");
  const [imageDataUrl, setImageDataUrl] = useState<string | null>(null);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const example = params.get("example");
    const mode = params.get("mode");
    if (example && EXAMPLE_TEXT[example]) {
      setTab("text");
      setText(EXAMPLE_TEXT[example]);
    } else if (mode === "text") {
      setTab("text");
    }
  }, [params]);

  const canSubmit =
    (tab === "image" && !!imageDataUrl) ||
    (tab === "text" && text.trim().length > 0) ||
    !!imageDataUrl ||
    text.trim().length > 0;

  const handleSubmit = async () => {
    setError(null);
    const hasImage = !!imageDataUrl;
    const hasText = text.trim().length > 0;
    if (!hasImage && !hasText) {
      setError("Add a photo or paste some text first.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: hasText ? text.trim() : undefined,
          imageBase64: hasImage ? imageDataUrl : undefined,
        }),
      });

      const data: AnalyzeApiResponse = await res.json();

      if (!data.ok) {
        setLoading(false);
        setError(data.error);
        return;
      }

      setLastResult({
        result: data.result,
        usedImage: hasImage,
        originalText: hasText ? text.trim() : undefined,
      });

      // Brief pause so the loading steps feel complete.
      setTimeout(() => {
        router.push(`/result?id=${encodeURIComponent(data.result.id)}&from=new`);
      }, 500);
    } catch {
      setLoading(false);
      setError(
        "Something went wrong reaching ClearIt. Check your connection and try again.",
      );
    }
  };

  if (loading) {
    return <LoadingAnalysis />;
  }

  return (
    <div className="space-y-5 animate-fade-in">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight">
          Explain something
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Upload a photo or paste text. ClearIt reads it and tells you what to
          do.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-1.5 rounded-2xl border border-border bg-muted p-1.5">
        <TabButton
          active={tab === "image"}
          onClick={() => setTab("image")}
          icon={ImageUp}
          label="Photo / Image"
        />
        <TabButton
          active={tab === "text"}
          onClick={() => setTab("text")}
          icon={Type}
          label="Paste text"
        />
      </div>

      <motion.div
        key={tab}
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
      >
        {tab === "image" ? (
          <UploadCard
            imageDataUrl={imageDataUrl}
            onImageReady={(url) => {
              setImageDataUrl(url);
              setError(null);
            }}
            onClear={() => setImageDataUrl(null)}
            onError={(msg) => setError(msg)}
          />
        ) : (
          <PasteTextBox value={text} onChange={setText} />
        )}
      </motion.div>

      {error ? (
        <div className="flex items-start gap-2 rounded-2xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-200">
          <AlertTriangle className="mt-0.5 h-4.5 w-4.5 shrink-0" />
          <span>{error}</span>
        </div>
      ) : null}

      <button
        type="button"
        onClick={handleSubmit}
        disabled={!canSubmit}
        className="flex w-full items-center justify-center gap-2 rounded-2xl bg-primary px-5 py-4 text-base font-semibold text-primary-foreground shadow-glow transition hover:brightness-110 active:brightness-95 disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-none"
      >
        <Sparkles className="h-5 w-5" />
        Clear this up
      </button>

      <p className="px-2 text-center text-xs leading-relaxed text-muted-foreground">
        ClearIt sends what you analyze to our AI provider only to generate your
        explanation. Don&apos;t upload anything you&apos;re not comfortable
        analyzing.
      </p>
    </div>
  );
}

function TabButton({
  active,
  onClick,
  icon: Icon,
  label,
}: {
  active: boolean;
  onClick: () => void;
  icon: typeof ImageUp;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex items-center justify-center gap-2 rounded-xl px-3 py-2.5 text-sm font-semibold transition",
        active
          ? "bg-card text-foreground shadow-soft"
          : "text-muted-foreground hover:text-foreground",
      )}
    >
      <Icon className="h-4.5 w-4.5" />
      {label}
    </button>
  );
}

export default function AnalyzePage() {
  return (
    <Suspense fallback={<LoadingAnalysis />}>
      <AnalyzeInner />
    </Suspense>
  );
}
