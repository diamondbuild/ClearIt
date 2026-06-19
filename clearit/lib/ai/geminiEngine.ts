import { GoogleGenAI } from "@google/genai";

export interface GeminiVote {
  category: string;
  urgency: string;
  oneSentenceSummary: string;
  keyWarning: string; // any extra warning Gemini flags that GPT might have missed
  confident: boolean;
}

const GEMINI_PROMPT = `You are a second-opinion AI reviewing a document, image, or message to cross-check another AI's analysis.

Look at the provided content and return ONLY a JSON object with these exact fields:
{
  "category": "one of: bill, insurance, medical, bank_alert, possible_scam, school_form, work_hr, legal_notice, government, subscription, app_error, device_error, appliance, parking_ticket, shipping_delivery, tax, mortgage_rent, utility, general_message, meme_image, person_public_figure, product_object, nature_animal, place_landmark, artwork_media, screenshot_ui, unknown",
  "urgency": "one of: low, medium, high, possible_scam, emergency, unknown",
  "oneSentenceSummary": "your own one-sentence plain English summary of what this is",
  "keyWarning": "any important warning you see that should be flagged, or empty string if none",
  "confident": true or false
}

Return ONLY the JSON. No markdown, no explanation.`;

export async function getGeminiVote(input: {
  images?: string[];
  imageMediaTypes?: string[];
  text?: string;
}): Promise<GeminiVote | null> {
  const apiKey = process.env.GEMINI_API_KEY?.trim();
  if (!apiKey) return null;

  try {
    const ai = new GoogleGenAI({ apiKey });

    // Build parts array as plain objects typed via the SDK
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const parts: any[] = [];

    // Add images
    if (input.images?.length) {
      for (let i = 0; i < Math.min(input.images.length, 4); i++) {
        parts.push({
          inlineData: {
            data: input.images[i],
            mimeType: input.imageMediaTypes?.[i] ?? "image/jpeg",
          },
        });
      }
    }

    // Add text
    if (input.text) {
      parts.push({ text: `Content to analyze:\n\n${input.text.slice(0, 8000)}` });
    }

    parts.push({ text: GEMINI_PROMPT });

    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: [{ role: "user", parts }],
      config: { maxOutputTokens: 400 },
    });

    const raw = response.text ?? "";
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
    console.warn("Gemini cross-check failed (non-fatal):", err instanceof Error ? err.message : err);
    return null;
  }
}

// Merge GPT result with Gemini vote
export function mergeWithGeminiVote(
  analysis: import("@/lib/types").ClearItAnalysis,
  vote: GeminiVote | null
): import("@/lib/types").ClearItAnalysis & { geminiVerified: boolean; geminiDisagreement?: string } {
  if (!vote) {
    return { ...analysis, geminiVerified: false };
  }

  const categoryMatch = vote.category === analysis.category;
  const urgencyMatch  = vote.urgency  === analysis.urgency;
  const bothConfident = vote.confident && analysis.confidence !== "low";

  // If Gemini sees a scam and GPT didn't flag it, upgrade urgency
  let upgraded = { ...analysis };
  if (vote.urgency === "possible_scam" && analysis.urgency === "low") {
    upgraded = { ...upgraded, urgency: "possible_scam" };
    if (!upgraded.warnings.some(w => w.includes("scam"))) {
      upgraded.warnings = [
        "A second AI independently flagged this as a possible scam. Treat with caution.",
        ...upgraded.warnings,
      ];
    }
  }

  // Add Gemini's key warning if it's new and meaningful
  if (vote.keyWarning && vote.keyWarning.length > 10) {
    if (!upgraded.warnings.some(w => w.toLowerCase().includes(vote.keyWarning.toLowerCase().slice(0, 20)))) {
      upgraded.warnings = [...upgraded.warnings, vote.keyWarning];
    }
  }

  const verified = categoryMatch && urgencyMatch && bothConfident;
  const disagreement = !categoryMatch
    ? `Category: GPT says "${analysis.category}", Gemini says "${vote.category}"`
    : !urgencyMatch
    ? `Urgency: GPT says "${analysis.urgency}", Gemini says "${vote.urgency}"`
    : undefined;

  // Boost confidence when both models agree
  if (verified && upgraded.confidence !== "high") {
    upgraded = { ...upgraded, confidence: "high" };
  }

  return { ...upgraded, geminiVerified: verified, geminiDisagreement: disagreement };
}
