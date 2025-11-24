import { NextResponse } from 'next/server'
import { createPost, getPosts } from '@/db/index'
import type { NewPostInput, SortOption } from '@/db/index'

export async function GET(request: Request, ctx?: { params?: any }) {
  try {
    const maybeParams = ctx?.params
    if (maybeParams && typeof (maybeParams as any).then === 'function') {
      await maybeParams
    }
    const { searchParams } = new URL(request.url)
    const sort = (searchParams.get('sort') ?? 'latest_published') as SortOption
    const list = await getPosts(sort)
    return NextResponse.json(list ?? [])
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? 'server error' }, { status: 500 })
  }
}

export async function POST(request: Request, ctx?: { params?: any }) {
  try {
    const maybeParams = ctx?.params
    if (maybeParams && typeof (maybeParams as any).then === 'function') {
      await maybeParams
    }
    const body = (await request.json()) as NewPostInput
    const row = await createPost(body)
    return NextResponse.json(row, { status: 201 })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? 'server error' }, { status: 500 })
  }
}