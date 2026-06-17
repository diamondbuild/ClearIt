import { Category, Urgency, Confidence } from "@/lib/types";

/**
 * Tiny classnames helper (clsx-like) without the dependency.
 */
export function cn(
  ...inputs: Array<string | false | null | undefined>
): string {
  return inputs.filter(Boolean).join(" ");
}

export function generateId(): string {
  if (
    typeof crypto !== "undefined" &&
    typeof crypto.randomUUID === "function"
  ) {
    return crypto.randomUUID();
  }
  return `id_${Date.now().toString(36)}_${Math.random()
    .toString(36)
    .slice(2, 10)}`;
}

const CATEGORY_LABELS: Record<Category, string> = {
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
  utility: "Utility",
  general_message: "Message",
  unknown: "Unknown",
};

export function categoryLabel(category: Category): string {
  return CATEGORY_LABELS[category] ?? "Unknown";
}

const URGENCY_LABELS: Record<Urgency, string> = {
  low: "Low",
  medium: "Medium",
  high: "High",
  possible_scam: "Possible Scam",
  emergency: "Emergency",
  unknown: "Unknown",
};

export function urgencyLabel(urgency: Urgency): string {
  return URGENCY_LABELS[urgency] ?? "Unknown";
}

const CONFIDENCE_LABELS: Record<Confidence, string> = {
  low: "Low",
  medium: "Medium",
  high: "High",
};

export function confidenceLabel(confidence: Confidence): string {
  return CONFIDENCE_LABELS[confidence] ?? "Medium";
}

export function formatDateTime(iso: string): string {
  try {
    const d = new Date(iso);
    return d.toLocaleString(undefined, {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
}

export function truncate(text: string, max = 140): string {
  const clean = text.trim().replace(/\s+/g, " ");
  if (clean.length <= max) return clean;
  return clean.slice(0, max - 1).trimEnd() + "…";
}
