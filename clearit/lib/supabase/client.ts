import { createClient } from "@supabase/supabase-js";

const url  = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";
const service = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";

// Client-side client (uses anon key, respects RLS)
export function getSupabaseClient() {
  if (!url || !anon) return null;
  return createClient(url, anon);
}

// Server-side client (uses service role, bypasses RLS — only in API routes)
export function getSupabaseAdmin() {
  if (!url || !service) return null;
  return createClient(url, service, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

export const supabaseConfigured = !!(url && anon);
