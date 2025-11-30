-- Migration: create donations table
-- Run with your migration tool or psql against your database

CREATE TABLE IF NOT EXISTS donations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id uuid NOT NULL,
  tx_hash text NOT NULL,
  donor text,
  amount_wei text,
  created_at timestamptz DEFAULT now()
);

-- Add an index to query by post_id
CREATE INDEX IF NOT EXISTS idx_donations_post_id ON donations(post_id);
