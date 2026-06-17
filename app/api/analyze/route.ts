import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import {
  analyzeWithClearItEngine,
  ClearItEngineError,
} from "@/lib/ai/clearitEngine";
import { AnalyzeApiResponse } from "@/lib/types";

export const runtime = "nodejs";
export const maxDuration = 60;

const requestSchema = z
  .object({
    text: z.string().max(20000).optional(),
    imageBase64: z.string().optional(),
    hadImage: z.boolean().optional(),
  })
  .refine(
    (data) =>
      (data.text && data.text.trim().length > 0) ||
      (data.imageBase64 && data.imageBase64.length > 0),
    { message: "no-input" },
  );

// ~10MB base64 ceiling for the inline image payload.
const MAX_IMAGE_BASE64 = 10 * 1024 * 1024;

export async function POST(req: NextRequest): Promise<NextResponse<AnalyzeApiResponse>> {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { ok: false, error: "We couldn't read your request. Please try again." },
      { status: 400 },
    );
  }

  const parsed = requestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      {
        ok: false,
        error:
          "Add a photo or paste some text first so ClearIt has something to read.",
      },
      { status: 400 },
    );
  }

  const { text, imageBase64, hadImage } = parsed.data;

  if (imageBase64 && imageBase64.length > MAX_IMAGE_BASE64) {
    return NextResponse.json(
      {
        ok: false,
        error:
          "That image is too large to analyze. Try a smaller or clearer photo, or paste the text instead.",
      },
      { status: 413 },
    );
  }

  try {
    const result = await analyzeWithClearItEngine({
      text,
      imageBase64,
      hadImage: hadImage ?? !!imageBase64,
    });

    return NextResponse.json({
      ok: true,
      result,
      demo: !process.env.OPENAI_API_KEY,
    });
  } catch (err) {
    if (err instanceof ClearItEngineError) {
      return NextResponse.json(
        { ok: false, error: err.message },
        { status: 502 },
      );
    }
    return NextResponse.json(
      {
        ok: false,
        error:
          "ClearIt couldn't analyze this clearly. Try a sharper photo or paste the text instead.",
      },
      { status: 500 },
    );
  }
}
