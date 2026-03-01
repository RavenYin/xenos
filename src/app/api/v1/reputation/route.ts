import { NextRequest, NextResponse } from 'next/server'
import { getVCA_SDK } from '@/lib/vca-sdk'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

/**
 * GET /api/v1/reputation?userId=xxx|me
 * 获取用户信誉
 */

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    // 如果 userId=me，从 session 获取
    let targetUserId = userId
    if (userId === 'me') {
      const sessionId = request.cookies.get('session_user_id')?.value
      if (!sessionId) {
        return NextResponse.json({ code: 401, error: '未登录' }, { status: 401 })
      }
      const user = await prisma.user.findUnique({
        where: { id: sessionId },
        select: { secondmeUserId: true },
      })
      if (!user) {
        return NextResponse.json({ code: 404, error: '用户不存在' }, { status: 404 })
      }
      targetUserId = user.secondmeUserId
    }

    if (!targetUserId) {
      return NextResponse.json(
        { code: 400, error: 'Missing userId' },
        { status: 400 }
      )
    }

    const sdk = getVCA_SDK()
    const result = await sdk.getReputation(targetUserId)

    return NextResponse.json({
      code: 0,
      data: result
    })
  } catch (error: any) {
    console.error('Get reputation error:', error)
    return NextResponse.json(
      { code: 500, error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
