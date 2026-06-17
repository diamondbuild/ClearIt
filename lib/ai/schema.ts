import { z } from "zod";
import { CATEGORIES, URGENCY_LEVELS, CONFIDENCE_LEVELS } from "@/lib/types";

export const keyDetailSchema = z.object({
  label: z.string(),
  value: z.string(),
});

export const detectedDeadlineSchema = z.object({
  label: z.string(),
  dateText: z.string(),
  explanation: z.string(),
});

export const shareCardSchema = z.object({
  title: z.string(),
  urgency: z.string(),
  meaning: z.string(),
  nextStep: z.string(),
});

/**
 * The schema the AI model is asked to return. We omit `id` and `createdAt`
 * here because the server assigns those after validation.
 */
export const clearItModelSchema = z.object({
  category: z.enum(CATEGORIES),
  urgency: z.enum(URGENCY_LEVELS),
  confidence: z.enum(CONFIDENCE_LEVELS),
  plainTitle: z.string(),
  oneSentenceSummary: z.string(),
  whatThisIs: z.string(),
  whatItMeans: z.string(),
  whyItMatters: z.string(),
  nextSteps: z.array(z.string()),
  warnings: z.array(z.string()),
  keyDetails: z.array(keyDetailSchema),
  detectedDeadlines: z.array(detectedDeadlineSchema),
  suggestedQuestions: z.array(z.string()),
  callScript: z.string(),
  replyDraft: z.string(),
  checklist: z.array(z.string()),
  simplifiedExplanation: z.string(),
  shareCard: shareCardSchema,
  disclaimer: z.string(),
});

export type ClearItModelOutput = z.infer<typeof clearItModelSchema>;

/**
 * Full analysis schema (with server-assigned identity fields).
 */
export const clearItAnalysisSchema = clearItModelSchema.extend({
  id: z.string(),
  createdAt: z.string(),
});

/**
 * JSON Schema passed to OpenAI Structured Outputs. Mirrors clearItModelSchema.
 * Every property is required and additionalProperties is false (strict mode).
 */
export const clearItJsonSchema = {
  type: "object",
  additionalProperties: false,
  properties: {
    category: { type: "string", enum: [...CATEGORIES] },
    urgency: { type: "string", enum: [...URGENCY_LEVELS] },
    confidence: { type: "string", enum: [...CONFIDENCE_LEVELS] },
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
        properties: {
          label: { type: "string" },
          value: { type: "string" },
        },
        required: ["label", "value"],
      },
    },
    detectedDeadlines: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        properties: {
          label: { type: "string" },
          dateText: { type: "string" },
          explanation: { type: "string" },
        },
        required: ["label", "dateText", "explanation"],
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
      properties: {
        title: { type: "string" },
        urgency: { type: "string" },
        meaning: { type: "string" },
        nextStep: { type: "string" },
      },
      required: ["title", "urgency", "meaning", "nextStep"],
    },
    disclaimer: { type: "string" },
  },
  required: [
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
} as const;
