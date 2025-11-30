-- Fix for Vercel deployment: Convert tags column from text[] to json
-- Run this manually on your Vercel Postgres database

-- Step 1: Check current column type (informational)
-- SELECT column_name, data_type FROM information_schema.columns 
-- WHERE table_name = 'posts' AND column_name = 'tags';

-- Step 2: Convert the column (idempotent)
BEGIN;

-- Create a temporary new column
ALTER TABLE "posts" ADD COLUMN "tags_new" json DEFAULT '[]'::json;

-- Migrate data from old column to new column
UPDATE "posts" 
SET "tags_new" = CASE 
  WHEN "tags" IS NULL THEN '[]'::json
  WHEN "tags" = '{}'::text[] THEN '[]'::json
  ELSE to_json("tags")
END;

-- Drop old column
ALTER TABLE "posts" DROP COLUMN "tags";

-- Rename new column
ALTER TABLE "posts" RENAME COLUMN "tags_new" TO "tags";

-- Ensure NOT NULL constraint
ALTER TABLE "posts" ALTER COLUMN "tags" SET NOT NULL;

COMMIT;
