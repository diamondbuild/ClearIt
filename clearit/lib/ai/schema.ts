import { z } from "zod";

// Coerce null/undefined to empty string for any string field
const safeStr = z.string().nullable().optional().transform((v) => v ?? "");

// Coerce null/undefined to empty array
const safeStrArray = z
  .array(z.string().nullable().optional().transform((v) => v ?? ""))
  .nullable()
  .optional()
  .transform((v) => v ?? []);

export const CategorySchema = z
  .enum([
    "bill", "insurance", "medical", "bank_alert", "possible_scam",
    "school_form", "work_hr", "legal_notice", "government", "subscription",
    "app_error", "device_error", "appliance", "parking_ticket",
    "shipping_delivery", "tax", "mortgage_rent", "utility",
    "general_message", "meme_image", "person_public_figure", "product_object",
    "nature_animal", "place_landmark", "artwork_media", "screenshot_ui", "unknown",
  ])
  .catch("unknown");

export const UrgencySchema = z
  .enum(["low", "medium", "high", "possible_scam", "emergency", "unknown"])
  .catch("unknown");

export const ConfidenceSchema = z
  .enum(["low", "medium", "high"])
  .catch("medium");

export const KeyDetailSchema = z.object({
  label: safeStr,
  value: safeStr,
});

export const DetectedDeadlineSchema = z.object({
  label: safeStr,
  dateText: safeStr,
  explanation: safeStr,
});

export const ShareCardSchema = z.object({
  title: safeStr,
  urgency: safeStr,
  meaning: safeStr,
  nextStep: safeStr,
});

export const ClearItAnalysisSchema = z.object({
  id: safeStr,
  createdAt: safeStr,
  category: CategorySchema,
  urgency: UrgencySchema,
  confidence: ConfidenceSchema,
  plainTitle: safeStr,
  oneSentenceSummary: safeStr,
  whatThisIs: safeStr,
  whatItMeans: safeStr,
  whyItMatters: safeStr,
  nextSteps: safeStrArray,
  warnings: safeStrArray,
  keyDetails: z
    .array(KeyDetailSchema)
    .nullable()
    .optional()
    .transform((v) => v ?? []),
  detectedDeadlines: z
    .array(DetectedDeadlineSchema)
    .nullable()
    .optional()
    .transform((v) => v ?? []),
  suggestedQuestions: safeStrArray,
  callScript: safeStr,
  replyDraft: safeStr,
  checklist: safeStrArray,
  simplifiedExplanation: safeStr,
  shareCard: ShareCardSchema.nullable().optional().transform(
    (v) => v ?? { title: "", urgency: "", meaning: "", nextStep: "" }
  ),
  disclaimer: safeStr,
});

export type ClearItAnalysisZod = z.infer<typeof ClearItAnalysisSchema>;
