import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import { DATABASE_URL } from '@/lib/serverEnv'
import { postsTable } from '@/db/schema'
import { donationsTable } from '@/db/schema'
import { asc, desc, count, eq } from 'drizzle-orm'

const client = postgres(DATABASE_URL, { ssl: 'require' })
const db = drizzle({ client })

export type NewPostInput = {
  title: string
  author: string
  description?: string | null
  tags?: string[]
  category?: string | null
  img?: string | null
  github?: string | null
  reading_time_minutes?: number | null
  published_at?: Date
}

export type SortOption = 'latest_published' | 'latest_updated' | 'earliest_published'

export async function createPost(input: NewPostInput) {
  const now = new Date()
  
  // Ensure tags is always an array and properly formatted for JSON column
  const tagsArray = Array.isArray(input.tags) ? input.tags : []
  
  const rows = await db
    .insert(postsTable)
    .values({
      title: input.title,
      author: input.author,
      description: input.description ?? null,
      tags: tagsArray as any, // Pass as array, Drizzle will convert to JSON
      category: input.category ?? null,
      img: input.img ?? null,
      github: input.github ?? null,
      reading_time_minutes: input.reading_time_minutes ?? null,
      published_at: input.published_at ?? now,
      updated_at: now,
    })
    .returning({
      id: postsTable.id,
      title: postsTable.title,
      author: postsTable.author,
      description: postsTable.description,
      tags: postsTable.tags,
      category: postsTable.category,
      img: postsTable.img,
      github: postsTable.github,
      reading_time_minutes: postsTable.reading_time_minutes,
      published_at: postsTable.published_at,
      updated_at: postsTable.updated_at,
    })
  return rows[0]
}

export async function getPosts(sort: SortOption = 'latest_published') {
  const order =
    sort === 'latest_published'
      ? desc(postsTable.published_at)
      : sort === 'latest_updated'
      ? desc(postsTable.updated_at)
      : asc(postsTable.published_at)

  return db
    .select({
      id: postsTable.id,
      title: postsTable.title,
      description: postsTable.description,
      tags: postsTable.tags,
      reading_time_minutes: postsTable.reading_time_minutes,
      published_at: postsTable.published_at,
      updated_at: postsTable.updated_at,
    })
    .from(postsTable)
    .orderBy(order)
}

export async function getCategories() {
  const rows = await db
    .select({ category: postsTable.category, count: count() })
    .from(postsTable)
    .groupBy(postsTable.category)
  return rows.map((r) => ({ category: r.category ?? '未分类', count: r.count }))
}

export async function getPostById(id: string) {
  const rows = await db
    .select({
      id: postsTable.id,
      title: postsTable.title,
      author: postsTable.author,
      description: postsTable.description,
      tags: postsTable.tags,
      category: postsTable.category,
      img: postsTable.img,
      github: postsTable.github,
      reading_time_minutes: postsTable.reading_time_minutes,
      published_at: postsTable.published_at,
      updated_at: postsTable.updated_at,
    })
    .from(postsTable)
    .where(eq(postsTable.id, id))
    .limit(1)
  return rows[0] ?? null
}

export type UpdatePostInput = Partial<NewPostInput>

export async function updatePost(id: string, input: UpdatePostInput) {
  const updates: any = {}
  if (input.title !== undefined) updates.title = input.title
  if (input.author !== undefined) updates.author = input.author
  if (input.description !== undefined) updates.description = input.description
  if (input.tags !== undefined) updates.tags = Array.isArray(input.tags) ? input.tags : []
  if (input.category !== undefined) updates.category = input.category
  if (input.img !== undefined) updates.img = input.img
  if (input.github !== undefined) updates.github = input.github
  if (input.reading_time_minutes !== undefined) updates.reading_time_minutes = input.reading_time_minutes
  if (input.published_at !== undefined) updates.published_at = input.published_at
  updates.updated_at = new Date()

  const rows = await db
    .update(postsTable)
    .set(updates)
    .where(eq(postsTable.id, id))
    .returning({
      id: postsTable.id,
      title: postsTable.title,
      author: postsTable.author,
      description: postsTable.description,
      tags: postsTable.tags,
      category: postsTable.category,
      img: postsTable.img,
      github: postsTable.github,
      reading_time_minutes: postsTable.reading_time_minutes,
      published_at: postsTable.published_at,
      updated_at: postsTable.updated_at,
    })
  return rows[0] ?? null
}

export async function deletePost(id: string) {
  const rows = await db.delete(postsTable).where(eq(postsTable.id, id)).returning({ id: postsTable.id })
  return rows.length > 0
}

export async function createDonation(postId: string, txHash: string, donor?: string | null, amountWei?: string) {
  const rows = await db
    .insert(donationsTable)
    .values({
      post_id: postId,
      tx_hash: txHash,
      donor: donor ?? null,
      amount_wei: amountWei ?? '0',
      created_at: new Date(),
    })
    .returning({
      id: donationsTable.id,
      post_id: donationsTable.post_id,
      tx_hash: donationsTable.tx_hash,
      donor: donationsTable.donor,
      amount_wei: donationsTable.amount_wei,
      created_at: donationsTable.created_at,
    })
  return rows[0]
}

export async function getDonationsByPost(postId: string) {
  return db
    .select({
      id: donationsTable.id,
      tx_hash: donationsTable.tx_hash,
      donor: donationsTable.donor,
      amount_wei: donationsTable.amount_wei,
      created_at: donationsTable.created_at,
    })
    .from(donationsTable)
    .where(eq(donationsTable.post_id, postId))
    .orderBy(desc(donationsTable.created_at))
}