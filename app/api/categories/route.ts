import { NextResponse } from 'next/server'
import { getCategories } from '@/db/index'

export async function GET() {
  try {
    const items = await getCategories()
    const result = items.map((it) => ({ name: it.category, count: it.count }))
    return NextResponse.json(result)
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? 'server error' }, { status: 500 })
  }
}