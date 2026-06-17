export const categories = [
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

export const urgencyLevels = ["low", "medium", "high", "possible_scam", "emergency", "unknown"] as const;
export const confidenceLevels = ["low", "medium", "high"] as const;

export type ClearItCategory = (typeof categories)[number];
export type ClearItUrgency = (typeof urgencyLevels)[number];
export type ClearItConfidence = (typeof confidenceLevels)[number];

export type ClearItAnalysis = {
  id: string;
  createdAt: string;
  category: ClearItCategory;
  urgency: ClearItUrgency;
  confidence: ClearItConfidence;
  plainTitle: string;
  oneSentenceSummary: string;
  whatThisIs: string;
  whatItMeans: string;
  whyItMatters: string;
  nextSteps: string[];
  warnings: string[];
  keyDetails: {
    label: string;
    value: string;
  }[];
  detectedDeadlines: {
    label: string;
    dateText: string;
    explanation: string;
  }[];
  suggestedQuestions: string[];
  callScript: string;
  replyDraft: string;
  checklist: string[];
  simplifiedExplanation: string;
  shareCard: {
    title: string;
    urgency: string;
    meaning: string;
    nextStep: string;
  };
  disclaimer: string;
};

export type AnalyzeRequest = {
  text?: string;
  imageBase64?: string;
  imageMimeType?: string;
  fileName?: string;
  demoMode?: boolean;
};

export type HistoryItem = {
  id: string;
  savedAt: string;
  category: ClearItCategory;
  plainTitle: string;
  urgency: ClearItUrgency;
  originalTextSnippet?: string;
  imageUsed: boolean;
  result: ClearItAnalysis;
};
