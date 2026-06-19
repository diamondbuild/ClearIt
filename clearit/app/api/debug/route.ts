import { NextResponse } from "next/server";
import OpenAI from "openai";
import { GoogleGenAI } from "@google/genai";

export async function GET() {
  const results: Record<string, unknown> = {};

  // ── OpenAI ──────────────────────────────────────────────────────────────
  const openaiKey = process.env.OPENAI_API_KEY?.trim();
  const model     = (process.env.OPENAI_MODEL ?? "gpt-4o").trim();
  const usesResponsesApi = model.startsWith("gpt-5") || model.startsWith("o1") || model.startsWith("o3") || model.startsWith("o4");

  if (!openaiKey) {
    results.openai = { status: "no_key", model };
  } else {
    try {
      const openai = new OpenAI({ apiKey: openaiKey });
      if (usesResponsesApi) {
        const res = await openai.responses.create({
          model,
          input: [{ role: "user", content: 'Reply with exactly this JSON: {"ok":true}' }],
          max_output_tokens: 50,
        } as Parameters<typeof openai.responses.create>[0]) as OpenAI.Responses.Response;
        const text = res.output
          .filter((i) => i.type === "message")
          .flatMap((i) =>
            (i as OpenAI.Responses.ResponseOutputMessage).content
              .filter((c) => c.type === "output_text")
              .map((c) => (c as OpenAI.Responses.ResponseOutputText).text)
          ).join("");
        results.openai = { status: "ok", api: "responses", model, response: text };
      } else {
        const res = await openai.chat.completions.create({
          model,
          messages: [{ role: "user", content: 'Reply with exactly this JSON: {"ok":true}' }],
          max_tokens: 50,
        });
        results.openai = { status: "ok", api: "chat_completions", model, response: res.choices[0]?.message?.content };
      }
    } catch (err) {
      results.openai = { status: "error", model, error: err instanceof Error ? err.message : String(err) };
    }
  }

  // ── Gemini ──────────────────────────────────────────────────────────────
  const geminiKey = process.env.GEMINI_API_KEY?.trim();

  if (!geminiKey) {
    results.gemini = { status: "no_key", message: "GEMINI_API_KEY is not set in environment variables" };
  } else {
    try {
      const ai = new GoogleGenAI({ apiKey: geminiKey });
      const response = await ai.models.generateContent({
        model: "gemini-2.0-flash",
        contents: [{ role: "user", parts: [{ text: 'Reply with exactly this JSON: {"ok":true}' }] }],
        config: { maxOutputTokens: 50 },
      });
      const text = response.text ?? "";
      results.gemini = { status: "ok", model: "gemini-2.0-flash", response: text.trim() };
    } catch (err) {
      results.gemini = { status: "error", model: "gemini-2.0-flash", error: err instanceof Error ? err.message : String(err) };
    }
  }

  // ── Summary ─────────────────────────────────────────────────────────────
  const bothOk =
    (results.openai as { status: string })?.status === "ok" &&
    (results.gemini as { status: string })?.status === "ok";

  return NextResponse.json({ bothOk, openai: results.openai, gemini: results.gemini });
}
