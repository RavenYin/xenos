/**
 * POST /api/commitment/reject
 * 承诺方拒绝承诺
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  const userId = request.cookies.get('session_user_id')?.value

  if (!userId) {
    return NextResponse.json({ error: '未登录' }, { status: 401 })
  }

  try {
    const { commitmentId, reason } = await request.json()

    if (!commitmentId) {
      return NextResponse.json({ error: '缺少承诺ID' }, { status: 400 })
    }

    // 查找承诺
    const commitment = await prisma.commitment.findUnique({
      where: { id: commitmentId }
    })

    if (!commitment) {
      return NextResponse.json({ error: '承诺不存在' }, { status: 404 })
    }

    // 验证是承诺方
    if (commitment.promiserId !== userId) {
      return NextResponse.json({ error: '无权操作' }, { status: 403 })
    }

    // 验证状态
    if (commitment.status !== 'PENDING_ACCEPT') {
      return NextResponse.json({ error: '当前状态无法拒绝' }, { status: 400 })
    }

    // 更新状态
    const updated = await prisma.commitment.update({
      where: { id: commitmentId },
      data: { status: 'REJECTED' },
      include: {
        promiser: { select: { id: true, name: true, avatarUrl: true } },
        receiver: { select: { id: true, name: true, avatarUrl: true } }
      }
    })

    // 记录审计
    await prisma.auditLog.create({
      data: {
        action: 'reject_commitment',
        actorId: userId,
        targetType: 'commitment',
        targetId: commitmentId,
        payload: JSON.stringify({ reason })
      }
    })

    return NextResponse.json({ code: 0, data: updated })
  } catch (error) {
    console.error('Reject commitment error:', error)
    return NextResponse.json({ error: '拒绝承诺失败' }, { status: 500 })
  }
}
