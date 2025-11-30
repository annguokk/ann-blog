# Vercel 数据库设置步骤

## 问题
Vercel 上的 PostgreSQL 数据库没有数据表。

## 解决方案

### 步骤 1：登录 Vercel 并进入 SQL Editor

1. 登录 [Vercel Dashboard](https://vercel.com)
2. 进入你的项目
3. 点击 **Storage** 标签
4. 找到你的 PostgreSQL 数据库，点击进入
5. 在数据库详情页面，找到 **SQL Editor** 或 **Postgres** 标签，点击打开 SQL 编辑器

### 步骤 2：执行建表 SQL

在 SQL Editor 中，**逐个执行**以下两个 SQL 语句：

#### 第一条：创建 posts 表

```sql
CREATE TABLE "posts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" text NOT NULL,
	"author" text NOT NULL,
	"description" text,
	"tags" json DEFAULT '[]'::json NOT NULL,
	"category" text,
	"img" text,
	"github" text,
	"reading_time_minutes" integer,
	"published_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
```

执行并等待完成。

#### 第二条：创建 donations 表

```sql
CREATE TABLE "donations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"post_id" uuid NOT NULL,
	"tx_hash" text NOT NULL,
	"donor" text,
	"amount_wei" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
```

执行并等待完成。

### 步骤 3：验证表创建成功

在 SQL Editor 中执行：
```sql
SELECT table_name FROM information_schema.tables WHERE table_schema = 'public';
```

应该看到 `posts` 和 `donations` 两个表。

### 步骤 4：验证部署

回到 Vercel 项目，重新部署（或等待自动部署）。

然后访问你的应用，测试新增文章功能。应该能成功保存数据了。

## 如果使用 psql 命令行

如果你有 psql 客户端，也可以直接运行：

```bash
# 从 drizzle 目录执行初始迁移
psql $DATABASE_URL < drizzle/0000_mixed_sharon_carter.sql
```

其中 `$DATABASE_URL` 是你的 Vercel PostgreSQL 连接字符串（可从 Vercel Storage 详情页获取）。

## 注意

- 确保 `tags` 列的类型是 `json`，而不是 `text[]`
- 确保两个表都创建成功
- 创建成功后，应用就能正常读写数据了
