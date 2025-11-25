import { NextResponse } from 'next/server'
import { getPostById, updatePost, deletePost } from '@/db/index'

export async function GET(request: Request, ctx?: { params: Promise<{ id: string }> }) {
  try {
    const url = new URL(request.url)
 const maybeParams = await ctx?.params
    const id = (maybeParams?.id ?? url.searchParams.get('id') ?? url.pathname.split('/').pop() ?? '').trim()
    if (!id) {
      return NextResponse.json({ error: 'id required' }, { status: 400 })
    }
    const row = await getPostById(id)
    if (!row) {
      return NextResponse.json({ error: 'not found' }, { status: 404 })
    }
    return NextResponse.json(row)
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? 'server error' }, { status: 500 })
  }
}

export async function PUT(request: Request, ctx?: { params: Promise<any> }) {
  const maybeParams = await ctx?.params
  const { id } = maybeParams as { id: string }
  const body = await request.json()
  const row = await updatePost(id, body)
  if (!row) {
    return NextResponse.json({ error: 'update failed' }, { status: 500 })
  }
  return NextResponse.json(row)
}

export async function DELETE(_: Request, ctx?: { params: Promise<{ id: string }> }) {
  const maybeParams = await ctx?.params
  const { id } = maybeParams as { id: string }
  const ok = await deletePost(id)
  if (!ok) {
    return NextResponse.json({ error: 'delete failed' }, { status: 500 })
  }
  return NextResponse.json({ ok: true })
}