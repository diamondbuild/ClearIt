import type { ClearItAnalysis, HistoryItem } from "@/lib/types";
import { compactText } from "@/lib/utils";

const HISTORY_KEY = "clearit.history.v1";
const LAST_RESULT_KEY = "clearit.lastResult.v1";
const LAST_INPUT_KEY = "clearit.lastInput.v1";

function isBrowser() {
  return typeof window !== "undefined";
}

export function getHistory(): HistoryItem[] {
  if (!isBrowser()) {
    return [];
  }

  try {
    const raw = window.localStorage.getItem(HISTORY_KEY);
    return raw ? (JSON.parse(raw) as HistoryItem[]) : [];
  } catch {
    return [];
  }
}

export function saveHistoryItem(item: HistoryItem) {
  if (!isBrowser()) {
    return;
  }

  const existing = getHistory().filter((entry) => entry.id !== item.id);
  window.localStorage.setItem(HISTORY_KEY, JSON.stringify([item, ...existing].slice(0, 50)));
}

export function saveAnalysisToHistory(result: ClearItAnalysis, options: { originalText?: string; imageUsed: boolean }) {
  saveHistoryItem({
    id: result.id,
    savedAt: new Date().toISOString(),
    category: result.category,
    plainTitle: result.plainTitle,
    urgency: result.urgency,
    originalTextSnippet: options.originalText ? compactText(options.originalText, 180) : undefined,
    imageUsed: options.imageUsed,
    result,
  });
}

export function clearHistory() {
  if (isBrowser()) {
    window.localStorage.removeItem(HISTORY_KEY);
  }
}

export function getHistoryItem(id: string) {
  return getHistory().find((item) => item.id === id);
}

export function storeLastResult(result: ClearItAnalysis) {
  if (isBrowser()) {
    window.sessionStorage.setItem(LAST_RESULT_KEY, JSON.stringify(result));
  }
}

export function getLastResult() {
  if (!isBrowser()) {
    return undefined;
  }

  try {
    const raw = window.sessionStorage.getItem(LAST_RESULT_KEY);
    return raw ? (JSON.parse(raw) as ClearItAnalysis) : undefined;
  } catch {
    return undefined;
  }
}

export function storeLastInput(input: { text?: string; imageUsed: boolean }) {
  if (isBrowser()) {
    window.sessionStorage.setItem(LAST_INPUT_KEY, JSON.stringify(input));
  }
}

export function getLastInput() {
  if (!isBrowser()) {
    return { imageUsed: false };
  }

  try {
    const raw = window.sessionStorage.getItem(LAST_INPUT_KEY);
    return raw ? (JSON.parse(raw) as { text?: string; imageUsed: boolean }) : { imageUsed: false };
  } catch {
    return { imageUsed: false };
  }
}
