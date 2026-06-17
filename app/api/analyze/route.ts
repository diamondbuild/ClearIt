import { NextResponse } from "next/server";
import { ZodError } from "zod";

import { analyzeWithClearItEngine } from "@/lib/ai/clearitEngine";
import { analyzeJsonPayloadSchema } from "@/lib/ai/schema";

const MAX_IMAGE_BYTES = 8 * 1024 * 1024;
const SUPPORTED_MIME_TYPES = new Set([
  "image/png",
  "image/jpeg",
  "image/jpg",
  "image/heic",
  "image/heif",
  "image/webp",
]);

const toBase64 = (buffer: ArrayBuffer) => Buffer.from(buffer).toString("base64");

const parseMultipartRequest = async (request: Request) => {
  const form = await request.formData();
  const text = String(form.get("text") ?? "").trim();
  const demoMode = String(form.get("demoMode") ?? "false") === "true";
  const image = form.get("image");

  if (!(image instanceof File) && !text) {
    throw new Error("NO_INPUT");
  }

  if (!(image instanceof File)) {
    return {
      text,
      demoMode,
    };
  }

  if (image.size > MAX_IMAGE_BYTES) {
    throw new Error("IMAGE_TOO_LARGE");
  }

  if (!SUPPORTED_MIME_TYPES.has(image.type)) {
    throw new Error("UNSUPPORTED_FILE");
  }

  const bytes = await image.arrayBuffer();
  const base64 = toBase64(bytes);

  return {
    text,
    imageBase64: base64,
    imageMimeType: image.type,
    fileName: image.name,
    demoMode,
  };
};

const parseJsonRequest = async (request: Request) => {
  const json = await request.json();
  const payload = analyzeJsonPayloadSchema.parse(json);

  if (payload.imageBase64 && payload.imageBase64.length > 12_000_000) {
    throw new Error("IMAGE_TOO_LARGE");
  }

  if (payload.imageMimeType && !SUPPORTED_MIME_TYPES.has(payload.imageMimeType)) {
    throw new Error("UNSUPPORTED_FILE");
  }

  return payload;
};

export async function POST(request: Request) {
  try {
    const contentType = request.headers.get("content-type") ?? "";
    const parsed =
      contentType.includes("multipart/form-data")
        ? await parseMultipartRequest(request)
        : await parseJsonRequest(request);

    const result = await analyzeWithClearItEngine({
      text: parsed.text,
      imageBase64: parsed.imageBase64,
      imageMimeType: parsed.imageMimeType,
      fileName: parsed.fileName,
      forceDemoMode: parsed.demoMode,
    });

    return NextResponse.json({ ok: true, result });
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        {
          ok: false,
          error: "Please add a readable image or some text so ClearIt can help.",
          issues: error.issues,
        },
        { status: 400 },
      );
    }

    if (error instanceof Error) {
      const code = error.message;
      if (code === "NO_INPUT") {
        return NextResponse.json(
          { ok: false, error: "Please upload an image or paste text first." },
          { status: 400 },
        );
      }

      if (code === "IMAGE_TOO_LARGE") {
        return NextResponse.json(
          { ok: false, error: "That image is too large. Try a smaller file." },
          { status: 400 },
        );
      }

      if (code === "UNSUPPORTED_FILE") {
        return NextResponse.json(
          { ok: false, error: "Unsupported file type. Use PNG, JPG, JPEG, or HEIC." },
          { status: 400 },
        );
      }
    }

    return NextResponse.json(
      {
        ok: false,
        error: "We couldn’t analyze this clearly. Try a sharper photo or paste the text instead.",
      },
      { status: 500 },
    );
  }
}
