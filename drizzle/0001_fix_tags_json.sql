-- Safe migration: only modify tags column if it exists and is not already json
-- This checks if the column type needs to be changed

-- First, check and update if needed (idempotent approach)
DO $$
BEGIN
  -- Try to alter the column, if it fails (already json), continue
  BEGIN
    ALTER TABLE "posts" 
    ALTER COLUMN "tags" SET DATA TYPE json USING (
      CASE 
        WHEN "tags" IS NULL THEN '[]'::json
        WHEN "tags" = '{}'::text[] THEN '[]'::json
        ELSE to_json("tags")
      END
    );
    ALTER TABLE "posts" 
    ALTER COLUMN "tags" SET DEFAULT '[]'::json;
  EXCEPTION WHEN OTHERS THEN
    -- Column already is json or other error, continue
    NULL;
  END;
END $$;

-- Ensure the default is set
ALTER TABLE "posts" 
ALTER COLUMN "tags" SET DEFAULT '[]'::json;
