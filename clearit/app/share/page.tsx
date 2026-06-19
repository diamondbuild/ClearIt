"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Focus, ShieldAlert, Zap, Info, CheckCircle } from "lucide-react";
import { decodeSharePayload } from "@/lib/utils";

type Payload = ReturnType<typeof decodeSharePayload>;

const CATEGORY_LABELS: Record<string, string> = {
  bill: "Bill", insurance: "Insurance", medical: "Medical", bank_alert: "Bank Alert",
  possible_scam: "Possible Scam", school_form: "School Form", work_hr: "Work / HR",
  legal_notice: "Legal Notice", government: "Government", subscription: "Subscription",
  app_error: "App Error", device_error: "Device Error", appliance: "Appliance",
  parking_ticket: "Parking Ticket", shipping_delivery: "Shipping", tax: "Tax",
  mortgage_rent: "Mortgage / Rent", utility: "Utility Bill", general_message: "General Message",
  meme_image: "Meme / Image", person_public_figure: "Person", product_object: "Product",
  nature_animal: "Animal / Nature", place_landmark: "Place", artwork_media: "Art / Media",
  screenshot_ui: "Screenshot", unknown: "Unknown",
};

const URGENCY_CONFIG: Record<string, { label: string; color: string; bg: string; bar: string }> = {
  low:          { label: "Low priority",   color: "#0B7D58", bg: "#E7F6EF", bar: "linear-gradient(90deg,#0E9F6E,#22C55E)" },
  medium:       { label: "Medium",         color: "#946012", bg: "#FCF3E3", bar: "linear-gradient(90deg,#B7791F,#F59E0B)" },
  high:         { label: "High priority",  color: "#C2541C", bg: "#FDEEE4", bar: "linear-gradient(90deg,#E0581E,#FF6A45)" },
  possible_scam:{ label: "Possible scam",  color: "#C42620", bg: "#FCE9E7", bar: "linear-gradient(90deg,#E0322E,#FF6A45)" },
  emergency:    { label: "Emergency",      color: "#fff",    bg: "#B91C1C", bar: "#B91C1C" },
  unknown:      { label: "Unknown",        color: "#857C92", bg: "#F1EADD", bar: "#C4BBCB" },
};

function UrgencyIcon({ urgency }: { urgency: string }) {
  const props = { size: 13, strokeWidth: 2.2 };
  if (urgency === "possible_scam" || urgency === "emergency") return <ShieldAlert {...props} />;
  if (urgency === "high") return <Zap {...props} />;
  if (urgency === "medium") return <Info {...props} />;
  return <CheckCircle {...props} />;
}

export default function SharePage() {
  const [data, setData] = useState<Payload>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    const hash = window.location.hash.slice(1);
    if (!hash) { setError(true); return; }
    const decoded = decodeSharePayload(hash);
    if (!decoded) { setError(true); return; }
    setData(decoded);
  }, []);

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-6 text-center"
        style={{ background: "#FBF8F4" }}>
        <div className="text-4xl mb-4">🔗</div>
        <h2 className="text-lg font-bold mb-2" style={{ color: "#1B1622" }}>Link expired or invalid</h2>
        <p className="text-sm mb-6" style={{ color: "#857C92" }}>This share link is no longer valid.</p>
        <Link href="/" className="px-6 py-3 rounded-2xl text-sm font-bold text-white"
          style={{ background: "linear-gradient(135deg,#6C3CE0,#FF6A45)" }}>
          Try LetsConfirmIt yourself
        </Link>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "#FBF8F4" }}>
        <div className="w-10 h-10 rounded-2xl animate-pulse" style={{ background: "#E6DECF" }} />
      </div>
    );
  }

  const urgency = URGENCY_CONFIG[data.u] ?? URGENCY_CONFIG.unknown;
  const category = CATEGORY_LABELS[data.c] ?? data.c;

  return (
    <div className="min-h-screen max-w-md mx-auto px-4 py-6 flex flex-col gap-4"
      style={{ background: "#FBF8F4", fontFamily: "'Hanken Grotesk', system-ui, sans-serif" }}>

      {/* Branding */}
      <div className="flex items-center gap-2 mb-1">
        <div className="w-7 h-7 rounded-[9px] flex items-center justify-center"
          style={{ background: "linear-gradient(135deg,#6C3CE0,#FF6A45)" }}>
          <Focus size={14} className="text-white" strokeWidth={2.2} />
        </div>
        <span className="text-base font-extrabold" style={{ color: "#1B1622", fontFamily: "'Bricolage Grotesque', sans-serif" }}>
          ClearIt
        </span>
        <span className="text-sm ml-auto" style={{ color: "#857C92" }}>Shared result</span>
      </div>

      {/* Hero card */}
      <div className="rounded-[26px] overflow-hidden border"
        style={{ background: "#fff", borderColor: "#E6DECF", boxShadow: "0 10px 30px -12px rgba(26,22,38,.18)" }}>
        <div className="h-1.5" style={{ background: urgency.bar }} />
        <div className="p-5">
          <div className="flex flex-wrap gap-2 mb-3">
            <span className="text-xs font-bold px-3 py-1 rounded-full"
              style={{ background: "#F0E9FC", color: "#5A2FC9" }}>
              {category}
            </span>
            <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full"
              style={{ background: urgency.bg, color: urgency.color }}>
              <UrgencyIcon urgency={data.u} />
              {urgency.label}
            </span>
          </div>
          <h1 className="text-xl font-extrabold leading-snug mb-2"
            style={{ color: "#1B1622", fontFamily: "'Bricolage Grotesque', sans-serif", letterSpacing: "-0.015em" }}>
            {data.t}
          </h1>
          <p className="text-sm leading-relaxed" style={{ color: "#5C5568" }}>{data.s}</p>
        </div>
      </div>

      {/* What it means */}
      <Block label="What it means">
        <p className="text-sm leading-relaxed" style={{ color: "#3D3849" }}>{data.m}</p>
      </Block>

      {/* Next steps */}
      {data.n.length > 0 && (
        <Block label="What to do next">
          <ol className="flex flex-col gap-2.5 mt-1">
            {data.n.map((step, i) => (
              <li key={i} className="flex items-start gap-2.5">
                <span className="flex-shrink-0 w-5 h-5 rounded-full text-[11px] font-bold flex items-center justify-center mt-0.5"
                  style={{ background: "#1B1622", color: "#fff" }}>
                  {i + 1}
                </span>
                <span className="text-sm leading-relaxed" style={{ color: "#3D3849" }}>{step}</span>
              </li>
            ))}
          </ol>
        </Block>
      )}

      {/* Warnings */}
      {data.w.length > 0 && (
        <div className="rounded-2xl p-4 border"
          style={{ background: "#FDEEE4", borderColor: "#E0581E" }}>
          <p className="text-xs font-bold uppercase tracking-widest mb-2"
            style={{ color: "#C2541C", letterSpacing: "0.1em" }}>⚠ Watch out for</p>
          <ul className="flex flex-col gap-1.5">
            {data.w.map((w, i) => (
              <li key={i} className="text-sm leading-relaxed" style={{ color: "#C2541C" }}>• {w}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Key details */}
      {data.k.length > 0 && (
        <Block label="Key details">
          {data.k.map((d, i) => (
            <div key={i} className="flex justify-between items-start gap-4 py-2 border-b last:border-0"
              style={{ borderColor: "#E6DECF" }}>
              <span className="text-sm" style={{ color: "#857C92" }}>{d.label}</span>
              <span className="text-sm font-semibold text-right" style={{ color: "#1B1622" }}>{d.value}</span>
            </div>
          ))}
        </Block>
      )}

      {/* Deadlines */}
      {data.d.length > 0 && (
        <Block label="Important dates">
          {data.d.map((dl, i) => (
            <div key={i} className="rounded-xl p-3 mt-1 border"
              style={{ background: "#FCF3E3", borderColor: "#B7791F" }}>
              <p className="text-sm font-bold" style={{ color: "#946012" }}>
                {dl.label}: {dl.dateText}
              </p>
              <p className="text-xs mt-0.5" style={{ color: "#946012", opacity: 0.85 }}>{dl.explanation}</p>
            </div>
          ))}
        </Block>
      )}

      {/* Disclaimer */}
      {data.r && (
        <p className="text-xs leading-relaxed px-1" style={{ color: "#857C92" }}>{data.r}</p>
      )}

      {/* CTA */}
      <div className="rounded-2xl p-4 text-center border mt-2"
        style={{ background: "#fff", borderColor: "#E6DECF" }}>
        <p className="text-xs mb-3" style={{ color: "#857C92" }}>
          Explained by LetsConfirmIt — point your camera at anything confusing.
        </p>
        <Link href="/"
          className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-2xl text-sm font-bold text-white"
          style={{ background: "linear-gradient(135deg,#6C3CE0,#FF6A45)" }}>
          Try LetsConfirmIt free
        </Link>
      </div>

      <p className="text-xs text-center pb-4" style={{ color: "#C4BBCB" }}>
        LetsConfirmIt helps explain information. Not legal, medical, or financial advice.
      </p>
    </div>
  );
}

function Block({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl p-4 border" style={{ background: "#fff", borderColor: "#E6DECF" }}>
      <p className="text-xs font-bold uppercase tracking-widest mb-2"
        style={{ color: "#857C92", letterSpacing: "0.1em" }}>
        {label}
      </p>
      {children}
    </div>
  );
}
