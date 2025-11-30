import { NextResponse } from 'next/server'
import { createDonation, getDonationsByPost } from '@/db/index'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { postId, txHash, donor, amountWei } = body
    if (!postId || !txHash) {
      return NextResponse.json({ error: 'postId and txHash required' }, { status: 400 })
    }
    const row = await createDonation(postId, txHash, donor ?? null, amountWei ?? '0')
    return NextResponse.json(row, { status: 201 })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? 'server error' }, { status: 500 })
  }
}

export async function GET(request: Request) {
  try {
    const url = new URL(request.url)
    const postId = url.searchParams.get('postId')
    if (!postId) return NextResponse.json({ error: 'postId required' }, { status: 400 })
    const rows = await getDonationsByPost(postId)
    return NextResponse.json(rows)
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? 'server error' }, { status: 500 })
  }
}
