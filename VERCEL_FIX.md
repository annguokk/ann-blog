# Vercel 部署修复步骤

## 问题
在 Vercel 部署后，新增文章时报错：
```
Failed query: insert into "posts" ... params: ... ["123","next"] ...
```

## 原因
Vercel 的 PostgreSQL 数据库中 `posts` 表的 `tags` 列类型是 `text[]`（文本数组），但应该是 `json`。

## 修复步骤

### 方法 1：使用 Vercel 的 SQL Editor（推荐）

1. 登录 [Vercel Dashboard](https://vercel.com)
2. 进入你的项目
3. 点击 **Storage** 标签
4. 选择你的 PostgreSQL 数据库
5. 点击 **SQL Editor** 或 **Postgres** 标签
6. 执行以下 SQL 命令：

```sql
BEGIN;

ALTER TABLE "posts" ADD COLUMN "tags_new" json DEFAULT '[]'::json;

UPDATE "posts" 
SET "tags_new" = CASE 
  WHEN "tags" IS NULL THEN '[]'::json
  WHEN "tags" = '{}'::text[] THEN '[]'::json
  ELSE to_json("tags")
END;

ALTER TABLE "posts" DROP COLUMN "tags";

ALTER TABLE "posts" RENAME COLUMN "tags_new" TO "tags";

ALTER TABLE "posts" ALTER COLUMN "tags" SET NOT NULL;

COMMIT;
```

### 方法 2：使用 psql 命令行

```bash
psql "your-database-url" -f vercel_fix_tags.sql
```

其中 `your-database-url` 是你的 Vercel PostgreSQL 连接字符串。

## 验证修复

修复后，在 Vercel 上重新部署并测试新增文章功能。

```bash
git add .
git commit -m "Fix tags column type for Vercel"
git push origin main
```

然后在新增文章页面填写表单并提交，应该能成功插入数据。
