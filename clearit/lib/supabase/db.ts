"use client";

import { getSupabaseClient } from "@/lib/supabase/client";
import { ClearItAnalysis, HistoryItem } from "@/lib/types";

const BUCKET = "thumbnails";
const TABLE  = "analyses";

// ── Thumbnail upload ──────────────────────────────────────────────────────────

export async function uploadThumbnails(
  analysisId: string,
  thumbnails: string[]
): Promise<string[]> {
  const sb = getSupabaseClient();
  if (!sb || thumbnails.length === 0) return [];

  const urls: string[] = [];
  for (let i = 0; i < thumbnails.length; i++) {
    const dataUrl = thumbnails[i];
    if (!dataUrl) continue;
    try {
      const base64 = dataUrl.split(",")[1];
      const binary = atob(base64);
      const bytes = new Uint8Array(binary.length);
      for (let j = 0; j < binary.length; j++) bytes[j] = binary.charCodeAt(j);
      const blob = new Blob([bytes], { type: "image/jpeg" });

      const path = `${analysisId}/${i}.jpg`;
      const { error } = await sb.storage.from(BUCKET).upload(path, blob, {
        contentType: "image/jpeg",
        upsert: true,
      });
      if (error) { console.warn("Thumbnail upload failed:", error.message); continue; }

      const { data } = sb.storage.from(BUCKET).getPublicUrl(path);
      if (data?.publicUrl) urls.push(data.publicUrl);
    } catch (e) {
      console.warn("Thumbnail upload error:", e);
    }
  }
  return urls;
}

// ── Save analysis ─────────────────────────────────────────────────────────────

export async function saveAnalysisToSupabase(
  analysis: ClearItAnalysis,
  options: {
    textSnippet?: string;
    usedImage: boolean;
    thumbnailUrls?: string[];
  }
): Promise<boolean> {
  const sb = getSupabaseClient();
  if (!sb) return false;
  try {
    const { error } = await sb.from(TABLE).upsert({
      id:             analysis.id,
      created_at:     analysis.createdAt,
      category:       analysis.category,
      urgency:        analysis.urgency,
      plain_title:    analysis.plainTitle,
      result:         analysis,
      text_snippet:   options.textSnippet ?? null,
      used_image:     options.usedImage,
      thumbnail_urls: options.thumbnailUrls ?? [],
    });
    if (error) { console.warn("Supabase save error:", error.message); return false; }
    return true;
  } catch (e) {
    console.warn("Supabase save failed:", e);
    return false;
  }
}

// ── Fetch history ─────────────────────────────────────────────────────────────

export async function fetchHistoryFromSupabase(limit = 50): Promise<HistoryItem[]> {
  const sb = getSupabaseClient();
  if (!sb) return [];
  try {
    const { data, error } = await sb
      .from(TABLE)
      .select("id, created_at, category, urgency, plain_title, text_snippet, used_image, thumbnail_urls, result")
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error || !data) return [];

    return data.map((row): HistoryItem => ({
      id:           row.id,
      savedAt:      row.created_at,
      category:     row.category,
      urgency:      row.urgency,
      plainTitle:   row.plain_title,
      textSnippet:  row.text_snippet ?? undefined,
      usedImage:    row.used_image,
      thumbnails:   row.thumbnail_urls ?? [],
      result:       row.result as ClearItAnalysis,
    }));
  } catch (e) {
    console.warn("Supabase fetch failed:", e);
    return [];
  }
}

// ── Fetch single analysis ─────────────────────────────────────────────────────

export async function fetchAnalysisById(id: string): Promise<{
  analysis: ClearItAnalysis;
  textSnippet?: string;
  usedImage: boolean;
  thumbnails: string[];
} | null> {
  const sb = getSupabaseClient();
  if (!sb) return null;
  try {
    const { data, error } = await sb
      .from(TABLE)
      .select("result, text_snippet, used_image, thumbnail_urls")
      .eq("id", id)
      .single();

    if (error || !data) return null;
    return {
      analysis:    data.result as ClearItAnalysis,
      textSnippet: data.text_snippet ?? undefined,
      usedImage:   data.used_image,
      thumbnails:  data.thumbnail_urls ?? [],
    };
  } catch {
    return null;
  }
}

// ── Delete analysis ───────────────────────────────────────────────────────────

export async function deleteAnalysisFromSupabase(id: string): Promise<void> {
  const sb = getSupabaseClient();
  if (!sb) return;
  try {
    await sb.from(TABLE).delete().eq("id", id);
    // Also remove thumbnails from storage
    const { data } = await sb.storage.from(BUCKET).list(id);
    if (data?.length) {
      await sb.storage.from(BUCKET).remove(data.map(f => `${id}/${f.name}`));
    }
  } catch {
    // non-fatal
  }
}
