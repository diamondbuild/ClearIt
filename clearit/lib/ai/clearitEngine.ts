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
  text?: string;
  imageBase64?: string;
  imageMediaType?: string;
}

export async function analyzeWithClearItEngine(
  input: EngineInput
): Promise<ClearItAnalysis> {
  const hasImage = !!input.imageBase64;
  const hasText = !!input.text;

  if (!hasImage && !hasText) {
    throw new Error("No input provided");
  }

  const userMessages: OpenAI.Chat.ChatCompletionContentPart[] = [];

  if (hasText) {
    userMessages.push({
      type: "text",
      text: `Here is the content to analyze:\n\n${input.text}`,
    });
  }

  if (hasImage) {
    const mediaType = (input.imageMediaType as "image/jpeg" | "image/png" | "image/gif" | "image/webp") || "image/jpeg";
    userMessages.push({
      type: "image_url",
      image_url: {
        url: `data:${mediaType};base64,${input.imageBase64}`,
        detail: "high",
      },
    });
  }

  userMessages.push({
    type: "text",
    text: CLEARIT_USER_PROMPT(hasImage, hasText),
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
