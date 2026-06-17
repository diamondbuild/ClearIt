import OpenAI from "openai";
import { ClearItAnalysis, AnalyzeInput } from "@/lib/types";
import {
  clearItModelSchema,
  clearItJsonSchema,
  ClearItModelOutput,
} from "@/lib/ai/schema";
import { CLEARIT_SYSTEM_PROMPT, buildUserPrompt } from "@/lib/ai/prompts";
import { applySafetyPlaybook } from "@/lib/ai/safety";
import { pickDemoResult } from "@/lib/demo/demoResults";
import { generateId } from "@/lib/utils";

export class ClearItEngineError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ClearItEngineError";
  }
}

export function isDemoMode(): boolean {
  return !process.env.OPENAI_API_KEY;
}

function finalize(
  model: ClearItModelOutput,
  rawText?: string,
): ClearItAnalysis {
  const safe = applySafetyPlaybook(model, rawText);
  return {
    ...safe,
    id: generateId(),
    createdAt: new Date().toISOString(),
  };
}

/**
 * Produce a demo (mock) analysis when no API key is configured.
 */
export function analyzeDemo(input: AnalyzeInput): ClearItAnalysis {
  const picked = pickDemoResult(input.text, input.hadImage || !!input.imageBase64);
  return finalize(picked, input.text);
}

/**
 * Main ClearIt engine entry point. Calls OpenAI from the server only, requests
 * a structured JSON response, validates it with Zod, applies the safety
 * playbook, and returns clean app-ready JSON.
 */
export async function analyzeWithClearItEngine(
  input: AnalyzeInput,
): Promise<ClearItAnalysis> {
  if (isDemoMode()) {
    return analyzeDemo(input);
  }

  const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  const model = process.env.OPENAI_MODEL || "gpt-5.5";

  const hasImage = !!input.imageBase64;
  const userText = buildUserPrompt(input.text, hasImage);

  const userContent: Array<
    | { type: "text"; text: string }
    | { type: "image_url"; image_url: { url: string } }
  > = [{ type: "text", text: userText }];

  if (hasImage && input.imageBase64) {
    const url = input.imageBase64.startsWith("data:")
      ? input.imageBase64
      : `data:image/jpeg;base64,${input.imageBase64}`;
    userContent.push({ type: "image_url", image_url: { url } });
  }

  let raw: string | null = null;

  try {
    const completion = await client.chat.completions.create({
      model,
      messages: [
        { role: "system", content: CLEARIT_SYSTEM_PROMPT },
        { role: "user", content: userContent },
      ],
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "clearit_analysis",
          strict: true,
          schema: clearItJsonSchema as unknown as Record<string, unknown>,
        },
      },
    });
    raw = completion.choices[0]?.message?.content ?? null;
  } catch (err) {
    // Retry once without strict structured outputs in case the model/endpoint
    // doesn't support json_schema; fall back to json_object mode.
    try {
      const client2 = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
      const completion = await client2.chat.completions.create({
        model,
        messages: [
          {
            role: "system",
            content:
              CLEARIT_SYSTEM_PROMPT +
              "\n\nReturn a single valid JSON object only, with no markdown fences.",
          },
          { role: "user", content: userContent },
        ],
        response_format: { type: "json_object" },
      });
      raw = completion.choices[0]?.message?.content ?? null;
    } catch (err2) {
      throw new ClearItEngineError(
        "We couldn’t analyze this clearly. Try a sharper photo or paste the text instead.",
      );
    }
  }

  if (!raw) {
    throw new ClearItEngineError(
      "We couldn’t analyze this clearly. Try a sharper photo or paste the text instead.",
    );
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(stripFences(raw));
  } catch {
    throw new ClearItEngineError(
      "We couldn’t analyze this clearly. Try a sharper photo or paste the text instead.",
    );
  }

  const validation = clearItModelSchema.safeParse(parsed);
  if (!validation.success) {
    throw new ClearItEngineError(
      "We couldn’t analyze this clearly. Try a sharper photo or paste the text instead.",
    );
  }

  return finalize(validation.data, input.text);
}

function stripFences(text: string): string {
  const trimmed = text.trim();
  if (trimmed.startsWith("```")) {
    return trimmed
      .replace(/^```(?:json)?\s*/i, "")
      .replace(/```$/i, "")
      .trim();
  }
  return trimmed;
}
