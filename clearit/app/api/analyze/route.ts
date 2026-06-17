import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { analyzeWithClearItEngine } from "@/lib/ai/clearitEngine";
import { getRandomDemoResult } from "@/lib/demo/demoResults";
import { AnalyzeResponse } from "@/lib/types";

const RequestSchema = z.object({
  imageBase64: z.string().optional(),
  imageMediaType: z.string().optional(),
  images: z.array(z.string()).optional(),
  imageMediaTypes: z.array(z.string()).optional(),
  text: z.string().optional(),
  additionalContext: z.string().optional(),
  docxBase64: z.string().optional(),
  fileType: z.enum(["pdf", "docx", "doc"]).optional(),
  fileName: z.string().optional(),
});

async function extractDocxText(base64: string): Promise<string> {
  const mammoth = await import("mammoth");
  const buffer = Buffer.from(base64, "base64");
  const result = await mammoth.extractRawText({ buffer });
  return result.value;
}

function classifyAiError(err: unknown): { message: string; status: number; fallbackToDemo: boolean } {
  const msg = err instanceof Error ? err.message : String(err);
  const msgLower = msg.toLowerCase();

  // Auth / key issues → tell them exactly what's wrong
  if (
    msgLower.includes("401") ||
    msgLower.includes("authentication") ||
    msgLower.includes("api key") ||
    msgLower.includes("incorrect api key") ||
    msgLower.includes("invalid api key") ||
    msgLower.includes("apikey")
  ) {
    return {
      message:
        "The OpenAI API key is missing or invalid. Please add a valid OPENAI_API_KEY in your Vercel environment variables, then redeploy.",
      status: 401,
      fallbackToDemo: true,
    };
  }

  // Rate limit
  if (msgLower.includes("429") || msgLower.includes("rate limit")) {
    return {
      message: "Too many requests right now. Please wait a moment and try again.",
      status: 429,
      fallbackToDemo: false,
    };
  }

  // Model not found / access
  if (msgLower.includes("model") && (msgLower.includes("not found") || msgLower.includes("access"))) {
    return {
      message:
        "The AI model specified is not available on your OpenAI account. Try setting OPENAI_MODEL=gpt-4o in Vercel and redeploying.",
      status: 400,
      fallbackToDemo: true,
    };
  }

  // JSON parsing of AI response
  if (msgLower.includes("json") || msgLower.includes("parse")) {
    return {
      message: "The AI returned an unexpected response. Please try again.",
      status: 500,
      fallbackToDemo: false,
    };
  }

  // Image / content issues
  if (
    msgLower.includes("image") ||
    msgLower.includes("vision") ||
    msgLower.includes("content")
  ) {
    return {
      message:
        "ClearIt couldn't read this image clearly. Try a sharper photo with better lighting, or paste the text instead.",
      status: 422,
      fallbackToDemo: false,
    };
  }

  // Timeout / network
  if (msgLower.includes("timeout") || msgLower.includes("network") || msgLower.includes("fetch")) {
    return {
      message: "The request timed out. Please try again.",
      status: 504,
      fallbackToDemo: false,
    };
  }

  return {
    message: "We couldn't analyze this clearly. Try a sharper photo or paste the text instead.",
    status: 500,
    fallbackToDemo: false,
  };
}

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

    const {
      imageBase64,
      imageMediaType,
      images,
      imageMediaTypes,
      text,
      additionalContext,
      docxBase64,
      fileType,
      fileName,
    } = parsed.data;

    // Normalize images into an array
    const allImages: string[] = [];
    const allMediaTypes: string[] = [];

    if (images && images.length > 0) {
      allImages.push(...images.slice(0, 6));
      allMediaTypes.push(...(imageMediaTypes ?? images.map(() => "image/jpeg")).slice(0, 6));
    } else if (imageBase64) {
      allImages.push(imageBase64);
      allMediaTypes.push(imageMediaType ?? "image/jpeg");
    }

    // Extract text from document files
    let extractedText = text ?? "";
    let fileContext = "";

    if (docxBase64 && (fileType === "docx" || fileType === "doc")) {
      try {
        extractedText = await extractDocxText(docxBase64);
        fileContext = `[This is a ${fileType?.toUpperCase()} file: ${fileName ?? "uploaded document"}]`;
      } catch (err) {
        console.error("DOCX extraction error:", err);
        return NextResponse.json(
          { success: false, error: "Couldn't read this document. Try copying the text and pasting it instead." },
          { status: 422 }
        );
      }
    }

    if (allImages.length === 0 && !extractedText.trim()) {
      return NextResponse.json(
        { success: false, error: "Please provide an image, file, or text to analyze." },
        { status: 400 }
      );
    }

    const combinedText = [fileContext, extractedText.slice(0, 12000)]
      .filter(Boolean)
      .join("\n");

    // Demo mode — no key set at all, or empty string
    const apiKey = process.env.OPENAI_API_KEY?.trim();
    if (!apiKey) {
      console.log("No OPENAI_API_KEY set — returning demo result");
      await new Promise((r) => setTimeout(r, 2000));
      return NextResponse.json({ success: true, data: getRandomDemoResult() });
    }

    try {
      const result = await analyzeWithClearItEngine({
        images: allImages,
        imageMediaTypes: allMediaTypes,
        text: combinedText || undefined,
        additionalContext: additionalContext?.slice(0, 1000),
        imageCount: allImages.length,
      });
      return NextResponse.json({ success: true, data: result });
    } catch (aiError) {
      // Log full error details for debugging in Vercel logs
      console.error("AI analysis error details:", {
        message: aiError instanceof Error ? aiError.message : String(aiError),
        name: aiError instanceof Error ? aiError.name : "Unknown",
        imageCount: allImages.length,
        hasText: !!combinedText,
        model: process.env.OPENAI_MODEL ?? "gpt-4o",
      });
      const { message, status, fallbackToDemo } = classifyAiError(aiError);

      // For auth/model errors in production, fall back to demo so the UI still works
      if (fallbackToDemo) {
        console.warn("Falling back to demo mode due to AI error:", message);
        const demo = getRandomDemoResult();
        // Attach a notice to the demo result
        demo.warnings = [
          `⚠️ Demo mode: ${message}`,
          ...demo.warnings,
        ];
        return NextResponse.json({ success: true, data: demo });
      }

      return NextResponse.json({ success: false, error: message }, { status });
    }
  } catch (err) {
    console.error("Route error:", err);
    return NextResponse.json(
      { success: false, error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}
