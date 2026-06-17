export const CATEGORIES = [
  "bill",
  "insurance",
  "medical",
  "bank_alert",
  "possible_scam",
  "school_form",
  "work_hr",
  "legal_notice",
  "government",
  "subscription",
  "app_error",
  "device_error",
  "appliance",
  "parking_ticket",
  "shipping_delivery",
  "tax",
  "mortgage_rent",
  "utility",
  "general_message",
  "unknown",
] as const;

export const URGENCY_LEVELS = [
  "low",
  "medium",
  "high",
  "possible_scam",
  "emergency",
  "unknown",
] as const;

export const CONFIDENCE_LEVELS = ["low", "medium", "high"] as const;

export type Category = (typeof CATEGORIES)[number];
export type Urgency = (typeof URGENCY_LEVELS)[number];
export type Confidence = (typeof CONFIDENCE_LEVELS)[number];

export type KeyDetail = {
  label: string;
  value: string;
};

export type DetectedDeadline = {
  label: string;
  dateText: string;
  explanation: string;
};

export type ShareCard = {
  title: string;
  urgency: string;
  meaning: string;
  nextStep: string;
};

export type ClearItAnalysis = {
  id: string;
  createdAt: string;
  category: Category;
  urgency: Urgency;
  confidence: Confidence;
  plainTitle: string;
  oneSentenceSummary: string;
  whatThisIs: string;
  whatItMeans: string;
  whyItMatters: string;
  nextSteps: string[];
  warnings: string[];
  keyDetails: KeyDetail[];
  detectedDeadlines: DetectedDeadline[];
  suggestedQuestions: string[];
  callScript: string;
  replyDraft: string;
  checklist: string[];
  simplifiedExplanation: string;
  shareCard: ShareCard;
  disclaimer: string;
};

export type AnalyzeInput = {
  text?: string;
  imageBase64?: string;
  hadImage?: boolean;
};

export type HistoryItem = {
  id: string;
  createdAt: string;
  category: Category;
  plainTitle: string;
  urgency: Urgency;
  textSnippet?: string;
  usedImage: boolean;
  result: ClearItAnalysis;
};

export type AnalyzeApiResponse =
  | { ok: true; result: ClearItAnalysis; demo: boolean }
  | { ok: false; error: string };
