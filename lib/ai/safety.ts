import type { AnalyzeRequest, ClearItAnalysis } from "@/lib/types";

const scamWarning =
  "Do not click links, call numbers, or send money based only on this message. Use the official app, official website, or a phone number from a trusted source.";

const medicalDisclaimer =
  "This is a plain-English explanation, not medical advice. Confirm medication, dosage, symptoms, and treatment decisions with a doctor or pharmacist.";

const legalDisclaimer =
  "This is a plain-English explanation, not legal advice. If there is a deadline, court notice, eviction, police matter, or lawsuit, contact the official sender or a qualified legal professional.";

const taxDisclaimer =
  "This is a plain-English explanation, not tax advice. Verify tax notices through official government channels or a qualified tax professional.";

const genericDisclaimer =
  "ClearIt helps explain information in plain English. It does not replace professional legal, medical, financial, tax, or emergency advice.";

const scamSignals = [
  "gift card",
  "giftcard",
  "crypto",
  "bitcoin",
  "wire transfer",
  "zelle",
  "cash app",
  "venmo",
  "act now",
  "account locked",
  "password reset",
  "login code",
  "verification code",
  "bank fraud",
  "prize",
  "refund",
  "delivery failed",
  "unpaid toll",
  "social security",
  "ssn",
  "banking info",
  "click link",
];

function appendUnique(items: string[], item: string) {
  if (!items.some((existing) => existing.toLowerCase() === item.toLowerCase())) {
    items.push(item);
  }
}

function hasScamSignals(input?: string) {
  if (!input) {
    return false;
  }

  const normalized = input.toLowerCase();
  return scamSignals.some((signal) => normalized.includes(signal));
}

export function applySafetyPlaybooks(analysis: ClearItAnalysis, input?: Pick<AnalyzeRequest, "text">): ClearItAnalysis {
  const next = {
    ...analysis,
    warnings: [...analysis.warnings],
    nextSteps: [...analysis.nextSteps],
    checklist: [...analysis.checklist],
    shareCard: { ...analysis.shareCard },
  };

  if (hasScamSignals(input?.text) && next.urgency !== "emergency") {
    next.category = "possible_scam";
    next.urgency = "possible_scam";
    next.plainTitle = next.plainTitle.toLowerCase().includes("scam")
      ? next.plainTitle
      : `Possible scam: ${next.plainTitle}`;
  }

  if (next.category === "possible_scam" || next.urgency === "possible_scam") {
    appendUnique(next.warnings, scamWarning);
    appendUnique(next.nextSteps, "Do not use links or phone numbers from the message. Go directly to the official app, website, or a trusted phone number.");
    next.shareCard.urgency = "Possible Scam";
  }

  if (next.category === "medical") {
    next.disclaimer = medicalDisclaimer;
  } else if (next.category === "legal_notice") {
    next.disclaimer = legalDisclaimer;
  } else if (next.category === "tax") {
    next.disclaimer = taxDisclaimer;
  } else if (!next.disclaimer.trim()) {
    next.disclaimer = genericDisclaimer;
  }

  if (!next.shareCard.nextStep.trim()) {
    next.shareCard.nextStep = next.nextSteps[0] ?? "Contact the official sender if you are unsure.";
  }

  if (!next.checklist.length) {
    next.checklist = next.nextSteps;
  }

  return next;
}
