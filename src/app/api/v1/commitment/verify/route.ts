import { NextRequest, NextResponse } from 'next/server'
import { getVCA_SDK } from '@/lib/vca-sdk'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

/**
 * POST /api/v1/commitment/verify
 * 委托方验收承诺
 *
 * Body:
 * {
 *   "commitmentId": "xxx",
 *   "verifierId": "user_456",   // 委托方 ID，可选，如果不提供则从 session 获取
 *   "fulfilled": true,          // 是否履约
 *   "evidence": "...",          // 可选：证据
 *   "comment": "完成得很好"      // 可选：备注
 * }
 */

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { commitmentId, verifierId: bodyVerifierId, fulfilled, evidence, comment } = body

    if (!commitmentId || fulfilled === undefined) {
      return NextResponse.json(
        { code: 400, error: 'Missing required fields: commitmentId, fulfilled' },
        { status: 400 }
      )
    }

    // 从 session 获取用户 ID（如果未提供 verifierId）
    let verifierId = bodyVerifierId
    if (!verifierId) {
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
      verifierId = user.secondmeUserId
    }

    const sdk = getVCA_SDK()
    const result = await sdk.verifyCommitment({
      commitmentId,
      verifierId,
      fulfilled,
      evidence,
      comment
    })

    return NextResponse.json({
      code: 0,
      data: result
    })
  } catch (error: any) {
    console.error('Verify commitment error:', error)
    return NextResponse.json(
      { code: 500, error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
