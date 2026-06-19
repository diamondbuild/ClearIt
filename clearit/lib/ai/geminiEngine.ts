/**
 * Cross-check engine — uses Groq (Llama 3.3 70B) as a free second opinion.
 * Groq uses the OpenAI-compatible API, so no extra SDK needed.
 * Free tier: https://console.groq.com — no credit card required.
 *
 * Since Groq's free models are text-only (no vision), we pass the GPT
 * analysis summary + original text as context. For image-only inputs,
 * Groq cross-checks based on GPT's own description of what it saw.
 */

import OpenAI from "openai";

export interface GeminiVote {
  category: string;
  urgency: string;
  oneSentenceSummary: string;
  keyWarning: string;
  confident: boolean;
}

const GROQ_PROMPT = `You are a second-opinion AI cross-checking another AI's document analysis.

Given the content below, return ONLY a JSON object:
{
  "category": "one of: bill, insurance, medical, bank_alert, possible_scam, school_form, work_hr, legal_notice, government, subscription, app_error, device_error, appliance, parking_ticket, shipping_delivery, tax, mortgage_rent, utility, general_message, meme_image, person_public_figure, product_object, nature_animal, place_landmark, artwork_media, screenshot_ui, unknown",
  "urgency": "one of: low, medium, high, possible_scam, emergency, unknown",
  "oneSentenceSummary": "your own one-sentence plain English summary",
  "keyWarning": "any important warning not already mentioned, or empty string",
  "confident": true or false
}

Return ONLY valid JSON. No markdown.`;

function getGroqClient(): OpenAI | null {
  const apiKey = process.env.GROQ_API_KEY?.trim();
  if (!apiKey) return null;
  return new OpenAI({
    apiKey,
    baseURL: "https://api.groq.com/openai/v1",
  });
}

export async function getGeminiVote(input: {
  images?: string[];
  imageMediaTypes?: string[];
  text?: string;
  // GPT's analysis for context when images can't be passed to text-only models
  gptSummary?: {
    plainTitle: string;
    whatThisIs: string;
    oneSentenceSummary: string;
    category: string;
    urgency: string;
  };
}): Promise<GeminiVote | null> {
  const groq = getGroqClient();
  if (!groq) return null;

  try {
    // Build context for Groq — combine original text + GPT's description
    const contextParts: string[] = [];

    if (input.text) {
      contextParts.push(`Original content:\n${input.text.slice(0, 6000)}`);
    }

    if (input.gptSummary) {
      contextParts.push(
        `First AI's analysis:\n` +
        `- Title: ${input.gptSummary.plainTitle}\n` +
        `- What it is: ${input.gptSummary.whatThisIs.slice(0, 400)}\n` +
        `- Category: ${input.gptSummary.category}\n` +
        `- Urgency: ${input.gptSummary.urgency}`
      );
    }

    if (input.images?.length && !input.text && !input.gptSummary) {
      contextParts.push("(Image content — use the first AI's analysis above as context)");
    }

    const userMessage = contextParts.join("\n\n") + "\n\n" + GROQ_PROMPT;

    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [{ role: "user", content: userMessage }],
      max_tokens: 300,
      temperature: 0.1,
    });

    const raw = completion.choices[0]?.message?.content ?? "";
    const cleaned = raw.replace(/^```json\s*/i, "").replace(/^```\s*/i, "").replace(/\s*```$/i, "").trim();
    const parsed = JSON.parse(cleaned);

    return {
      category: parsed.category ?? "unknown",
      urgency: parsed.urgency ?? "unknown",
      oneSentenceSummary: parsed.oneSentenceSummary ?? "",
      keyWarning: parsed.keyWarning ?? "",
      confident: parsed.confident === true,
    };
  } catch (err) {
    console.warn("Groq cross-check failed (non-fatal):", err instanceof Error ? err.message : err);
    return null;
  }
}

export function mergeWithGeminiVote(
  analysis: import("@/lib/types").ClearItAnalysis,
  vote: GeminiVote | null
): import("@/lib/types").ClearItAnalysis & { geminiVerified: boolean; geminiDisagreement?: string } {
  if (!vote) return { ...analysis, geminiVerified: false };

  const categoryMatch = vote.category === analysis.category;
  const urgencyMatch  = vote.urgency  === analysis.urgency;
  const bothConfident = vote.confident && analysis.confidence !== "low";

  let upgraded = { ...analysis };

  // Groq spots scam that GPT missed → upgrade
  if (vote.urgency === "possible_scam" && analysis.urgency === "low") {
    upgraded = { ...upgraded, urgency: "possible_scam" };
    if (!upgraded.warnings.some(w => w.includes("scam"))) {
      upgraded.warnings = [
        "A second AI independently flagged this as a possible scam. Treat with caution.",
        ...upgraded.warnings,
      ];
    }
  }

  // Groq adds a new warning
  if (vote.keyWarning && vote.keyWarning.length > 10) {
    if (!upgraded.warnings.some(w => w.toLowerCase().includes(vote.keyWarning.toLowerCase().slice(0, 20)))) {
      upgraded.warnings = [...upgraded.warnings, vote.keyWarning];
    }
  }

  const verified = categoryMatch && urgencyMatch && bothConfident;
  const disagreement = !categoryMatch
    ? `Category: GPT says "${analysis.category}", Groq says "${vote.category}"`
    : !urgencyMatch
    ? `Urgency: GPT says "${analysis.urgency}", Groq says "${vote.urgency}"`
    : undefined;

  if (verified && upgraded.confidence !== "high") {
    upgraded = { ...upgraded, confidence: "high" };
  }

  return { ...upgraded, geminiVerified: verified, geminiDisagreement: disagreement };
}
