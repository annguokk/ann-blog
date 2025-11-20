import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import type { Post } from '@/types/post'

export default async function PostsPage() {
  const { data: posts } = await supabase
    .from('posts')
    .select('*')
    .order('published_at', { ascending: false })

  return (
    <div className="mx-auto max-w-3xl px-6 py-12">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold">文章列表</h1>
        <Link href="/posts/new" className="rounded bg-black px-3 py-2 text-white dark:bg-white dark:text-black">新增文章</Link>
      </div>
      <ul className="space-y-6">
        {(posts ?? []).map((p: Post) => (
          <li key={p.id} className="rounded border border-black/10 p-4 dark:border-white/20">
            <div className="mb-2 text-xl font-medium">{p.title}</div>
            <div className="mb-2 text-sm text-zinc-600 dark:text-zinc-400">
              作者 {p.author} · 发布 {new Date(p.published_at).toLocaleDateString()} · 更新 {new Date(p.updated_at).toLocaleDateString()} · 建议阅读 {p.reading_time_minutes ?? 0} 分钟
            </div>
            <div className="mb-2 text-zinc-700 dark:text-zinc-300">{p.description}</div>
            <div className="flex flex-wrap gap-2 text-sm">
              {(p.tags ?? []).map((t: string) => (
                <span key={t} className="rounded bg-zinc-100 px-2 py-1 dark:bg-zinc-800">{t}</span>
              ))}
            </div>
            <div className="mt-2 text-sm">分类 {p.category ?? '未分类'}</div>
            <div className="mt-2 text-sm">
              {p.github ? (
                <a href={p.github} className="text-blue-600 dark:text-blue-400" target="_blank">GitHub</a>
              ) : null}
            </div>
          </li>
        ))}
      </ul>
      <div className="mt-8">
        <Link href="/categories" className="text-blue-600 dark:text-blue-400">查看分类目录</Link>
      </div>
    </div>
  )
}