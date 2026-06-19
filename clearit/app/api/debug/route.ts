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

  // ── Cross-check model (OpenRouter preferred, Groq fallback) ─────────────
  const orKey   = process.env.OPENROUTER_API_KEY?.trim();
  const groqKey = process.env.GROQ_API_KEY?.trim();

  if (orKey) {
    try {
      const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${orKey}`,
          "Content-Type": "application/json",
          "HTTP-Referer": "https://letsconfirmit.com",
          "X-Title": "LetsConfirmIt",
        },
        body: JSON.stringify({
          model: "meta-llama/llama-3.2-90b-vision-instruct",
          messages: [{ role: "user", content: 'Reply with exactly this JSON: {"ok":true}' }],
          max_tokens: 50,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(JSON.stringify(data));
      results.gemini = { status: "ok", model: "openrouter/llama-3.2-90b-vision", response: data?.choices?.[0]?.message?.content };
    } catch (err) {
      results.gemini = { status: "error", model: "openrouter/llama-3.2-90b-vision", error: err instanceof Error ? err.message : String(err) };
    }
  } else if (groqKey) {
    try {
      const groq = new OpenAI({ apiKey: groqKey, baseURL: "https://api.groq.com/openai/v1" });
      const res = await groq.chat.completions.create({
        model: "llama-3.3-70b-versatile",
        messages: [{ role: "user", content: 'Reply with exactly this JSON: {"ok":true}' }],
        max_tokens: 50,
      });
      results.gemini = { status: "ok", model: "groq/llama-3.3-70b", response: res.choices[0]?.message?.content };
    } catch (err) {
      results.gemini = { status: "error", model: "groq/llama-3.3-70b", error: err instanceof Error ? err.message : String(err) };
    }
  } else {
    results.gemini = { status: "no_key", message: "Set OPENROUTER_API_KEY (preferred) or GROQ_API_KEY" };
  }

  // ── Summary ─────────────────────────────────────────────────────────────
  const bothOk =
    (results.openai as { status: string })?.status === "ok" &&
    (results.gemini as { status: string })?.status === "ok";

  return NextResponse.json({ bothOk, openai: results.openai, gemini: results.gemini });
}
