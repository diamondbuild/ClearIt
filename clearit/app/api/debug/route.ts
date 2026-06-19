import { NextResponse } from "next/server";
import OpenAI from "openai";
import https from "https";

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
      // Use Node https directly — Next.js fetch patches strip Authorization headers
      const bodyStr = JSON.stringify({
        model: "meta-llama/llama-3.2-11b-vision-instruct",
        messages: [{ role: "user", content: 'Reply with exactly this JSON: {"ok":true}' }],
        max_tokens: 50,
      });
      const orResponse = await new Promise<string>((resolve, reject) => {
        const req = https.request({
          hostname: "openrouter.ai", path: "/api/v1/chat/completions", method: "POST",
          headers: {
            "Authorization": `Bearer ${orKey}`,
            "Content-Type": "application/json",
            "Content-Length": Buffer.byteLength(bodyStr),
            "HTTP-Referer": "https://letsconfirmit.com",
            "X-Title": "LetsConfirmIt",
          },
        }, (res) => {
          let d = ""; res.on("data", c => d += c);
          res.on("end", () => (res.statusCode ?? 0) >= 400 ? reject(new Error(`${res.statusCode}: ${d.slice(0,200)}`)) : resolve(d));
        });
        req.on("error", reject); req.write(bodyStr); req.end();
      });
      const orData = JSON.parse(orResponse);
      results.gemini = { status: "ok", model: "openrouter/llama-3.2-90b-vision", keyPrefix: orKey.slice(0,12)+"...", response: orData?.choices?.[0]?.message?.content };
    } catch (err) {
      results.gemini = { status: "error", model: "openrouter/llama-3.2-90b-vision", keyPrefix: orKey.slice(0,12)+"...", keyLength: orKey.length, error: err instanceof Error ? err.message : String(err) };
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

  // ── Supabase ─────────────────────────────────────────────────────────────
  const sbUrl  = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const sbAnon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();
  if (!sbUrl || !sbAnon) {
    results.supabase = { status: "no_key", message: "NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY not set" };
  } else {
    try {
      const { createClient } = await import("@supabase/supabase-js");
      const sb = createClient(sbUrl, sbAnon);
      // Count check
      const { count, error: countErr } = await sb.from("analyses").select("id", { count: "exact", head: true });
      if (countErr) {
        results.supabase = { status: "error", error: countErr.message, hint: countErr.hint ?? "" };
      } else {
        // Also do a real SELECT to verify data is readable
        const { data: rows, error: selectErr } = await sb
          .from("analyses")
          .select("id, category, urgency, plain_title, created_at")
          .order("created_at", { ascending: false })
          .limit(3);
        results.supabase = {
          status: selectErr ? "select_error" : "ok",
          rowCount: count ?? 0,
          selectError: selectErr?.message ?? null,
          sampleRows: rows?.map(r => ({ id: r.id?.slice(0, 8), category: r.category, urgency: r.urgency })) ?? [],
        };
      }
    } catch (err) {
      results.supabase = { status: "error", error: err instanceof Error ? err.message : String(err) };
    }
  }

  // ── Summary ─────────────────────────────────────────────────────────────
  const bothOk =
    (results.openai as { status: string })?.status === "ok" &&
    (results.gemini as { status: string })?.status === "ok";

  return NextResponse.json({ bothOk, openai: results.openai, gemini: results.gemini, supabase: results.supabase });
}
