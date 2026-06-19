import { NextResponse } from "next/server";
import OpenAI from "openai";

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

  // ── Groq (Llama 3.3 70B) ────────────────────────────────────────────────
  const groqKey = process.env.GROQ_API_KEY?.trim();

  if (!groqKey) {
    results.gemini = { status: "no_key", model: "groq/llama-3.3-70b", message: "GROQ_API_KEY is not set in environment variables" };
  } else {
    try {
      const groq = new OpenAI({ apiKey: groqKey, baseURL: "https://api.groq.com/openai/v1" });
      const res = await groq.chat.completions.create({
        model: "llama-3.3-70b-versatile",
        messages: [{ role: "user", content: 'Reply with exactly this JSON: {"ok":true}' }],
        max_tokens: 50,
      });
      results.gemini = { status: "ok", model: "groq/llama-3.3-70b-versatile", response: res.choices[0]?.message?.content };
    } catch (err) {
      results.gemini = { status: "error", model: "groq/llama-3.3-70b-versatile", error: err instanceof Error ? err.message : String(err) };
    }
  }

  // ── Summary ─────────────────────────────────────────────────────────────
  const bothOk =
    (results.openai as { status: string })?.status === "ok" &&
    (results.gemini as { status: string })?.status === "ok";

  return NextResponse.json({ bothOk, openai: results.openai, gemini: results.gemini });
}
