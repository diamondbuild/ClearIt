"use client";

import type { ClearItAnalysis, HistoryItem } from "@/lib/types";

const HISTORY_KEY = "clearit:history:v1";
const CURRENT_RESULT_KEY = "clearit:current-result:v1";
const DEMO_MODE_KEY = "clearit:demo-mode:v1";

const safeJsonParse = <T>(value: string | null, fallback: T): T => {
  if (!value) return fallback;

  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
};

export const getHistory = (): HistoryItem[] => {
  if (typeof window === "undefined") return [];
  const items = safeJsonParse<HistoryItem[]>(localStorage.getItem(HISTORY_KEY), []);
  return items.sort((a, b) => +new Date(b.savedAt) - +new Date(a.savedAt));
};

export const saveHistoryItem = (payload: {
  result: ClearItAnalysis;
  originalTextSnippet: string;
  usedImage: boolean;
}) => {
  if (typeof window === "undefined") return;

  const nextItem: HistoryItem = {
    id: payload.result.id,
    savedAt: new Date().toISOString(),
    category: payload.result.category,
    plainTitle: payload.result.plainTitle,
    urgency: payload.result.urgency,
    originalTextSnippet: payload.originalTextSnippet,
    usedImage: payload.usedImage,
    result: payload.result,
  };

  const existing = getHistory().filter((item) => item.id !== nextItem.id);
  localStorage.setItem(HISTORY_KEY, JSON.stringify([nextItem, ...existing]));
};

export const clearHistory = () => {
  if (typeof window === "undefined") return;
  localStorage.removeItem(HISTORY_KEY);
};

export const getHistoryItemById = (id: string): HistoryItem | undefined =>
  getHistory().find((item) => item.id === id);

export const setCurrentResult = (payload: {
  result: ClearItAnalysis;
  originalTextSnippet: string;
  usedImage: boolean;
}) => {
  if (typeof window === "undefined") return;
  localStorage.setItem(CURRENT_RESULT_KEY, JSON.stringify(payload));
};

export const getCurrentResult = () => {
  if (typeof window === "undefined") return null;
  return safeJsonParse<{
    result: ClearItAnalysis;
    originalTextSnippet: string;
    usedImage: boolean;
  } | null>(localStorage.getItem(CURRENT_RESULT_KEY), null);
};

export const getDemoMode = (): boolean => {
  if (typeof window === "undefined") return false;
  return localStorage.getItem(DEMO_MODE_KEY) === "true";
};

export const setDemoMode = (enabled: boolean) => {
  if (typeof window === "undefined") return;
  localStorage.setItem(DEMO_MODE_KEY, String(enabled));
};
