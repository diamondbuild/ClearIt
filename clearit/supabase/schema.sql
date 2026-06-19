-- ClearIt Supabase Schema
-- Run this in your Supabase project: Dashboard → SQL Editor → New query → paste + run

-- ── Analyses table ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS analyses (
  id             TEXT        PRIMARY KEY,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  category       TEXT        NOT NULL,
  urgency        TEXT        NOT NULL,
  plain_title    TEXT        NOT NULL,
  result         JSONB       NOT NULL,
  text_snippet   TEXT,
  used_image     BOOLEAN     NOT NULL DEFAULT FALSE,
  thumbnail_urls TEXT[]      NOT NULL DEFAULT '{}'
);

-- Index for fast history queries
CREATE INDEX IF NOT EXISTS analyses_created_at_idx ON analyses (created_at DESC);

-- ── Row Level Security ────────────────────────────────────────────────────────
ALTER TABLE analyses ENABLE ROW LEVEL SECURITY;

-- Anyone can read and insert (no auth for MVP)
CREATE POLICY "Public read"   ON analyses FOR SELECT USING (true);
CREATE POLICY "Public insert" ON analyses FOR INSERT WITH CHECK (true);
CREATE POLICY "Public delete" ON analyses FOR DELETE USING (true);

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
