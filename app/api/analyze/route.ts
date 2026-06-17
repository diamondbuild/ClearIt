import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { analyzeWithClearItEngine } from "@/lib/ai/clearitEngine";
import { analyzeRequestSchema } from "@/lib/ai/schema";
import { getDemoResult } from "@/lib/demo/demoResults";

export const runtime = "nodejs";

const supportedImageTypes = new Set(["image/png", "image/jpeg", "image/jpg", "image/heic", "image/heif"]);

function friendlyError(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

export async function POST(request: Request) {
  try {
    const body = analyzeRequestSchema.parse(await request.json());

    if (body.imageBase64) {
      if (body.imageMimeType && !supportedImageTypes.has(body.imageMimeType)) {
        return friendlyError("ClearIt supports PNG, JPG, JPEG, and HEIC images for this MVP.");
      }

      if (body.imageBase64.length > 9_000_000) {
        return friendlyError("This image is too large. Try a closer crop, screenshot, or paste the text instead.", 413);
      }
    }

    if (body.demoMode || !process.env.OPENAI_API_KEY) {
      return NextResponse.json(getDemoResult(body));
    }

    const result = await analyzeWithClearItEngine(body);
    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof ZodError) {
      return friendlyError(error.issues[0]?.message ?? "Add a clear photo or paste text to analyze.");
    }

    console.error("ClearIt analysis failed", error);

    return friendlyError(
      "We couldn't analyze this clearly. Try a sharper photo with better lighting, or paste the text instead.",
      502,
    );
  }
}
