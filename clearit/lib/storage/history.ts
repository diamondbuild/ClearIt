"use client";

import { HistoryItem, ClearItAnalysis } from "@/lib/types";

const STORAGE_KEY = "clearit_history";
const MAX_ITEMS = 50;

export function getHistory(): HistoryItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as HistoryItem[];
  } catch {
    return [];
  }
}

export function saveToHistory(
  result: ClearItAnalysis,
  options: { textSnippet?: string; usedImage: boolean; thumbnails?: string[] }
): HistoryItem {
  const item: HistoryItem = {
    id: result.id,
    savedAt: new Date().toISOString(),
    category: result.category,
    urgency: result.urgency,
    plainTitle: result.plainTitle,
    textSnippet: options.textSnippet?.slice(0, 200),
    usedImage: options.usedImage,
    thumbnails: options.thumbnails?.slice(0, 2), // store max 2 thumbs to limit storage size
    result,
  };

  const existing = getHistory();
  const filtered = existing.filter((h) => h.id !== item.id);
  const updated = [item, ...filtered].slice(0, MAX_ITEMS);

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch {
    // Storage quota exceeded - remove oldest items
    const trimmed = updated.slice(0, 20);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed));
  }

  return item;
}

export function getHistoryItem(id: string): HistoryItem | null {
  const history = getHistory();
  return history.find((h) => h.id === id) ?? null;
}

export function deleteHistoryItem(id: string): void {
  const history = getHistory();
  const updated = history.filter((h) => h.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
}

export function clearHistory(): void {
  localStorage.removeItem(STORAGE_KEY);
}
