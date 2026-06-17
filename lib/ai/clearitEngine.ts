import OpenAI from "openai";

import { CLEARIT_OUTPUT_SHAPE_PROMPT, CLEARIT_SYSTEM_PROMPT } from "@/lib/ai/prompts";
import { clearItAnalysisSchema } from "@/lib/ai/schema";
import { getDemoResult } from "@/lib/demo/demoResults";
import type { ClearItAnalysis } from "@/lib/types";

const DEFAULT_MODEL = process.env.OPENAI_MODEL ?? "gpt-5.5";

type AnalyzeWithClearItInput = {
  text?: string;
  imageBase64?: string;
  imageMimeType?: string;
  fileName?: string;
  forceDemoMode?: boolean;
};

const SCAM_WARNING =
  "Do not click links, call numbers, or send money based only on this message. Use the official app, official website, or a phone number from a trusted source.";

const MEDICAL_DISCLAIMER =
  "This is a plain-English explanation, not medical advice. Confirm medication, dosage, symptoms, and treatment decisions with a doctor or pharmacist.";

const LEGAL_DISCLAIMER =
  "This is a plain-English explanation, not legal advice. If there is a deadline, court notice, eviction, police matter, or lawsuit, contact the official sender or a qualified legal professional.";

const TAX_DISCLAIMER =
  "This is a plain-English explanation, not tax advice. Verify tax notices through official government channels or a qualified tax professional.";

const EMERGENCY_WARNING =
  "This may require immediate attention. Contact the appropriate emergency service, official sender, or qualified professional.";

const SCAM_SIGNALS = [
  "gift card",
  "crypto",
  "wire transfer",
  "zelle",
  "cash app",
  "venmo",
  "urgent",
  "act now",
  "account locked",
  "password reset",
  "login code",
  "prize",
  "refund",
  "delivery failed",
  "unpaid toll",
  "social security",
  "banking info",
  "verify account",
];

const hasScamSignals = (text: string) => {
  const lowered = text.toLowerCase();
  return SCAM_SIGNALS.some((signal) => lowered.includes(signal));
};

const parseAiJson = (raw: string) => {
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
};

const applySafetyPlaybook = (analysis: ClearItAnalysis, inputText: string) => {
  const patched = {
    ...analysis,
    warnings: [...analysis.warnings],
  };

  const joinedForSignals = [
    inputText,
    analysis.plainTitle,
    analysis.oneSentenceSummary,
    analysis.whatItMeans,
    analysis.warnings.join(" "),
  ]
    .filter(Boolean)
    .join(" ");

  if (
    patched.category === "possible_scam" ||
    patched.urgency === "possible_scam" ||
    hasScamSignals(joinedForSignals)
  ) {
    patched.urgency = "possible_scam";
    if (!patched.warnings.some((warning) => warning.toLowerCase().includes("official app"))) {
      patched.warnings.unshift(SCAM_WARNING);
    }
  }

  if (patched.category === "medical") {
    patched.disclaimer = MEDICAL_DISCLAIMER;
  }

  if (patched.category === "legal_notice") {
    patched.disclaimer = LEGAL_DISCLAIMER;
  }

  if (patched.category === "tax") {
    patched.disclaimer = TAX_DISCLAIMER;
  }

  if (patched.urgency === "emergency") {
    if (!patched.warnings.some((warning) => warning.toLowerCase().includes("immediate attention"))) {
      patched.warnings.unshift(EMERGENCY_WARNING);
    }
  }

  if (!patched.shareCard.title) {
    patched.shareCard.title = patched.plainTitle;
  }

  if (!patched.shareCard.urgency) {
    patched.shareCard.urgency = patched.urgency;
  }

  if (!patched.shareCard.meaning) {
    patched.shareCard.meaning = patched.oneSentenceSummary;
  }

  if (!patched.shareCard.nextStep) {
    patched.shareCard.nextStep = patched.nextSteps[0] ?? "Use official contact channels to verify next steps.";
  }

  return patched;
};

const normalizeAnalysis = (parsed: unknown): ClearItAnalysis => {
  const now = new Date().toISOString();
  const parsedObj = typeof parsed === "object" && parsed !== null ? parsed : {};
  const withDefaults = {
    id: crypto.randomUUID(),
    createdAt: now,
    ...parsedObj,
  };

  const validated = clearItAnalysisSchema.parse(withDefaults);
  return validated;
};

export const analyzeWithClearItEngine = async (
  input: AnalyzeWithClearItInput,
): Promise<ClearItAnalysis> => {
  const normalizedText = input.text?.trim() ?? "";
  const shouldUseDemo = input.forceDemoMode || !process.env.OPENAI_API_KEY;

  if (shouldUseDemo) {
    const demo = getDemoResult(normalizedText, Boolean(input.imageBase64));
    return applySafetyPlaybook(demo, normalizedText);
  }

  const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

  const userParts: Array<
    | { type: "text"; text: string }
    | { type: "image_url"; image_url: { url: string } }
  > = [
    {
      type: "text",
      text: [
        "Analyze this content for ClearIt.",
        "If text is unreadable or missing, clearly say that confidence is low and category/urgency may be unknown.",
        CLEARIT_OUTPUT_SHAPE_PROMPT,
        normalizedText ? `USER_TEXT:\n${normalizedText}` : "USER_TEXT: (none provided)",
        input.fileName ? `FILE_NAME: ${input.fileName}` : "",
      ]
        .filter(Boolean)
        .join("\n\n"),
    },
  ];

  if (input.imageBase64 && input.imageMimeType) {
    userParts.push({
      type: "image_url",
      image_url: {
        url: `data:${input.imageMimeType};base64,${input.imageBase64}`,
      },
    });
  }

  const completion = await client.chat.completions.create({
    model: DEFAULT_MODEL,
    temperature: 0.2,
    response_format: { type: "json_object" },
    messages: [
      { role: "system", content: CLEARIT_SYSTEM_PROMPT },
      {
        role: "user",
        content: userParts,
      },
    ],
  });

  const raw = completion.choices[0]?.message?.content ?? "";
  const parsed = parseAiJson(raw);

  if (!parsed) {
    throw new Error("INVALID_AI_RESPONSE");
  }

  const normalized = normalizeAnalysis(parsed);
  return applySafetyPlaybook(normalized, normalizedText);
};
