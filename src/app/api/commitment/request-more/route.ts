/**
 * POST /api/commitment/request-more
 * 委托方要求补充履约证明
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  const userId = request.cookies.get('session_user_id')?.value

  if (!userId) {
    return NextResponse.json({ error: '未登录' }, { status: 401 })
  }

  try {
    const { commitmentId, comment } = await request.json()

    if (!commitmentId) {
      return NextResponse.json({ error: '缺少承诺ID' }, { status: 400 })
    }

    const commitment = await prisma.commitment.findUnique({
      where: { id: commitmentId }
    })

    if (!commitment) {
      return NextResponse.json({ error: '承诺不存在' }, { status: 404 })
    }

    // 验证是委托方
    if (commitment.receiverId !== userId) {
      return NextResponse.json({ error: '无权操作' }, { status: 403 })
    }

    // 验证状态
    if (commitment.status !== 'PENDING') {
      return NextResponse.json({ error: '当前状态无法要求补充' }, { status: 400 })
    }

    // 更新状态回 ACCEPTED，让承诺方可以重新提交
    const updated = await prisma.commitment.update({
      where: { id: commitmentId },
      data: { status: 'ACCEPTED' }
    })

    // 记录审计
    await prisma.auditLog.create({
      data: {
        action: 'request_more_evidence',
        actorId: userId,
        targetType: 'commitment',
        targetId: commitmentId,
        payload: JSON.stringify({ comment })
      }
    })

    return NextResponse.json({
      code: 0,
      data: {
        commitmentId: updated.id,
        status: updated.status,
        message: '已要求补充履约证明'
      }
    })
  } catch (error) {
    console.error('Request more error:', error)
    return NextResponse.json({ error: '操作失败' }, { status: 500 })
  }
}
