import { z } from "zod";

export const CategorySchema = z.enum([
  "bill",
  "insurance",
  "medical",
  "bank_alert",
  "possible_scam",
  "school_form",
  "work_hr",
  "legal_notice",
  "government",
  "subscription",
  "app_error",
  "device_error",
  "appliance",
  "parking_ticket",
  "shipping_delivery",
  "tax",
  "mortgage_rent",
  "utility",
  "general_message",
  "unknown",
]);

export const UrgencySchema = z.enum([
  "low",
  "medium",
  "high",
  "possible_scam",
  "emergency",
  "unknown",
]);

export const ConfidenceSchema = z.enum(["low", "medium", "high"]);

export const KeyDetailSchema = z.object({
  label: z.string(),
  value: z.string(),
});

export const DetectedDeadlineSchema = z.object({
  label: z.string(),
  dateText: z.string(),
  explanation: z.string(),
});

export const ShareCardSchema = z.object({
  title: z.string(),
  urgency: z.string(),
  meaning: z.string(),
  nextStep: z.string(),
});

export const ClearItAnalysisSchema = z.object({
  id: z.string(),
  createdAt: z.string(),
  category: CategorySchema,
  urgency: UrgencySchema,
  confidence: ConfidenceSchema,
  plainTitle: z.string(),
  oneSentenceSummary: z.string(),
  whatThisIs: z.string(),
  whatItMeans: z.string(),
  whyItMatters: z.string(),
  nextSteps: z.array(z.string()),
  warnings: z.array(z.string()),
  keyDetails: z.array(KeyDetailSchema),
  detectedDeadlines: z.array(DetectedDeadlineSchema),
  suggestedQuestions: z.array(z.string()),
  callScript: z.string(),
  replyDraft: z.string(),
  checklist: z.array(z.string()),
  simplifiedExplanation: z.string(),
  shareCard: ShareCardSchema,
  disclaimer: z.string(),
});

export type ClearItAnalysisZod = z.infer<typeof ClearItAnalysisSchema>;
