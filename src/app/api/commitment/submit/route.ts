/**
 * POST /api/commitment/submit
 * 承诺方提交履约
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  const userId = request.cookies.get('session_user_id')?.value

  if (!userId) {
    return NextResponse.json({ error: '未登录' }, { status: 401 })
  }

  try {
    const { commitmentId, evidence } = await request.json()

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
    if (commitment.status !== 'ACCEPTED' && commitment.status !== 'PENDING') {
      return NextResponse.json({ error: '当前状态无法提交履约' }, { status: 400 })
    }

    // 更新状态为待验收
    const updated = await prisma.commitment.update({
      where: { id: commitmentId },
      data: { 
        status: 'PENDING',
        evidence: evidence || null
      },
      include: {
        promiser: { select: { id: true, name: true, avatarUrl: true } },
        receiver: { select: { id: true, name: true, avatarUrl: true } }
      }
    })

    // 记录审计
    await prisma.auditLog.create({
      data: {
        action: 'submit_fulfillment',
        actorId: userId,
        targetType: 'commitment',
        targetId: commitmentId,
        payload: JSON.stringify({ evidence })
      }
    })

    return NextResponse.json({ code: 0, data: updated })
  } catch (error) {
    console.error('Submit fulfillment error:', error)
    return NextResponse.json({ error: '提交履约失败' }, { status: 500 })
  }
}
