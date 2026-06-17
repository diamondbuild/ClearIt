export const MAX_IMAGE_BYTES = 8 * 1024 * 1024; // 8MB raw upload limit

export const ACCEPTED_IMAGE_TYPES = [
  "image/png",
  "image/jpeg",
  "image/jpg",
  "image/heic",
  "image/heif",
  "image/webp",
];

export function isAcceptedImage(file: File): boolean {
  if (ACCEPTED_IMAGE_TYPES.includes(file.type)) return true;
  // Some browsers report empty type for HEIC; fall back to extension.
  return /\.(png|jpe?g|heic|heif|webp)$/i.test(file.name);
}

/**
 * Resize + compress an image client-side to keep payloads small.
 * Returns a data URL (JPEG). Falls back to the original data URL if the
 * canvas pipeline fails (e.g. for unsupported HEIC decoding in some browsers).
 */
export async function compressImage(
  file: File,
  maxDimension = 1600,
  quality = 0.8,
): Promise<{ dataUrl: string; width: number; height: number }> {
  const originalDataUrl = await readAsDataUrl(file);

  try {
    const img = await loadImage(originalDataUrl);
    let { width, height } = img;

    if (width > maxDimension || height > maxDimension) {
      const scale = maxDimension / Math.max(width, height);
      width = Math.round(width * scale);
      height = Math.round(height * scale);
    }

    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("no-2d-context");
    ctx.drawImage(img, 0, 0, width, height);

    const dataUrl = canvas.toDataURL("image/jpeg", quality);
    return { dataUrl, width, height };
  } catch {
    return { dataUrl: originalDataUrl, width: 0, height: 0 };
  }
}

function readAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}
