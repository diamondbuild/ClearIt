import { ClearItModelOutput } from "@/lib/ai/schema";

const SCAM_WARNING =
  "Do not click links, call numbers, or send money based only on this message. Use the official app, official website, or a phone number from a trusted source.";

const MEDICAL_DISCLAIMER =
  "This is a plain-English explanation, not medical advice. Confirm medication, dosage, symptoms, and treatment decisions with a doctor or pharmacist.";

const LEGAL_DISCLAIMER =
  "This is a plain-English explanation, not legal advice. If there is a deadline, court notice, eviction, police matter, or lawsuit, contact the official sender or a qualified legal professional.";

const TAX_DISCLAIMER =
  "This is a plain-English explanation, not tax advice. Verify tax notices through official government channels or a qualified tax professional.";

const SCAM_SIGNAL_PATTERNS = [
  /gift card/i,
  /crypto|bitcoin|usdt/i,
  /wire transfer/i,
  /\b(zelle|cash app|cashapp|venmo)\b/i,
  /act now|urgent|immediately|right away|within \d+ (minutes|hours)/i,
  /https?:\/\/(bit\.ly|tinyurl|t\.co|[a-z0-9-]+\.(xyz|top|click|info))/i,
  /password reset|reset code|login code|verification code|one[- ]time code|otp/i,
  /account (is )?(locked|frozen|suspended|on hold)/i,
  /\bprize\b|you('| ha)ve won|claim your reward/i,
  /refund (pending|ready|available)/i,
  /delivery (failed|attempt)|package (held|pending)/i,
  /unpaid toll|toll (fee|charge)/i,
  /social security number|\bssn\b/i,
  /banking (info|details)|routing number|account number to/i,
];

function ensureWarning(list: string[], warning: string): string[] {
  const exists = list.some(
    (w) => w.trim().toLowerCase() === warning.trim().toLowerCase(),
  );
  return exists ? list : [...list, warning];
}

function countScamSignals(text: string): number {
  return SCAM_SIGNAL_PATTERNS.reduce(
    (count, re) => (re.test(text) ? count + 1 : count),
    0,
  );
}

/**
 * Applies rule-based safety checks AFTER the AI (or demo) output. This layer
 * makes the result safer and more consistent regardless of the model output.
 */
export function applySafetyPlaybook(
  result: ClearItModelOutput,
  rawInputText?: string,
): ClearItModelOutput {
  let next: ClearItModelOutput = {
    ...result,
    warnings: [...result.warnings],
  };

  const inputText = (rawInputText ?? "").trim();
  const signalCount = inputText ? countScamSignals(inputText) : 0;

  // Escalate to possible_scam when the input shows multiple scam signals and
  // the model didn't already flag a higher-priority safety state.
  if (
    signalCount >= 2 &&
    next.urgency !== "possible_scam" &&
    next.urgency !== "emergency" &&
    next.category !== "possible_scam"
  ) {
    next.category = "possible_scam";
    next.urgency = "possible_scam";
  }

  if (next.category === "possible_scam" || next.urgency === "possible_scam") {
    next.warnings = ensureWarning(next.warnings, SCAM_WARNING);
    if (next.shareCard) {
      next.shareCard = { ...next.shareCard, urgency: "Possible Scam" };
    }
  }

  if (next.category === "medical") {
    next.disclaimer = MEDICAL_DISCLAIMER;
  }

  if (next.category === "legal_notice") {
    next.disclaimer = LEGAL_DISCLAIMER;
  }

  if (next.category === "tax") {
    next.disclaimer = TAX_DISCLAIMER;
  }

  // Guarantee a non-empty disclaimer.
  if (!next.disclaimer || next.disclaimer.trim().length === 0) {
    next.disclaimer =
      "ClearIt helps explain information. It does not replace professional legal, medical, financial, or emergency advice.";
  }

  return next;
}
