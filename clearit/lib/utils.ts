import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { Category, Urgency } from "@/lib/types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function nanoid(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export function formatDate(dateString: string): string {
  try {
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    }).format(new Date(dateString));
  } catch {
    return dateString;
  }
}

export function categoryLabel(category: Category): string {
  const labels: Record<Category, string> = {
    bill: "Bill",
    insurance: "Insurance",
    medical: "Medical",
    bank_alert: "Bank Alert",
    possible_scam: "Possible Scam",
    school_form: "School Form",
    work_hr: "Work / HR",
    legal_notice: "Legal Notice",
    government: "Government",
    subscription: "Subscription",
    app_error: "App Error",
    device_error: "Device Error",
    appliance: "Appliance",
    parking_ticket: "Parking Ticket",
    shipping_delivery: "Shipping",
    tax: "Tax",
    mortgage_rent: "Mortgage / Rent",
    utility: "Utility Bill",
    general_message: "General Message",
    meme_image: "Meme / Image",
    person_public_figure: "Person",
    product_object: "Product",
    nature_animal: "Nature / Animal",
    place_landmark: "Place",
    artwork_media: "Art / Media",
    screenshot_ui: "Screenshot",
    unknown: "Unknown",
  };
  return labels[category] ?? category;
}

export function urgencyLabel(urgency: Urgency): string {
  const labels: Record<Urgency, string> = {
    low: "Low Priority",
    medium: "Medium Priority",
    high: "High Priority",
    possible_scam: "Possible Scam",
    emergency: "Emergency",
    unknown: "Unknown",
  };
  return labels[urgency] ?? urgency;
}

export function urgencyShortLabel(urgency: Urgency): string {
  const labels: Record<Urgency, string> = {
    low: "Low",
    medium: "Medium",
    high: "High",
    possible_scam: "Scam Warning",
    emergency: "Emergency",
    unknown: "Unknown",
  };
  return labels[urgency] ?? urgency;
}

// Max ~800KB per image as base64 to stay under Vercel's 4.5MB payload limit
const MAX_BASE64_BYTES = 800 * 1024;

/**
 * Compresses an image AND generates a thumbnail in a single canvas pass.
 * Drawing once from the original Object URL is reliable on iOS Safari.
 * Two separate canvas operations (compress then thumbnail-from-base64)
 * fail on iOS because re-loading a large base64 string into a new Image
 * causes memory pressure and silent onload failures.
 */
export async function compressImageWithThumb(
  file: File,
  maxPx = 1280,
  quality = 0.75,
  thumbPx = 300
): Promise<{ base64: string; thumb: string; mediaType: string }> {
  const mediaType = file.type === "image/png" ? "image/png" : "image/jpeg";

  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(url);
      try {
        const { width, height } = img;

        // ── Full-size compressed image ──────────────────────────────
        const ratio = Math.min(maxPx / width, maxPx / height, 1);
        const canvas = document.createElement("canvas");
        canvas.width  = Math.round(width * ratio);
        canvas.height = Math.round(height * ratio);
        const ctx = canvas.getContext("2d");
        if (!ctx) throw new Error("no canvas context");
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

        let q = quality;
        let base64 = canvas.toDataURL("image/jpeg", q).split(",")[1];
        while (base64.length > 800 * 1024 && q > 0.3) {
          q -= 0.1;
          base64 = canvas.toDataURL("image/jpeg", q).split(",")[1];
        }

        // ── Thumbnail (same img, new canvas, no second load) ────────
        const tr = Math.min(thumbPx / width, thumbPx / height, 1);
        const tc = document.createElement("canvas");
        tc.width  = Math.round(width * tr);
        tc.height = Math.round(height * tr);
        const tctx = tc.getContext("2d");
        let thumb = `data:image/jpeg;base64,${base64}`; // fallback
        if (tctx) {
          tctx.drawImage(img, 0, 0, tc.width, tc.height);
          thumb = tc.toDataURL("image/jpeg", 0.65);
        }

        resolve({ base64, thumb, mediaType });
      } catch (e) {
        reject(e);
      }
    };

    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error("image load failed")); };
    img.src = url;
  });
}

// Keep for backward compatibility
export async function makeThumbnailFromBase64(dataUrl: string): Promise<string> {
  return dataUrl; // no-op — use compressImageWithThumb instead
}
export async function makeThumbnail(file: File): Promise<string> {
  const { thumb } = await compressImageWithThumb(file);
  return thumb;
}

export async function compressImage(
  file: File,
  maxWidth = 1280,
  maxHeight = 1280,
  quality = 0.75
): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(url);
      let { width, height } = img;
      if (width > maxWidth || height > maxHeight) {
        const ratio = Math.min(maxWidth / width, maxHeight / height);
        width = Math.round(width * ratio);
        height = Math.round(height * ratio);
      }
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
      if (!ctx) return reject(new Error("Canvas not supported"));
      ctx.drawImage(img, 0, 0, width, height);

      // Try quality levels until we get under the size limit
      let q = quality;
      let base64 = canvas.toDataURL("image/jpeg", q).split(",")[1];
      while (base64.length > MAX_BASE64_BYTES && q > 0.3) {
        q -= 0.1;
        base64 = canvas.toDataURL("image/jpeg", q).split(",")[1];
      }
      resolve(base64);
    };
    img.onerror = reject;
    img.src = url;
  });
}

/**
 * Write a result to sessionStorage, preserving the best available thumbnails.
 * If the existing session entry already has thumbnails (e.g. from the original
 * scan) and the new item has none (e.g. Supabase hasn't uploaded yet), keep
 * the existing ones so thumbnails never disappear on re-navigation.
 */
export function writeResultToSession(
  id: string,
  data: { analysis: import("@/lib/types").ClearItAnalysis; textSnippet?: string; usedImage: boolean; thumbnails?: string[] }
): void {
  if (typeof window === "undefined") return;
  const key = `lci_pending_${id}`;
  let bestThumbs = data.thumbnails ?? [];

  if (bestThumbs.length === 0) {
    try {
      const existing = sessionStorage.getItem(key);
      if (existing) {
        const parsed = JSON.parse(existing);
        if (parsed.thumbnails?.length) bestThumbs = parsed.thumbnails;
      }
    } catch { /* ignore */ }
  }

  sessionStorage.setItem(key, JSON.stringify({ ...data, thumbnails: bestThumbs }));
}

export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength).trim() + "…";
}

// Encode a subset of the analysis into a URL-safe base64 string for sharing
export function encodeSharePayload(analysis: import("@/lib/types").ClearItAnalysis): string {
  const payload = {
    t: analysis.plainTitle,
    c: analysis.category,
    u: analysis.urgency,
    s: analysis.oneSentenceSummary,
    m: analysis.whatItMeans,
    n: analysis.nextSteps.slice(0, 8),
    w: analysis.warnings.slice(0, 4),
    k: analysis.keyDetails.slice(0, 8),
    d: analysis.detectedDeadlines.slice(0, 3),
    r: analysis.disclaimer,
  };
  try {
    return btoa(unescape(encodeURIComponent(JSON.stringify(payload))));
  } catch {
    return "";
  }
}

export function decodeSharePayload(encoded: string): null | {
  t: string; c: string; u: string; s: string; m: string;
  n: string[]; w: string[]; k: { label: string; value: string }[];
  d: { label: string; dateText: string; explanation: string }[];
  r: string;
} {
  try {
    return JSON.parse(decodeURIComponent(escape(atob(encoded))));
  } catch {
    return null;
  }
}
