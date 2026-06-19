export type Category =
  | "bill"
  | "insurance"
  | "medical"
  | "bank_alert"
  | "possible_scam"
  | "school_form"
  | "work_hr"
  | "legal_notice"
  | "government"
  | "subscription"
  | "app_error"
  | "device_error"
  | "appliance"
  | "parking_ticket"
  | "shipping_delivery"
  | "tax"
  | "mortgage_rent"
  | "utility"
  | "general_message"
  | "meme_image"
  | "person_public_figure"
  | "product_object"
  | "nature_animal"
  | "place_landmark"
  | "artwork_media"
  | "screenshot_ui"
  | "unknown";

export type Urgency =
  | "low"
  | "medium"
  | "high"
  | "possible_scam"
  | "emergency"
  | "unknown";

export type Confidence = "low" | "medium" | "high";

export interface KeyDetail {
  label: string;
  value: string;
}

export interface DetectedDeadline {
  label: string;
  dateText: string;
  explanation: string;
}

export interface ShareCard {
  title: string;
  urgency: string;
  meaning: string;
  nextStep: string;
}

export interface ClearItAnalysis {
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
}

export interface HistoryItem {
  id: string;
  savedAt: string;
  category: Category;
  urgency: Urgency;
  plainTitle: string;
  textSnippet?: string;
  usedImage: boolean;
  thumbnails?: string[];
  result: ClearItAnalysis;
}

export interface AnalyzeRequest {
  text?: string;
  imageBase64?: string;
  imageMediaType?: string;
}

export interface AnalyzeResponse {
  success: boolean;
  data?: ClearItAnalysis;
  error?: string;
}
