"use client"
import { useQuery } from '@tanstack/react-query'

type CategoryItem = { name: string; count: number }

export default function CategoriesPage() {
  const { data, isLoading, error } = useQuery<CategoryItem[]>({
    queryKey: ['categories'],
    queryFn: async () => {
      const res = await fetch('/api/categories', { cache: 'no-store' })
      if (!res.ok) throw new Error('加载分类失败')
      return res.json()
    },
  })

  const items = data ?? []

  return (
    <div className="min-h-screen bg-[#0a0f1a] text-zinc-100">
      <main className="mx-auto max-w-6xl px-6 py-8">
        <h1 className="mb-6 text-2xl font-semibold">文章分类</h1>
        {isLoading ? <div className="text-sm text-zinc-400">加载中...</div> : null}
        {error ? <div className="text-sm text-red-600">{(error as Error).message}</div> : null}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((it) => (
            <div key={it.name} className="rounded-xl border border-white/10 bg-[#0d1424] p-4 shadow-md">
              <div className="text-lg font-semibold text-white">{it.name}</div>
              <div className="mt-2 text-sm text-zinc-300">共 {it.count} 篇文章</div>
            </div>
          ))}
        </div>
      </main>
    </div>
  )
}