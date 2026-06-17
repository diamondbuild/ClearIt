"use client";

export interface PdfPageImage {
  base64: string;
  pageNumber: number;
}

// Target ~400KB per page as base64 to keep total payload manageable
const MAX_PAGE_BASE64 = 400 * 1024;

export async function renderPdfToImages(
  file: File,
  maxPages = 4,
  scale = 1.2
): Promise<PdfPageImage[]> {
  const pdfjsLib = await import("pdfjs-dist");
  pdfjsLib.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";

  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  const totalPages = Math.min(pdf.numPages, maxPages);

  const images: PdfPageImage[] = [];

  for (let pageNum = 1; pageNum <= totalPages; pageNum++) {
    const page = await pdf.getPage(pageNum);
    const viewport = page.getViewport({ scale });

    const canvas = document.createElement("canvas");
    canvas.width = viewport.width;
    canvas.height = viewport.height;

    const ctx = canvas.getContext("2d");
    if (!ctx) continue;

    await page.render({ canvasContext: ctx as unknown as CanvasRenderingContext2D, viewport, canvas }).promise;

    // Reduce quality until under size limit
    let quality = 0.7;
    let base64 = canvas.toDataURL("image/jpeg", quality).split(",")[1];
    while (base64.length > MAX_PAGE_BASE64 && quality > 0.3) {
      quality -= 0.1;
      base64 = canvas.toDataURL("image/jpeg", quality).split(",")[1];
    }

    images.push({ base64, pageNumber: pageNum });
  }

  return images;
}

export async function extractPdfText(file: File): Promise<string> {
  const pdfjsLib = await import("pdfjs-dist");
  pdfjsLib.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";

  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

  const textParts: string[] = [];
  const totalPages = Math.min(pdf.numPages, 8);

  for (let pageNum = 1; pageNum <= totalPages; pageNum++) {
    const page = await pdf.getPage(pageNum);
    const textContent = await page.getTextContent();
    const pageText = textContent.items
      .map((item) => ("str" in item ? item.str : ""))
      .join(" ")
      .replace(/\s+/g, " ")
      .trim();
    if (pageText) {
      textParts.push(`[Page ${pageNum}]\n${pageText}`);
    }
  }

  return textParts.join("\n\n");
}
