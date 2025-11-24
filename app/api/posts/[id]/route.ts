import { NextResponse } from 'next/server'
import { getPostById, updatePost, deletePost } from '@/db/index'

export async function GET(request: Request, ctx?: { params?: any }) {
  try {
    const url = new URL(request.url)
    const maybeParams = ctx?.params
    const paramsObj = maybeParams && typeof (maybeParams as any).then === 'function' ? await maybeParams : maybeParams
    const id = (paramsObj?.id ?? url.searchParams.get('id') ?? url.pathname.split('/').pop() ?? '').trim()
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

export async function PUT(request: Request, ctx?: { params?: any }) {
  const maybeParams = ctx?.params
  const paramsObj = maybeParams && typeof (maybeParams as any).then === 'function' ? await maybeParams : maybeParams
  const { id } = paramsObj as { id: string }
  const body = await request.json()
  const row = await updatePost(id, body)
  if (!row) {
    return NextResponse.json({ error: 'update failed' }, { status: 500 })
  }
  return NextResponse.json(row)
}

export async function DELETE(_: Request, ctx?: { params?: any }) {
  const maybeParams = ctx?.params
  const paramsObj = maybeParams && typeof (maybeParams as any).then === 'function' ? await maybeParams : maybeParams
  const { id } = paramsObj as { id: string }
  const ok = await deletePost(id)
  if (!ok) {
    return NextResponse.json({ error: 'delete failed' }, { status: 500 })
  }
  return NextResponse.json({ ok: true })
}