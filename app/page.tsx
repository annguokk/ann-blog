"use client"
import Link from 'next/link'
import { useSearchParams, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
type Sort = "latest_published" | "earliest_published" | "latest_updated";

export default function Home() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const sort = (searchParams.get('sort') ?? 'latest_published') as Sort

  const [posts, setPosts] = useState<any[]>([])
  const tabs: { key: Sort; label: string }[] = [
    { key: 'latest_published', label: '最新发布' },
    { key: 'earliest_published', label: '最早发布' },
    { key: 'latest_updated', label: '最近修改' },
  ]
  useEffect(() => {
    let ignore = false
    ;(async () => {
      const res = await fetch(`/api/posts?sort=${sort}`, { cache: 'no-store' })
      const data = res.ok ? await res.json() : []
      if (!ignore) setPosts(data)
    })()
    return () => { ignore = true }
  }, [sort])

  return (
    <div className="min-h-screen bg-[#0a0f1a] text-zinc-100">
      <main className="mx-auto max-w-6xl px-6 py-8">
        <div className="mb-6 flex items-center gap-3 text-sm">
          <span className="text-zinc-400">排序方式：</span>
          {tabs.map(t => (
            <Link
              key={t.key}
              href={{ pathname: '/', query: { sort: t.key } }}
              className={`rounded px-3 py-1 ${sort === t.key ? 'bg-sky-600 text-white' : 'bg-white/10 text-zinc-300 hover:bg-white/20'}`}
            >
              {t.label}
            </Link>
          ))}
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {(posts ?? []).map((p) => (
            <article
              key={p.id}
              className="rounded-xl border border-white/10 bg-[#0d1424] p-4 shadow-md"
            >
              <div className="mb-2 flex items-center gap-3 text-xs text-zinc-400">
                <span>{new Date(p.published_at).toLocaleDateString()}</span>
                <span>• {p.reading_time_minutes ?? 0} min read</span>
                <span>• {new Date(p.updated_at).toLocaleDateString()}</span>
              </div>
              <h2 className="mb-2 text-lg font-semibold text-white">
                <Link href={`/posts/${p.id}`} className="hover:underline">{p.title}</Link>
              </h2>
              <p className="mb-3 text-sm text-zinc-300">{p.description}</p>
              <div className="flex flex-wrap gap-2">
                {(p.tags ?? []).map((t: string) => (
                  <span
                    key={t}
                    className="rounded-full border border-white/10 px-2 py-0.5 text-xs text-zinc-300"
                  >
                    {t}
                  </span>
                ))}
              </div>
            </article>
          ))}
        </div>
      </main>
    </div>
  );
}
