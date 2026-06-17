import OpenAI from "openai";
import { ClearItAnalysis } from "@/lib/types";
import { ClearItAnalysisSchema } from "@/lib/ai/schema";
import { CLEARIT_SYSTEM_PROMPT, CLEARIT_USER_PROMPT } from "@/lib/ai/prompts";
import { applySafetyPlaybook } from "@/lib/ai/safetyPlaybook";
import { nanoid } from "@/lib/utils";

function getOpenAIClient(): OpenAI {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error("OPENAI_API_KEY is not set");
  return new OpenAI({ apiKey });
}

function getModel(): string {
  return process.env.OPENAI_MODEL || "gpt-4o";
}

export interface EngineInput {
  images?: string[];
  imageMediaTypes?: string[];
  text?: string;
  additionalContext?: string;
  imageCount?: number;
  // Legacy single image support
  imageBase64?: string;
  imageMediaType?: string;
}

export async function analyzeWithClearItEngine(
  input: EngineInput
): Promise<ClearItAnalysis> {
  // Normalize inputs
  const images: string[] = [];
  const mediaTypes: string[] = [];

  if (input.images && input.images.length > 0) {
    images.push(...input.images);
    mediaTypes.push(...(input.imageMediaTypes ?? input.images.map(() => "image/jpeg")));
  } else if (input.imageBase64) {
    images.push(input.imageBase64);
    mediaTypes.push(input.imageMediaType ?? "image/jpeg");
  }

  const hasImages = images.length > 0;
  const hasText = !!input.text;
  const hasContext = !!input.additionalContext;

  if (!hasImages && !hasText) {
    throw new Error("No input provided");
  }

  const userMessages: OpenAI.Chat.ChatCompletionContentPart[] = [];

  // Add text content first
  if (hasText) {
    userMessages.push({
      type: "text",
      text: `Here is the content to analyze:\n\n${input.text}`,
    });
  }

  // Add all images
  for (let i = 0; i < images.length; i++) {
    const mediaType = (mediaTypes[i] as "image/jpeg" | "image/png" | "image/gif" | "image/webp") || "image/jpeg";

    if (images.length > 1) {
      userMessages.push({
        type: "text",
        text: `Image ${i + 1} of ${images.length}:`,
      });
    }

    userMessages.push({
      type: "image_url",
      image_url: {
        url: `data:${mediaType};base64,${images[i]}`,
        detail: "high",
      },
    });
  }

  // Add additional context from user
  if (hasContext) {
    userMessages.push({
      type: "text",
      text: `\nAdditional context from the user: "${input.additionalContext}"`,
    });
  }

  // Add the analysis instruction
  userMessages.push({
    type: "text",
    text: CLEARIT_USER_PROMPT(hasImages, hasText, images.length, hasContext),
  });

  const openai = getOpenAIClient();
  const MODEL = getModel();

  const completion = await openai.chat.completions.create({
    model: MODEL,
    messages: [
      { role: "system", content: CLEARIT_SYSTEM_PROMPT },
      { role: "user", content: userMessages },
    ],
    max_tokens: 4096,
    temperature: 0.2,
  });

  const rawContent = completion.choices[0]?.message?.content;

  if (!rawContent) {
    throw new Error("No response from AI");
  }

  let parsed: unknown;
  try {
    const cleanedContent = rawContent
      .replace(/^```json\n?/, "")
      .replace(/^```\n?/, "")
      .replace(/\n?```$/, "")
      .trim();
    parsed = JSON.parse(cleanedContent);
  } catch {
    throw new Error("AI returned invalid JSON");
  }

  const partialData = parsed as Record<string, unknown>;
  const withDefaults = {
    id: nanoid(),
    createdAt: new Date().toISOString(),
    ...partialData,
  };

  const validated = ClearItAnalysisSchema.parse(withDefaults);
  return applySafetyPlaybook(validated as ClearItAnalysis);
}
