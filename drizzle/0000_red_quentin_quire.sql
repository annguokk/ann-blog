-- Alter existing posts table to change tags from text array to json
ALTER TABLE "posts" 
ALTER COLUMN "tags" DROP DEFAULT,
ALTER COLUMN "tags" SET DATA TYPE json USING (
  CASE 
    WHEN "tags" IS NULL THEN '[]'::json
    WHEN "tags" = '{}'::text[] THEN '[]'::json
    ELSE to_json("tags")
  END
),
ALTER COLUMN "tags" SET DEFAULT '[]'::json;
