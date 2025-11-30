// d:\blog\my-app\app\posts\[id]\page.tsx
"use client"
import Link from 'next/link'
import { useQuery } from '@tanstack/react-query'
import { useParams } from 'next/navigation'
import TipButton from '@/app/components/TipButton'
export default function PostDetail() {
  const { id } = useParams() as { id: string }
  // 用 id 发起请求或渲染 
  const { data: p, isLoading, error } = useQuery({
    queryKey: ['post', id],
    queryFn: async ({ queryKey }) => {
      const [_key, postId] = queryKey as [string, string]
      const res = await fetch(`/api/posts/${postId}`, { cache: 'no-store' })
      if (!res.ok) throw new Error('未找到文章')
      return res.json()
    },
    enabled: Boolean(id),
  })
  if (isLoading) {
    return (
      <div className="mx-auto max-w-6xl px-6 py-16 text-zinc-200">加载中...</div>
    )
  }
  if (error || !p) {
    return (
      <div className="mx-auto max-w-6xl px-6 py-16 text-zinc-200">
        <div className="rounded-xl border border-white/10 bg-[#0d1424] p-8">
          <div className="mb-4 text-xl font-semibold">未找到文章</div>
          <Link href="/" className="text-sky-400">返回首页</Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0a0f1a] text-zinc-100">
      <main className="mx-auto max-w-6xl px-6 py-8">
        <div className="grid gap-6 lg:grid-cols-[260px_1fr]">
          <aside className="rounded-xl border border-white/10 bg-[#0d1424] p-4">
            <div className="mb-3 flex items-center justify-between">
              <div className="text-sm font-semibold text-zinc-300">目录</div>
              <Link href="/" className="text-sky-400">返回</Link>
            </div>
            <nav className="space-y-1">
              <a href="#summary" className="block rounded bg-sky-900/40 px-3 py-2 text-sm text-white">摘要</a>
            </nav>
          </aside>

          <article className="rounded-xl border border-white/10 bg-[#0d1424] p-6 shadow-md">
            <h1 className="mb-4 text-3xl font-bold text-white">{p.title}</h1>
            <div className="mb-4 flex flex-wrap items-center gap-3 text-xs text-zinc-400">
              <span>发布于：{new Date(p.published_at).toLocaleDateString()}</span>
              <span>• {p.reading_time_minutes ?? 0} min read</span>
              <span>• 更新：{new Date(p.updated_at).toLocaleDateString()}</span>
            </div>
            <div className="mb-6 flex flex-wrap gap-2">
              {(p.tags ?? []).map((t: string) => (
                <span key={t} className="rounded-full border border-white/10 px-2 py-0.5 text-xs text-zinc-300">
                  {t}
                </span>
              ))}
            </div>

            <section id="summary" className="space-y-4 text-zinc-200">
              <h2 className="text-xl font-semibold text-white">摘要</h2>
              <p className="leading-7">{p.description}</p>
            </section>
            <div className="mt-6">
              <TipButton postId={id} contractAddress="0x295066613C2bd716D293Edd0dcEB577D35EF5f40" />
            </div>
          </article>
        </div>
      </main>
    </div>
  )
}