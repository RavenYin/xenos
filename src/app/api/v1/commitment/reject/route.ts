import { NextRequest, NextResponse } from 'next/server'
import { getVCA_SDK } from '@/lib/vca-sdk'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

/**
 * POST /api/v1/commitment/reject
 * 承诺方拒绝承诺
 *
 * Body:
 * {
 *   "commitmentId": "xxx",
 *   "promiserId": "user_123",  // 可选，如果不提供则从 session 获取
 *   "reason": "时间冲突"  // 可选
 * }
 */

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { commitmentId, promiserId: bodyPromiserId, reason } = body

    if (!commitmentId) {
      return NextResponse.json(
        { code: 400, error: 'Missing required field: commitmentId' },
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

    const sdk = getVCA_SDK()
    const result = await sdk.rejectCommitment(commitmentId, promiserId, reason)

    return NextResponse.json({
      code: 0,
      data: result
    })
  } catch (error: any) {
    console.error('Reject commitment error:', error)
    return NextResponse.json(
      { code: 500, error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
