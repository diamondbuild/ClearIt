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

export async function compressImage(
  file: File,
  maxWidth = 1600,
  maxHeight = 1600,
  quality = 0.85
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
      const base64 = canvas.toDataURL("image/jpeg", quality).split(",")[1];
      resolve(base64);
    };
    img.onerror = reject;
    img.src = url;
  });
}

export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength).trim() + "…";
}
