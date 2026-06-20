import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const url  = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";
const service = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";

// Single browser client so the auth session (and its listeners) persist.
let browserClient: SupabaseClient | null = null;

// Client-side client (uses anon key, respects RLS, keeps the user session)
export function getSupabaseClient(): SupabaseClient | null {
  if (!url || !anon) return null;
  if (browserClient) return browserClient;
  browserClient = createClient(url, anon, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  });
  return browserClient;
}

// Server-side client (uses service role, bypasses RLS — only in API routes)
export function getSupabaseAdmin() {
  if (!url || !service) return null;
  return createClient(url, service, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

export const supabaseConfigured = !!(url && anon);
