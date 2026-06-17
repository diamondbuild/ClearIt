import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

import type { ClearItCategory, ClearItConfidence, ClearItUrgency } from "@/lib/types";

export const cn = (...inputs: ClassValue[]) => twMerge(clsx(inputs));

export const categoryLabelMap: Record<ClearItCategory, string> = {
  bill: "Bill",
  insurance: "Insurance",
  medical: "Medical Message",
  bank_alert: "Bank Alert",
  possible_scam: "Possible Scam",
  school_form: "School Form",
  work_hr: "HR / Work",
  legal_notice: "Legal Notice",
  government: "Government",
  subscription: "Subscription",
  app_error: "App Error",
  device_error: "Device Error",
  appliance: "Appliance",
  parking_ticket: "Parking Ticket",
  shipping_delivery: "Shipping / Delivery",
  tax: "Tax",
  mortgage_rent: "Mortgage / Rent",
  utility: "Utility",
  general_message: "General Message",
  unknown: "Unknown",
};

export const urgencyLabelMap: Record<ClearItUrgency, string> = {
  low: "Low",
  medium: "Medium",
  high: "High",
  possible_scam: "Possible Scam",
  emergency: "Emergency",
  unknown: "Unknown",
};

export const confidenceLabelMap: Record<ClearItConfidence, string> = {
  low: "Low",
  medium: "Medium",
  high: "High",
};

export const urgencyStyleMap: Record<ClearItUrgency, string> = {
  low: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  medium: "bg-amber-50 text-amber-700 ring-amber-200",
  high: "bg-orange-50 text-orange-700 ring-orange-200",
  possible_scam: "bg-rose-50 text-rose-700 ring-rose-200",
  emergency: "bg-red-100 text-red-800 ring-red-300",
  unknown: "bg-slate-100 text-slate-700 ring-slate-200",
};

export const formatDateTime = (iso: string) =>
  new Date(iso).toLocaleString([], {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
