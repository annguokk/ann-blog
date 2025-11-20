// d:\blog\my-app\app\components\SortTabs.tsx
"use client"
import { useState } from 'react'
import { useRouter, usePathname, useSearchParams } from 'next/navigation'

type Sort = 'latest_published' | 'earliest_published' | 'latest_updated'
type Tab = { key: Sort; label: string }

export default function SortTabs({ current, tabs }: { current: Sort; tabs: Tab[] }) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [active, setActive] = useState<Sort>(current)

  function onClick(key: Sort) {
    setActive(key)
    const params = new URLSearchParams(searchParams ? Array.from(searchParams.entries()) : [])
    params.set('sort', key)
    router.push(`${pathname}?${params.toString()}`)
  }

  return (
    <div className="flex items-center gap-3">
      {tabs.map(t => (
        <button
          key={t.key}
          onClick={() => onClick(t.key)}
          className={`rounded px-3 py-1 ${active === t.key ? 'bg-sky-600 text-white' : 'bg-white/10 text-zinc-300 hover:bg-white/20'}`}
        >
          {t.label}
        </button>
      ))}
    </div>
  )
}