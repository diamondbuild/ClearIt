/**
 * Cross-check engine — second opinion using OpenRouter or Groq.
 *
 * Priority:
 * 1. OpenRouter (OPENROUTER_API_KEY) — uses a vision-capable model so it
 *    can actually SEE the images, not just read GPT's description.
 *    Model: meta-llama/llama-3.2-90b-vision-instruct (free tier available)
 *
 * 2. Groq (GROQ_API_KEY) — text-only fallback using Llama 3.3 70B.
 *    Fast and free. Cross-checks based on GPT's summary + original text.
 *
 * Both are OpenAI-SDK compatible — no extra packages needed.
 */

import OpenAI from "openai";
import https from "https";

export interface GeminiVote {
  category: string;
  urgency: string;
  oneSentenceSummary: string;
  keyWarning: string;
  confident: boolean;
}

const CROSS_CHECK_PROMPT = `You are a second-opinion AI cross-checking another AI's analysis of a document, image, or message.

Return ONLY a JSON object:
{
  "category": "one of: bill, insurance, medical, bank_alert, possible_scam, school_form, work_hr, legal_notice, government, subscription, app_error, device_error, appliance, parking_ticket, shipping_delivery, tax, mortgage_rent, utility, general_message, meme_image, person_public_figure, product_object, nature_animal, place_landmark, artwork_media, screenshot_ui, unknown",
  "urgency": "one of: low, medium, high, possible_scam, emergency, unknown",
  "oneSentenceSummary": "your own one-sentence plain English summary of what this is",
  "keyWarning": "any important warning the first AI may have missed, or empty string if none",
  "confident": true or false
}

Return ONLY valid JSON. No markdown.`;

// ── OpenRouter (vision-capable, preferred) ────────────────────────────────────
// Uses Node.js https module directly — bypasses Next.js fetch patches that
// strip Authorization headers on outbound requests.
async function callOpenRouterRaw(
  messages: { role: string; content: unknown }[],
  model = "meta-llama/llama-3.2-90b-vision-instruct"
): Promise<string | null> {
  const apiKey = process.env.OPENROUTER_API_KEY?.trim();
  if (!apiKey) return null;

  const bodyStr = JSON.stringify({ model, messages, max_tokens: 350 });

  return new Promise((resolve, reject) => {
    const req = https.request(
      {
        hostname: "openrouter.ai",
        path: "/api/v1/chat/completions",
        method: "POST",
        headers: {
          "Authorization": `Bearer ${apiKey}`,
          "Content-Type": "application/json",
          "Content-Length": Buffer.byteLength(bodyStr),
          "HTTP-Referer": "https://letsconfirmit.com",
          "X-Title": "LetsConfirmIt",
        },
      },
      (res) => {
        let data = "";
        res.on("data", (chunk) => { data += chunk; });
        res.on("end", () => {
          try {
            const parsed = JSON.parse(data);
            if (res.statusCode && res.statusCode >= 400) {
              reject(new Error(`OpenRouter ${res.statusCode}: ${data.slice(0, 200)}`));
              return;
            }
            resolve(parsed?.choices?.[0]?.message?.content ?? null);
          } catch {
            reject(new Error(`OpenRouter parse error: ${data.slice(0, 100)}`));
          }
        });
      }
    );
    req.on("error", reject);
    req.write(bodyStr);
    req.end();
  });
}

// ── Groq (text-only, fallback) ────────────────────────────────────────────────
function getGroqClient(): OpenAI | null {
  const apiKey = process.env.GROQ_API_KEY?.trim();
  if (!apiKey) return null;
  return new OpenAI({ apiKey, baseURL: "https://api.groq.com/openai/v1" });
}

export async function getGeminiVote(input: {
  images?: string[];
  imageMediaTypes?: string[];
  text?: string;
  gptSummary?: {
    plainTitle: string;
    whatThisIs: string;
    oneSentenceSummary: string;
    category: string;
    urgency: string;
  };
}): Promise<GeminiVote | null> {
  const hasOpenRouter = !!process.env.OPENROUTER_API_KEY?.trim();
  const groqClient = getGroqClient();

  if (!hasOpenRouter && !groqClient) return null;

  // Try OpenRouter first (has vision)
  if (hasOpenRouter) {
    try {
      const result = await callOpenRouter(input);
      if (result) return result;
    } catch (err) {
      console.warn("OpenRouter cross-check failed, trying Groq:", err instanceof Error ? err.message : err);
    }
  }

  // Fall back to Groq (text-only)
  if (groqClient) {
    try {
      return await callGroq(groqClient, input);
    } catch (err) {
      console.warn("Groq cross-check failed:", err instanceof Error ? err.message : err);
    }
  }

  return null;
}

async function callOpenRouter(
  input: typeof getGeminiVote extends (i: infer I) => unknown ? I : never
): Promise<GeminiVote | null> {
  const content: { type: string; text?: string; image_url?: { url: string; detail: string } }[] = [];

  if (input.images?.length) {
    for (let i = 0; i < Math.min(input.images.length, 3); i++) {
      const mt = input.imageMediaTypes?.[i] ?? "image/jpeg";
      if (i > 0) content.push({ type: "text", text: `Image ${i + 1}:` });
      content.push({ type: "image_url", image_url: { url: `data:${mt};base64,${input.images[i]}`, detail: "low" } });
    }
  }
  if (input.text) content.push({ type: "text", text: `Content:\n${input.text.slice(0, 4000)}` });
  if (input.gptSummary) {
    content.push({ type: "text", text: `First AI: "${input.gptSummary.plainTitle}" — category: ${input.gptSummary.category}, urgency: ${input.gptSummary.urgency}` });
  }
  content.push({ type: "text", text: CROSS_CHECK_PROMPT });

  const raw = await callOpenRouterRaw([{ role: "user", content }]);
  return raw ? parseVote(raw) : null;
}

async function callGroq(
  client: OpenAI,
  input: typeof getGeminiVote extends (i: infer I) => unknown ? I : never
): Promise<GeminiVote | null> {
  const parts: string[] = [];
  if (input.text) parts.push(`Content:\n${input.text.slice(0, 5000)}`);
  if (input.gptSummary) {
    parts.push(
      `First AI's analysis:\n- Title: ${input.gptSummary.plainTitle}\n- What it is: ${input.gptSummary.whatThisIs.slice(0, 300)}\n- Category: ${input.gptSummary.category}\n- Urgency: ${input.gptSummary.urgency}`
    );
  }
  parts.push(CROSS_CHECK_PROMPT);

  const completion = await client.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    messages: [{ role: "user", content: parts.join("\n\n") }],
    max_tokens: 300,
    temperature: 0.1,
  });

  return parseVote(completion.choices[0]?.message?.content ?? "");
}

function parseVote(raw: string): GeminiVote | null {
  try {
    const cleaned = raw.replace(/^```json\s*/i, "").replace(/^```\s*/i, "").replace(/\s*```$/i, "").trim();
    const parsed = JSON.parse(cleaned);
    return {
      category: parsed.category ?? "unknown",
      urgency: parsed.urgency ?? "unknown",
      oneSentenceSummary: parsed.oneSentenceSummary ?? "",
      keyWarning: parsed.keyWarning ?? "",
      confident: parsed.confident === true,
    };
  } catch {
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
