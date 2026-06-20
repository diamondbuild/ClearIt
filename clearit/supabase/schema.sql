-- ClearIt Supabase Schema
-- Run this in your Supabase project: Dashboard → SQL Editor → New query → paste + run

-- NOTE: If you already created this table with the old "public" policies,
-- run supabase/auth_migration.sql instead (it upgrades an existing project).

-- ── Analyses table ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS analyses (
  id             TEXT        PRIMARY KEY,
  user_id        UUID        REFERENCES auth.users (id) ON DELETE CASCADE,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  category       TEXT        NOT NULL,
  urgency        TEXT        NOT NULL,
  plain_title    TEXT        NOT NULL,
  result         JSONB       NOT NULL,
  text_snippet   TEXT,
  used_image     BOOLEAN     NOT NULL DEFAULT FALSE,
  thumbnail_urls TEXT[]      NOT NULL DEFAULT '{}'
);

-- Indexes for fast history queries
CREATE INDEX IF NOT EXISTS analyses_created_at_idx ON analyses (created_at DESC);
CREATE INDEX IF NOT EXISTS analyses_user_id_idx    ON analyses (user_id);

-- ── Row Level Security (per-user) ──────────────────────────────────────────────
ALTER TABLE analyses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Owner can read"   ON analyses FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Owner can insert" ON analyses FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Owner can update" ON analyses FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Owner can delete" ON analyses FOR DELETE USING (auth.uid() = user_id);

-- ── Profiles table (plan / billing state, used by the Stripe step) ──────────────
CREATE TABLE IF NOT EXISTS profiles (
  id                 UUID PRIMARY KEY REFERENCES auth.users (id) ON DELETE CASCADE,
  email              TEXT,
  full_name          TEXT,
  is_pro             BOOLEAN     NOT NULL DEFAULT FALSE,
  plan               TEXT        NOT NULL DEFAULT 'free',
  stripe_customer_id TEXT,
  current_period_end TIMESTAMPTZ,
  created_at         TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Profile owner can read"   ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Profile owner can update" ON profiles FOR UPDATE USING (auth.uid() = id);

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
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

-- ── Storage bucket ────────────────────────────────────────────────────────────
-- Create this in Supabase Dashboard → Storage → New bucket
-- Name: thumbnails
-- Public bucket: YES (toggle on)
--
-- Or run:
INSERT INTO storage.buckets (id, name, public)
VALUES ('thumbnails', 'thumbnails', true)
ON CONFLICT (id) DO NOTHING;

-- Allow public upload and read
CREATE POLICY "Public upload" ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'thumbnails');

CREATE POLICY "Public read storage" ON storage.objects FOR SELECT
  USING (bucket_id = 'thumbnails');

CREATE POLICY "Public delete storage" ON storage.objects FOR DELETE
  USING (bucket_id = 'thumbnails');
