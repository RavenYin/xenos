import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

/**
 * Agent 履约证明提交 API
 *
 * POST /api/v1/commitment/evidence
 * Agent 通过此接口提交履约证明
 */

/**
 * 提交履约证明
 *
 * Body:
 * {
 *   "commitmentId": "xxx",
 *   "promiserId": "agent_001",  // 可选，如果不提供则从 session 获取
 *   "evidence": {
 *     "type": "link" | "text" | "image" | "github_pr",
 *     "content": "https://github.com/xxx/pull/1",
 *     "description": "完成了登录功能"
 *   }
 * }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { commitmentId, promiserId: bodyPromiserId, evidence } = body

    if (!commitmentId) {
      return NextResponse.json(
        { code: 400, error: 'Missing commitmentId' },
        { status: 400 }
      )
    }

    // 从 session 获取用户 ID（如果未提供 promiserId）
    let promiserId = bodyPromiserId
    if (!promiserId) {
      const userId = request.cookies.get('session_user_id')?.value
      if (!userId) {
        return NextResponse.json({ code: 401, error: '未登录' }, { status: 401 })
      }
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { secondmeUserId: true },
      })
      if (!user) {
        return NextResponse.json({ code: 404, error: '用户不存在' }, { status: 404 })
      }
      promiserId = user.secondmeUserId
    }

    // 查找承诺
    const commitment = await prisma.commitment.findUnique({
      where: { id: commitmentId }
    })

    if (!commitment) {
      return NextResponse.json(
        { code: 404, error: 'Commitment not found' },
        { status: 404 }
      )
    }

    // 验证是承诺方
    const promiser = await prisma.user.findFirst({
      where: {
        OR: [
          { id: promiserId },
          { secondmeUserId: promiserId }
        ]
      }
    })

    if (!promiser || commitment.promiserId !== promiser.id) {
      return NextResponse.json(
        { code: 403, error: 'Not authorized to submit evidence for this commitment' },
        { status: 403 }
      )
    }

    // 验证状态
    if (commitment.status !== 'ACCEPTED' && commitment.status !== 'PENDING') {
      return NextResponse.json(
        { code: 400, error: `Cannot submit evidence for commitment with status ${commitment.status}` },
        { status: 400 }
      )
    }

    // 构建证据内容
    const evidenceContent = typeof evidence === 'string'
      ? evidence
      : JSON.stringify(evidence)

    // 更新承诺
    const updated = await prisma.commitment.update({
      where: { id: commitmentId },
      data: {
        status: 'PENDING', // 提交后变为待验收
        evidence: evidenceContent
      }
    })

    // 记录审计日志
    await prisma.auditLog.create({
      data: {
        action: 'submit_evidence',
        actorId: promiser.id,
        targetType: 'commitment',
        targetId: commitmentId,
        payload: JSON.stringify({ evidence })
      }
    })

    return NextResponse.json({
      code: 0,
      data: {
        commitmentId: updated.id,
        status: updated.status,
        evidence: evidenceContent,
        message: '履约证明已提交，等待委托方验收'
      }
    })
  } catch (error: any) {
    console.error('Submit evidence error:', error)
    return NextResponse.json(
      { code: 500, error: error.message },
      { status: 500 }
    )
  }
}
