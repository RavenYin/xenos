import { NextRequest, NextResponse } from 'next/server'
import { getVCA_SDK, CommitmentStatus } from '@/lib/vca-sdk'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

/**
 * GET /api/v1/promises?userId=me|xxx
 * 获取用户的承诺列表（包括作为承诺方和委托方的所有承诺）
 */

export async function GET(request: NextRequest) {
  try {
    const userId = request.cookies.get('session_user_id')?.value
    const { searchParams } = new URL(request.url)
    const userIdParam = searchParams.get('userId')
    const promiserId = searchParams.get('promiserId')
    const delegatorId = searchParams.get('delegatorId')
    const status = searchParams.get('status') as CommitmentStatus | null
    const limit = parseInt(searchParams.get('limit') || '20')
    const offset = parseInt(searchParams.get('offset') || '0')

    // 如果使用 userId=me，需要从 session 获取用户
    let targetUserId: string | null = null

    if (userIdParam === 'me') {
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
      targetUserId = user.secondmeUserId
    } else if (promiserId) {
      targetUserId = promiserId
    } else if (delegatorId) {
      targetUserId = delegatorId
    }

    if (!targetUserId) {
      return NextResponse.json(
        { code: 400, error: 'Missing userId, promiserId, or delegatorId' },
        { status: 400 }
      )
    }

    const sdk = getVCA_SDK()

    // 获取承诺方的列表（用户作为承诺方）
    const myPromises = promiserId || userIdParam
      ? await sdk.listMyPromises({
          promiserId: targetUserId,
          status: status || undefined,
          limit,
          offset,
        })
      : { commitments: [], total: 0 }

    // 获取委托方的列表（用户作为委托方）
    const myDelegations = delegatorId || userIdParam
      ? await sdk.listMyDelegations({
          delegatorId: targetUserId,
          status: status || undefined,
          limit,
          offset,
        })
      : { commitments: [], total: 0 }

    // 合并两个列表（如果是 userId=me 模式）
    if (userIdParam) {
      const allCommitments = [
        ...myPromises.commitments,
        ...myDelegations.commitments,
      ].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

      return NextResponse.json({
        code: 0,
        data: {
          commitments: allCommitments,
          total: allCommitments.length,
        },
      })
    }

    // 如果指定了特定的 promiserId 或 delegatorId，返回对应列表
    const result = promiserId ? myPromises : myDelegations
    return NextResponse.json({
      code: 0,
      data: result,
    })
  } catch (error: any) {
    console.error('List promises error:', error)
    return NextResponse.json(
      { code: 500, error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
