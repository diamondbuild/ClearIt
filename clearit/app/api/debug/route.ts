import { NextResponse } from "next/server";
import OpenAI from "openai";

// Diagnostic endpoint — tests OpenAI connectivity with a simple text call
// Visit /api/debug to see what's happening
export async function GET() {
  const apiKey = process.env.OPENAI_API_KEY?.trim();
  const model = (process.env.OPENAI_MODEL ?? "gpt-4o").trim();

  if (!apiKey) {
    return NextResponse.json({ status: "no_key", model, message: "OPENAI_API_KEY is not set" });
  }

  const usesResponsesApi =
    model.startsWith("gpt-5") ||
    model.startsWith("o3") ||
    model.startsWith("o4") ||
    model.startsWith("o1") ||
    model.includes("codex");

  try {
    const openai = new OpenAI({ apiKey });

    if (usesResponsesApi) {
      const res = await openai.responses.create({
        model,
        input: [{ role: "user", content: "Reply with exactly this JSON: {\"ok\":true}" }],
        max_output_tokens: 50,
      } as Parameters<typeof openai.responses.create>[0]) as OpenAI.Responses.Response;

      const text = res.output
        .filter((i) => i.type === "message")
        .flatMap((i) =>
          (i as OpenAI.Responses.ResponseOutputMessage).content
            .filter((c) => c.type === "output_text")
            .map((c) => (c as OpenAI.Responses.ResponseOutputText).text)
        )
        .join("");

      return NextResponse.json({ status: "ok", api: "responses", model, response: text });
    } else {
      const res = await openai.chat.completions.create({
        model,
        messages: [{ role: "user", content: 'Reply with exactly this JSON: {"ok":true}' }],
        max_tokens: 50,
      });
      return NextResponse.json({
        status: "ok",
        api: "chat_completions",
        model,
        response: res.choices[0]?.message?.content,
      });
    }
  } catch (err) {
    return NextResponse.json({
      status: "error",
      api: usesResponsesApi ? "responses" : "chat_completions",
      model,
      error: err instanceof Error ? err.message : String(err),
      errorName: err instanceof Error ? err.name : "Unknown",
    });
  }
}
