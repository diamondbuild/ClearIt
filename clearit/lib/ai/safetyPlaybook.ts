import { ClearItAnalysis } from "@/lib/types";

const SCAM_WARNING =
  "Do not click links, call numbers, or send money based only on this message. Use the official app, official website, or a phone number from a trusted source.";

const MEDICAL_DISCLAIMER =
  "This is a plain-English explanation, not medical advice. Confirm all medication instructions, dosages, symptoms, and treatment decisions with a doctor or pharmacist.";

const LEGAL_DISCLAIMER =
  "This is a plain-English explanation, not legal advice. If there is a deadline, court notice, eviction, police matter, or lawsuit, contact the official sender or a qualified legal professional.";

const TAX_DISCLAIMER =
  "This is a plain-English explanation, not tax advice. Verify all tax notices through official government channels or a qualified tax professional.";

export function applySafetyPlaybook(analysis: ClearItAnalysis): ClearItAnalysis {
  const result = { ...analysis };

  if (
    result.category === "possible_scam" ||
    result.urgency === "possible_scam"
  ) {
    if (!result.warnings.includes(SCAM_WARNING)) {
      result.warnings = [SCAM_WARNING, ...result.warnings];
    }
    if (result.urgency !== "possible_scam") {
      result.urgency = "possible_scam";
    }
  }

  if (result.category === "medical") {
    if (!result.disclaimer.includes("medical advice")) {
      result.disclaimer = MEDICAL_DISCLAIMER;
    }
  }

  if (result.category === "legal_notice") {
    if (!result.disclaimer.includes("legal advice")) {
      result.disclaimer = LEGAL_DISCLAIMER;
    }
    if (result.urgency === "low") {
      result.urgency = "medium";
    }
  }

  if (result.category === "tax") {
    if (!result.disclaimer.includes("tax advice")) {
      result.disclaimer = TAX_DISCLAIMER;
    }
  }

  if (!result.disclaimer) {
    result.disclaimer =
      "ClearIt helps explain information. It does not replace professional legal, medical, financial, or emergency advice.";
  }

  return result;
}
