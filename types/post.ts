export type Post = {
  id: string
  title: string
  author: string
  description?: string | null
  tags: string[]
  category?: string | null
  img?: string | null
  github?: string | null
  reading_time_minutes?: number | null
  published_at: string
  updated_at: string
}