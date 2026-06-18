import OpenAI from "openai";
import { ClearItAnalysis } from "@/lib/types";
import { ClearItAnalysisSchema } from "@/lib/ai/schema";
import { CLEARIT_SYSTEM_PROMPT, CLEARIT_USER_PROMPT } from "@/lib/ai/prompts";
import { applySafetyPlaybook } from "@/lib/ai/safetyPlaybook";
import { nanoid } from "@/lib/utils";

function getOpenAIClient(): OpenAI {
  const apiKey = process.env.OPENAI_API_KEY?.trim();
  if (!apiKey) throw new Error("OPENAI_API_KEY is not set");
  return new OpenAI({ apiKey });
}

function getModel(): string {
  return (process.env.OPENAI_MODEL ?? "gpt-4o").trim();
}

// Newer models (gpt-5.x, o3, o4, etc.) use the Responses API.
// Legacy models (gpt-4o, gpt-4-turbo, etc.) use Chat Completions.
function usesResponsesApi(model: string): boolean {
  return (
    model.startsWith("gpt-5") ||
    model.startsWith("o3") ||
    model.startsWith("o4") ||
    model.startsWith("o1") ||
    model.includes("codex")
  );
}

export interface EngineInput {
  images?: string[];
  imageMediaTypes?: string[];
  text?: string;
  additionalContext?: string;
  imageCount?: number;
  // Legacy single image
  imageBase64?: string;
  imageMediaType?: string;
}

export async function analyzeWithClearItEngine(
  input: EngineInput
): Promise<ClearItAnalysis> {
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

  if (!hasImages && !hasText) throw new Error("No input provided");

  const openai = getOpenAIClient();
  const model = getModel();

  const userPrompt = CLEARIT_USER_PROMPT(hasImages, hasText, images.length, hasContext);

  let rawContent: string | null | undefined;

  if (usesResponsesApi(model)) {
    // ── Responses API (gpt-5.x and newer) ──────────────────────────────────
    const contentParts: OpenAI.Responses.ResponseInputMessageContentList = [];

    if (hasText) {
      contentParts.push({
        type: "input_text",
        text: `Here is the content to analyze:\n\n${input.text}`,
      });
    }

    for (let i = 0; i < images.length; i++) {
      if (images.length > 1) {
        contentParts.push({
          type: "input_text",
          text: `Image ${i + 1} of ${images.length}:`,
        });
      }
      const mt = mediaTypes[i] ?? "image/jpeg";
      contentParts.push({
        type: "input_image",
        image_url: `data:${mt};base64,${images[i]}`,
        detail: "high",
      });
    }

    if (hasContext) {
      contentParts.push({
        type: "input_text",
        text: `\nAdditional context from the user: "${input.additionalContext}"`,
      });
    }

    contentParts.push({
      type: "input_text",
      text: userPrompt,
    });

    const response = await openai.responses.create({
      model,
      instructions: CLEARIT_SYSTEM_PROMPT,
      input: [{ role: "user", content: contentParts }],
      max_output_tokens: 4096,
      tools: [
        {
          type: "web_search_preview",
          search_context_size: "medium",
        },
      ],
    } as Parameters<typeof openai.responses.create>[0]) as OpenAI.Responses.Response;

    // Extract text from the response output
    rawContent = response.output
      .filter((item) => item.type === "message")
      .flatMap((item) => {
        const msg = item as OpenAI.Responses.ResponseOutputMessage;
        return msg.content
          .filter((c) => c.type === "output_text")
          .map((c) => (c as OpenAI.Responses.ResponseOutputText).text);
      })
      .join("");
  } else {
    // ── Chat Completions API (gpt-4o and older) ─────────────────────────────
    const userMessages: OpenAI.Chat.ChatCompletionContentPart[] = [];

    if (hasText) {
      userMessages.push({
        type: "text",
        text: `Here is the content to analyze:\n\n${input.text}`,
      });
    }

    for (let i = 0; i < images.length; i++) {
      if (images.length > 1) {
        userMessages.push({ type: "text", text: `Image ${i + 1} of ${images.length}:` });
      }
      const mt = (mediaTypes[i] as "image/jpeg" | "image/png" | "image/gif" | "image/webp") ?? "image/jpeg";
      userMessages.push({
        type: "image_url",
        image_url: { url: `data:${mt};base64,${images[i]}`, detail: "high" },
      });
    }

    if (hasContext) {
      userMessages.push({
        type: "text",
        text: `\nAdditional context from the user: "${input.additionalContext}"`,
      });
    }

    userMessages.push({ type: "text", text: userPrompt });

    const completion = await openai.chat.completions.create({
      model,
      messages: [
        { role: "system", content: CLEARIT_SYSTEM_PROMPT },
        { role: "user", content: userMessages },
      ],
      max_tokens: 4096,
      temperature: 0.2,
    });

    rawContent = completion.choices[0]?.message?.content;
  }

  if (!rawContent) throw new Error("No response from AI");

  let parsed: unknown;
  try {
    // Strip markdown code fences if model wrapped the JSON
    const cleaned = rawContent
      .replace(/^```json\s*/i, "")
      .replace(/^```\s*/i, "")
      .replace(/\s*```$/i, "")
      .trim();
    parsed = JSON.parse(cleaned);
  } catch (jsonErr) {
    console.error("JSON parse failed. Raw content:", rawContent.slice(0, 500));
    throw new Error("JSON_PARSE_FAILED: " + rawContent.slice(0, 200));
  }

  const withDefaults = {
    id: nanoid(),
    createdAt: new Date().toISOString(),
    ...(parsed as Record<string, unknown>),
  };

  try {
    const validated = ClearItAnalysisSchema.parse(withDefaults);
    return applySafetyPlaybook(validated as ClearItAnalysis);
  } catch (zodErr) {
    console.error("Zod validation failed:", zodErr);
    throw new Error("ZOD_VALIDATION_FAILED: " + String(zodErr).slice(0, 300));
  }
}
