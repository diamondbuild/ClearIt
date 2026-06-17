import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { analyzeWithClearItEngine } from "@/lib/ai/clearitEngine";
import { getRandomDemoResult } from "@/lib/demo/demoResults";
import { AnalyzeResponse } from "@/lib/types";

const RequestSchema = z.object({
  text: z.string().optional(),
  imageBase64: z.string().optional(),
  imageMediaType: z.string().optional(),
});

export async function POST(req: NextRequest): Promise<NextResponse<AnalyzeResponse>> {
  try {
    const body = await req.json();
    const parsed = RequestSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: "Invalid request format." },
        { status: 400 }
      );
    }

    const { text, imageBase64, imageMediaType } = parsed.data;

    if (!text && !imageBase64) {
      return NextResponse.json(
        {
          success: false,
          error: "Please provide an image or text to analyze.",
        },
        { status: 400 }
      );
    }

    if (!process.env.OPENAI_API_KEY) {
      // Demo mode
      await new Promise((r) => setTimeout(r, 2000));
      const demo = getRandomDemoResult();
      return NextResponse.json({ success: true, data: demo });
    }

    try {
      const result = await analyzeWithClearItEngine({
        text,
        imageBase64,
        imageMediaType,
      });
      return NextResponse.json({ success: true, data: result });
    } catch (aiError) {
      console.error("AI analysis error:", aiError);
      const message =
        aiError instanceof Error ? aiError.message : "Unknown error";

      if (message.includes("JSON")) {
        return NextResponse.json(
          {
            success: false,
            error:
              "ClearIt couldn't parse the AI response. Please try again.",
          },
          { status: 500 }
        );
      }

      if (message.includes("image")) {
        return NextResponse.json(
          {
            success: false,
            error:
              "ClearIt couldn't read this image clearly. Try taking the photo closer, with better lighting, or paste the text instead.",
          },
          { status: 422 }
        );
      }

      return NextResponse.json(
        {
          success: false,
          error:
            "We couldn't analyze this clearly. Try a sharper photo or paste the text instead.",
        },
        { status: 500 }
      );
    }
  } catch (err) {
    console.error("Route error:", err);
    return NextResponse.json(
      {
        success: false,
        error: "Something went wrong. Please try again.",
      },
      { status: 500 }
    );
  }
}
