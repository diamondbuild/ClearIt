-- ClearIt — Auth migration (Phase 1: Google sign-in + per-user history)
-- Run this in Supabase: Dashboard → SQL Editor → New query → paste + run.
-- Safe to run once on an existing project that already has the `analyses` table.

-- ── 1. Add a user_id column linking each analysis to its owner ─────────────
ALTER TABLE analyses
  ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users (id) ON DELETE CASCADE;

CREATE INDEX IF NOT EXISTS analyses_user_id_idx ON analyses (user_id);

-- ── 2. Replace the old "public" policies with per-user policies ────────────
-- (Old anonymous rows keep user_id = NULL and simply become private.)
DROP POLICY IF EXISTS "Public read"   ON analyses;
DROP POLICY IF EXISTS "Public insert" ON analyses;
DROP POLICY IF EXISTS "Public delete" ON analyses;

CREATE POLICY "Owner can read"   ON analyses FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Owner can insert" ON analyses FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Owner can update" ON analyses FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Owner can delete" ON analyses FOR DELETE USING (auth.uid() = user_id);

-- ── 3. Profiles table (for plan/billing state — used by upcoming Stripe step) ─
CREATE TABLE IF NOT EXISTS profiles (
  id                 UUID PRIMARY KEY REFERENCES auth.users (id) ON DELETE CASCADE,
  email              TEXT,
  full_name          TEXT,
  is_pro             BOOLEAN     NOT NULL DEFAULT FALSE,
  plan               TEXT        NOT NULL DEFAULT 'free',   -- 'free' | 'plus'
  stripe_customer_id TEXT,
  current_period_end TIMESTAMPTZ,
  created_at         TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Profile owner can read"   ON profiles;
DROP POLICY IF EXISTS "Profile owner can update" ON profiles;
CREATE POLICY "Profile owner can read"   ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Profile owner can update" ON profiles FOR UPDATE USING (auth.uid() = id);
-- Note: rows are created by a trigger (below) with the service role, not by clients.

-- ── 4. Auto-create a profile row when a new user signs up ──────────────────
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data ->> 'full_name')
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
