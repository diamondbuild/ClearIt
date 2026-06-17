import { ClearItAnalysis, HistoryItem } from "@/lib/types";
import { truncate } from "@/lib/utils";

const HISTORY_KEY = "clearit:history:v1";
const LAST_RESULT_KEY = "clearit:lastResult:v1";
const SETTINGS_KEY = "clearit:settings:v1";

export type ClearItSettings = {
  demoModePreferred: boolean;
  seniorMode: boolean;
};

const DEFAULT_SETTINGS: ClearItSettings = {
  demoModePreferred: false,
  seniorMode: false,
};

function safeParse<T>(value: string | null, fallback: T): T {
  if (!value) return fallback;
  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}

export function getHistory(): HistoryItem[] {
  if (typeof window === "undefined") return [];
  return safeParse<HistoryItem[]>(
    window.localStorage.getItem(HISTORY_KEY),
    [],
  );
}

export function getHistoryItem(id: string): HistoryItem | undefined {
  return getHistory().find((item) => item.id === id);
}

export function saveToHistory(
  result: ClearItAnalysis,
  options: { usedImage: boolean; originalText?: string },
): HistoryItem {
  const item: HistoryItem = {
    id: result.id,
    createdAt: result.createdAt,
    category: result.category,
    plainTitle: result.plainTitle,
    urgency: result.urgency,
    textSnippet: options.originalText
      ? truncate(options.originalText, 160)
      : undefined,
    usedImage: options.usedImage,
    result,
  };

  if (typeof window === "undefined") return item;

  const existing = getHistory().filter((h) => h.id !== item.id);
  const next = [item, ...existing].slice(0, 100);
  window.localStorage.setItem(HISTORY_KEY, JSON.stringify(next));
  return item;
}

export function removeHistoryItem(id: string): void {
  if (typeof window === "undefined") return;
  const next = getHistory().filter((h) => h.id !== id);
  window.localStorage.setItem(HISTORY_KEY, JSON.stringify(next));
}

export function clearHistory(): void {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(HISTORY_KEY);
}

export function isInHistory(id: string): boolean {
  return getHistory().some((h) => h.id === id);
}

/**
 * The "last result" is the result that was just produced by the analyze flow,
 * passed to the result screen without requiring a database.
 */
export function setLastResult(payload: {
  result: ClearItAnalysis;
  usedImage: boolean;
  originalText?: string;
}): void {
  if (typeof window === "undefined") return;
  window.sessionStorage.setItem(LAST_RESULT_KEY, JSON.stringify(payload));
}

export function getLastResult(): {
  result: ClearItAnalysis;
  usedImage: boolean;
  originalText?: string;
} | null {
  if (typeof window === "undefined") return null;
  return safeParse<{
    result: ClearItAnalysis;
    usedImage: boolean;
    originalText?: string;
  } | null>(window.sessionStorage.getItem(LAST_RESULT_KEY), null);
}

export function getSettings(): ClearItSettings {
  if (typeof window === "undefined") return DEFAULT_SETTINGS;
  return {
    ...DEFAULT_SETTINGS,
    ...safeParse<Partial<ClearItSettings>>(
      window.localStorage.getItem(SETTINGS_KEY),
      {},
    ),
  };
}

export function saveSettings(settings: Partial<ClearItSettings>): ClearItSettings {
  const next = { ...getSettings(), ...settings };
  if (typeof window !== "undefined") {
    window.localStorage.setItem(SETTINGS_KEY, JSON.stringify(next));
  }
  return next;
}
