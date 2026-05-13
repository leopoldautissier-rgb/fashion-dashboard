-- Migration: Add reference and image_url columns
-- Run this in Supabase SQL Editor

ALTER TABLE items ADD COLUMN IF NOT EXISTS reference TEXT UNIQUE;
ALTER TABLE items ADD COLUMN IF NOT EXISTS image_url TEXT;

-- Create index for fast reference lookups
CREATE INDEX IF NOT EXISTS idx_items_reference ON items(reference);