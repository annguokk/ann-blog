// d:\blog\my-app\app\components\HeaderNav.tsx
"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useClerk } from "@clerk/nextjs"
import { useState, useEffect, useRef } from "react"

export default function HeaderNav() {
  const pathname = usePathname()
  const isAuthPage = pathname.startsWith("/sign-in") || pathname.startsWith("/sign-up")
  if (isAuthPage) return null

  const { signOut } = useClerk()

  const navs = [
    { href: "/", label: "首页", active: pathname === "/" },
    { href: "/categories", label: "分类", active: pathname.startsWith("/categories") },
    { href: "/posts/new", label: "新文章", active: pathname.startsWith("/posts/new") },
  ]

  const [open, setOpen] = useState(false)
  const [isDark, setIsDark] = useState(true)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const initial = document.documentElement.classList.contains('dark')
    setIsDark(initial)
  }, [])

  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (!menuRef.current) return
      if (!menuRef.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('click', onDocClick)
    return () => document.removeEventListener('click', onDocClick)
  }, [])

  function toggleTheme() {
    if (isDark) {
      document.documentElement.classList.remove('dark')
      setIsDark(false)
    } else {
      document.documentElement.classList.add('dark')
      setIsDark(true)
    }
  }

  return (
    <header className="sticky top-0 z-10 bg-[#0d1424]/80 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link href="/" className="flex items-center gap-2">
          <span className="inline-block h-8 w-8 rounded bg-orange-600" />
        </Link>
        <div className="ml-auto flex items-center gap-4">
          <nav className="flex items-center gap-6 text-sm">
            {navs.map((n) => (
              <Link
                key={n.href}
                href={n.href}
                className={n.active ? "text-sky-400" : "text-zinc-300 hover:text-white"}
              >
                {n.label}
              </Link>
            ))}
          </nav>
          <div className="relative" ref={menuRef}>
            <button
              aria-label="更多"
              onClick={() => setOpen(v => !v)}
              className="rounded p-2 text-zinc-300 hover:text-white"
              type="button"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <circle cx="5" cy="12" r="2" fill="currentColor" />
                <circle cx="12" cy="12" r="2" fill="currentColor" />
                <circle cx="19" cy="12" r="2" fill="currentColor" />
              </svg>
            </button>
            {open ? (
              <div className="absolute right-0 mt-2 w-40 rounded border border-white/10 bg-[#0d1424] p-1 text-sm shadow-md">
                <button
                  onClick={toggleTheme}
                  className="block w-full rounded px-3 py-2 text-left text-zinc-300 hover:bg-white/10"
                  type="button"
                >
                  {isDark ? '浅色主题' : '深色主题'}
                </button>
                <button
                  onClick={() => signOut({ redirectUrl: '/sign-in' })}
                  className="mt-1 block w-full rounded px-3 py-2 text-left text-red-400 hover:bg-white/10"
                  type="button"
                >
                  退出
                </button>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </header>
  )
}