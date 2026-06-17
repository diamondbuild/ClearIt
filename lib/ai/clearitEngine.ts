import OpenAI from "openai";
import { CLEARIT_SYSTEM_PROMPT, buildClearItUserPrompt } from "@/lib/ai/prompts";
import { applySafetyPlaybooks } from "@/lib/ai/safety";
import { clearItAnalysisSchema, openAiStructuredSchema } from "@/lib/ai/schema";
import type { AnalyzeRequest, ClearItAnalysis } from "@/lib/types";
import { createId } from "@/lib/utils";

function getModel() {
  return process.env.OPENAI_MODEL?.trim() || "gpt-5.5";
}

function dataUrlFromBase64(input: AnalyzeRequest) {
  if (!input.imageBase64) {
    return undefined;
  }

  const mimeType = input.imageMimeType?.trim() || "image/jpeg";
  const base64 = input.imageBase64.includes(",") ? input.imageBase64.split(",").pop() : input.imageBase64;
  return `data:${mimeType};base64,${base64}`;
}

function extractJsonText(response: unknown) {
  const outputText = (response as { output_text?: unknown }).output_text;

  if (typeof outputText === "string" && outputText.trim()) {
    return outputText;
  }

  const output = (response as { output?: unknown }).output;
  if (!Array.isArray(output)) {
    return "";
  }

  for (const item of output) {
    const content = (item as { content?: unknown }).content;
    if (!Array.isArray(content)) {
      continue;
    }

    for (const part of content) {
      const text = (part as { text?: unknown }).text;
      if (typeof text === "string" && text.trim()) {
        return text;
      }
    }
  }

  return "";
}

export async function analyzeWithClearItEngine(input: AnalyzeRequest): Promise<ClearItAnalysis> {
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    throw new Error("OPENAI_API_KEY is required for live analysis.");
  }

  const client = new OpenAI({ apiKey });
  const imageUrl = dataUrlFromBase64(input);
  const userPrompt = buildClearItUserPrompt({
    text: input.text,
    hasImage: Boolean(imageUrl),
    fileName: input.fileName,
  });

  const content: Array<Record<string, unknown>> = [{ type: "input_text", text: userPrompt }];

  if (imageUrl) {
    content.push({ type: "input_image", image_url: imageUrl, detail: "auto" });
  }

  const request = {
    model: getModel(),
    input: [
      {
        role: "system",
        content: CLEARIT_SYSTEM_PROMPT,
      },
      {
        role: "user",
        content,
      },
    ],
    text: {
      format: {
        type: "json_schema",
        ...openAiStructuredSchema,
      },
    },
  };

  const response = await client.responses.create(request as Parameters<typeof client.responses.create>[0]);
  const rawJson = extractJsonText(response);

  if (!rawJson) {
    throw new Error("The AI response did not include readable JSON.");
  }

  const parsed = clearItAnalysisSchema.parse(JSON.parse(rawJson));
  const normalized: ClearItAnalysis = {
    ...parsed,
    id: parsed.id || createId(),
    createdAt: parsed.createdAt || new Date().toISOString(),
  };

  return applySafetyPlaybooks(normalized, input);
}
