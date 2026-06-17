import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { analyzeWithClearItEngine } from "@/lib/ai/clearitEngine";
import { getRandomDemoResult } from "@/lib/demo/demoResults";
import { AnalyzeResponse } from "@/lib/types";

const RequestSchema = z.object({
  // Single image (legacy)
  imageBase64: z.string().optional(),
  imageMediaType: z.string().optional(),
  // Multiple images
  images: z.array(z.string()).optional(),
  imageMediaTypes: z.array(z.string()).optional(),
  // Extracted / pasted text
  text: z.string().optional(),
  // Additional context from user
  additionalContext: z.string().optional(),
  // DOCX/DOC file
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
        fileContext = `[This is a ${fileType?.toUpperCase() ?? "document"} file: ${fileName ?? "uploaded document"}]`;
      } catch (err) {
        console.error("DOCX extraction error:", err);
        return NextResponse.json(
          {
            success: false,
            error:
              "Couldn't read this document. Try copying the text and pasting it instead.",
          },
          { status: 422 }
        );
      }
    }

    // Check we have something to analyze
    if (allImages.length === 0 && !extractedText.trim()) {
      return NextResponse.json(
        { success: false, error: "Please provide an image, file, or text to analyze." },
        { status: 400 }
      );
    }

    // Limit text size
    const combinedText = [fileContext, extractedText.slice(0, 12000)]
      .filter(Boolean)
      .join("\n");

    // Demo mode
    if (!process.env.OPENAI_API_KEY) {
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
      console.error("AI analysis error:", aiError);
      const message = aiError instanceof Error ? aiError.message : "Unknown error";

      if (message.includes("JSON")) {
        return NextResponse.json(
          { success: false, error: "ClearIt couldn't parse the response. Please try again." },
          { status: 500 }
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
      { success: false, error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}
