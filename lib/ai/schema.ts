import { z } from "zod";

import {
  CLEARIT_CATEGORIES,
  CLEARIT_CONFIDENCE_LEVELS,
  CLEARIT_URGENCY_LEVELS,
} from "@/lib/types";

export const clearItCategorySchema = z.enum(CLEARIT_CATEGORIES);
export const clearItUrgencySchema = z.enum(CLEARIT_URGENCY_LEVELS);
export const clearItConfidenceSchema = z.enum(CLEARIT_CONFIDENCE_LEVELS);

export const clearItAnalysisSchema = z.object({
  id: z.string().min(1),
  createdAt: z.string().datetime(),
  category: clearItCategorySchema,
  urgency: clearItUrgencySchema,
  confidence: clearItConfidenceSchema,
  plainTitle: z.string().min(1),
  oneSentenceSummary: z.string().min(1),
  whatThisIs: z.string().min(1),
  whatItMeans: z.string().min(1),
  whyItMatters: z.string().min(1),
  nextSteps: z.array(z.string().min(1)),
  warnings: z.array(z.string().min(1)),
  keyDetails: z.array(
    z.object({
      label: z.string().min(1),
      value: z.string().min(1),
    }),
  ),
  detectedDeadlines: z.array(
    z.object({
      label: z.string().min(1),
      dateText: z.string().min(1),
      explanation: z.string().min(1),
    }),
  ),
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

export const analyzeJsonPayloadSchema = z
  .object({
    text: z.string().max(20_000).optional(),
    imageBase64: z.string().optional(),
    imageMimeType: z.string().optional(),
    fileName: z.string().optional(),
    demoMode: z.boolean().optional(),
  })
  .superRefine((payload, ctx) => {
    const hasText = Boolean(payload.text?.trim());
    const hasImage = Boolean(payload.imageBase64?.trim());

    if (!hasText && !hasImage) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Please add text or an image to analyze.",
        path: ["text"],
      });
    }
  });

export type AnalyzeJsonPayload = z.infer<typeof analyzeJsonPayloadSchema>;
