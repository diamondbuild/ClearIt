import { z } from "zod";
import { categories, confidenceLevels, urgencyLevels } from "@/lib/types";

export const keyDetailSchema = z.object({
  label: z.string().min(1),
  value: z.string().min(1),
});

export const detectedDeadlineSchema = z.object({
  label: z.string().min(1),
  dateText: z.string().min(1),
  explanation: z.string().min(1),
});

export const clearItAnalysisSchema = z.object({
  id: z.string().min(1),
  createdAt: z.string().min(1),
  category: z.enum(categories),
  urgency: z.enum(urgencyLevels),
  confidence: z.enum(confidenceLevels),
  plainTitle: z.string().min(1),
  oneSentenceSummary: z.string().min(1),
  whatThisIs: z.string().min(1),
  whatItMeans: z.string().min(1),
  whyItMatters: z.string().min(1),
  nextSteps: z.array(z.string().min(1)),
  warnings: z.array(z.string().min(1)),
  keyDetails: z.array(keyDetailSchema),
  detectedDeadlines: z.array(detectedDeadlineSchema),
  suggestedQuestions: z.array(z.string().min(1)),
  callScript: z.string().min(1),
  replyDraft: z.string().min(1),
  checklist: z.array(z.string().min(1)),
  simplifiedExplanation: z.string().min(1),
  shareCard: z.object({
    title: z.string().min(1),
    urgency: z.string().min(1),
    meaning: z.string().min(1),
    nextStep: z.string().min(1),
  }),
  disclaimer: z.string().min(1),
});

export const analyzeRequestSchema = z
  .object({
    text: z.string().trim().max(20000).optional(),
    imageBase64: z.string().max(9_000_000).optional(),
    imageMimeType: z.string().max(80).optional(),
    fileName: z.string().max(240).optional(),
    demoMode: z.boolean().optional(),
  })
  .refine((data) => Boolean(data.text?.trim() || data.imageBase64), {
    message: "Add a clear photo or paste text to analyze.",
  });

export const openAiStructuredSchema = {
  name: "clearit_analysis",
  strict: true,
  schema: {
    type: "object",
    additionalProperties: false,
    required: [
      "id",
      "createdAt",
      "category",
      "urgency",
      "confidence",
      "plainTitle",
      "oneSentenceSummary",
      "whatThisIs",
      "whatItMeans",
      "whyItMatters",
      "nextSteps",
      "warnings",
      "keyDetails",
      "detectedDeadlines",
      "suggestedQuestions",
      "callScript",
      "replyDraft",
      "checklist",
      "simplifiedExplanation",
      "shareCard",
      "disclaimer",
    ],
    properties: {
      id: { type: "string" },
      createdAt: { type: "string" },
      category: { type: "string", enum: [...categories] },
      urgency: { type: "string", enum: [...urgencyLevels] },
      confidence: { type: "string", enum: [...confidenceLevels] },
      plainTitle: { type: "string" },
      oneSentenceSummary: { type: "string" },
      whatThisIs: { type: "string" },
      whatItMeans: { type: "string" },
      whyItMatters: { type: "string" },
      nextSteps: { type: "array", items: { type: "string" } },
      warnings: { type: "array", items: { type: "string" } },
      keyDetails: {
        type: "array",
        items: {
          type: "object",
          additionalProperties: false,
          required: ["label", "value"],
          properties: {
            label: { type: "string" },
            value: { type: "string" },
          },
        },
      },
      detectedDeadlines: {
        type: "array",
        items: {
          type: "object",
          additionalProperties: false,
          required: ["label", "dateText", "explanation"],
          properties: {
            label: { type: "string" },
            dateText: { type: "string" },
            explanation: { type: "string" },
          },
        },
      },
      suggestedQuestions: { type: "array", items: { type: "string" } },
      callScript: { type: "string" },
      replyDraft: { type: "string" },
      checklist: { type: "array", items: { type: "string" } },
      simplifiedExplanation: { type: "string" },
      shareCard: {
        type: "object",
        additionalProperties: false,
        required: ["title", "urgency", "meaning", "nextStep"],
        properties: {
          title: { type: "string" },
          urgency: { type: "string" },
          meaning: { type: "string" },
          nextStep: { type: "string" },
        },
      },
      disclaimer: { type: "string" },
    },
  },
} as const;
