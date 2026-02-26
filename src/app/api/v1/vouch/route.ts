import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

/**
 * POST /api/v1/vouch
 * 创建担保关系
 * Body: voucherId, voucheeId, context, comment
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { voucherId, voucheeId, context, comment } = body

    if (!voucherId || !voucheeId || !context) {
      return NextResponse.json({ code: 400, error: 'Missing required fields' }, { status: 400 })
    }

    if (voucherId === voucheeId) {
      return NextResponse.json({ code: 400, error: 'Cannot vouch for yourself' }, { status: 400 })
    }

    const [voucher, vouchee] = await Promise.all([
      prisma.user.findUnique({ where: { id: voucherId } }),
      prisma.user.findUnique({ where: { id: voucheeId } })
    ])

    if (!voucher || !vouchee) {
      return NextResponse.json({ code: 404, error: 'User not found' }, { status: 404 })
    }

    const vouch = await prisma.vouch.create({
      data: { voucherId, voucheeId, context, comment }
    })

    return NextResponse.json({ code: 0, data: vouch })
  } catch (error: any) {
    if (error.code === 'P2002') {
      return NextResponse.json({ code: 400, error: 'Vouch already exists' }, { status: 400 })
    }
    return NextResponse.json({ code: 500, error: error.message }, { status: 500 })
  }
}

/**
 * GET /api/v1/vouch?voucheeId=xxx
 * 获取某用户的担保列表
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const voucheeId = searchParams.get('voucheeId')
    const voucherId = searchParams.get('voucherId')

    const where: any = {}
    if (voucheeId) where.voucheeId = voucheeId
    if (voucherId) where.voucherId = voucherId

    const vouches = await prisma.vouch.findMany({
      where,
      include: {
        voucher: { select: { id: true, name: true } },
        vouchee: { select: { id: true, name: true } }
      },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json({
      code: 0,
      data: vouches.map(v => ({
        id: v.id,
        voucherId: v.voucherId,
        voucherName: v.voucher.name,
        voucheeId: v.voucheeId,
        voucheeName: v.vouchee.name,
        context: v.context,
        comment: v.comment,
        createdAt: v.createdAt
      }))
    })
  } catch (error: any) {
    return NextResponse.json({ code: 500, error: error.message }, { status: 500 })
  }
}
