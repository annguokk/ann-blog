import 'dotenv/config'
import { createClient } from '@supabase/supabase-js'

const url = process.env.NEXT_PUBLIC_SUPABASE_URL
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!url || !key) {
  console.error('缺少环境变量 NEXT_PUBLIC_SUPABASE_URL 或 NEXT_PUBLIC_SUPABASE_ANON_KEY')
  process.exit(1)
}

const supabase = createClient(url, key)

const now = new Date().toISOString()

const posts = [
  {
    title: '使用 Supabase 搭建博客后端',
    author: 'Alice',
    description: '介绍如何用 Supabase 构建博客数据层',
    tags: ['supabase', '教程'],
    category: '后端',
    img: 'https://picsum.photos/seed/supa/800/400',
    github: 'https://github.com/example/supabase-blog',
    reading_time_minutes: 8,
    published_at: now,
    updated_at: now,
  },
  {
    title: 'Next.js App Router 实战',
    author: 'Bob',
    description: '用 App Router 构建现代前端页面',
    tags: ['nextjs', 'react'],
    category: '前端',
    img: 'https://picsum.photos/seed/next/800/400',
    github: 'https://github.com/example/next-app-router',
    reading_time_minutes: 12,
    published_at: now,
    updated_at: now,
  },
  {
    title: 'Tailwind 两列表单布局',
    author: 'Carol',
    description: '用网格实现两列表单的最佳实践',
    tags: ['css', 'tailwind'],
    category: '设计',
    img: 'https://picsum.photos/seed/tw/800/400',
    github: null,
    reading_time_minutes: 5,
    published_at: now,
    updated_at: now,
  },
  {
    title: '提升阅读体验的技巧',
    author: 'Dave',
    description: '如何估算与优化文章的阅读时长',
    tags: ['体验', '内容'],
    category: '运营',
    img: 'https://picsum.photos/seed/rt/800/400',
    github: null,
    reading_time_minutes: 7,
    published_at: now,
    updated_at: now,
  },
]

const run = async () => {
  const { data, error } = await supabase.from('posts').insert(posts).select('id,title')
  if (error) {
    console.error('插入失败:', error.message)
    process.exit(1)
  }
  console.log('插入成功:', data)
}

run()