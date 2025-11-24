import { NextResponse } from 'next/server'
import { getCategories } from '@/db/index'

export async function GET(request: Request, ctx?: { params?: any }) {
  try {
    // `ctx.params` can be a Promise in Next 14+, handle both cases
    const maybeParams = ctx?.params
    if (maybeParams && typeof (maybeParams as any).then === 'function') {
      await maybeParams
    }
    const items = await getCategories()
    const result = items.map((it) => ({ name: it.category, count: it.count }))
    return NextResponse.json(result)
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? 'server error' }, { status: 500 })
  }
}