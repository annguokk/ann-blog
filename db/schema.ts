import { integer, pgTable, varchar, text, uuid, timestamp } from "drizzle-orm/pg-core";


export const postsTable = pgTable("posts", {
  id: uuid("id").defaultRandom().primaryKey(),
  title: text("title").notNull(),
  author: text("author").notNull(),
  description: text("description"),
  tags: text("tags").array().notNull().default([]),
  category: text("category"),
  img: text("img"),
  github: text("github"),
  reading_time_minutes: integer("reading_time_minutes"),
  published_at: timestamp("published_at", { withTimezone: true }).defaultNow().notNull(),
  updated_at: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});
