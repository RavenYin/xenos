/**
n// Force dynamic rendering
export const dynamic = 'force-dynamic'

 * ToWow 任务发布到 VCA
 * 
 * POST /api/towow/sync
 * 将 ToWow 任务同步为 VCA 承诺
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getVCA_SDK } from '@/lib/vca-sdk'
import { getTowowClient, isTowowEnabled } from '@/lib/towow'

/**
 * POST /api/towow/sync
 * 
 * Body:
 *   {
 *     "action": "publish" | "accept" | "verify",
 *     "taskId": "towow_task_xxx",
 *     "promiserId": "user_xxx",  // for accept
 *     "fulfilled": true          // for verify
 *   }
 */
export async function POST(request: NextRequest) {
  const userId = request.cookies.get('session_user_id')?.value

  if (!userId) {
    return NextResponse.json({ error: '未登录' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const { action, taskId, promiserId, fulfilled, comment } = body

    const sdk = getVCA_SDK()

    switch (action) {
      case 'publish': {
        // 将 ToWow 任务发布为 VCA 承诺
        // 查找任务对应的承诺，或创建新的
        const existing = await prisma.commitment.findFirst({
          where: { towowTaskId: taskId }
        })

        if (existing) {
          return NextResponse.json({
            code: 0,
            data: { commitmentId: existing.id, message: '承诺已存在' }
          })
        }

        // 创建新承诺（公开，等待接受）
        const user = await prisma.user.findUnique({ where: { id: userId } })
        
        const commitment = await sdk.createCommitment({
          promiserId: 'open_for_acceptance',  // 公开任务
          delegatorId: user?.secondmeUserId || userId,
          task: `ToWow 任务: ${taskId}`,
          context: 'towow',
          externalId: taskId
        })

        return NextResponse.json({
          code: 0,
          data: { commitmentId: commitment.id }
        })
      }

      case 'accept': {
        // 接受 ToWow 任务
        const commitment = await prisma.commitment.findFirst({
          where: { towowTaskId: taskId }
        })

        if (!commitment) {
          return NextResponse.json(
            { code: 404, error: '找不到对应的承诺' },
            { status: 404 }
          )
        }

        const result = await sdk.acceptCommitment(commitment.id, promiserId || userId)

        return NextResponse.json({
          code: 0,
          data: result
        })
      }

      case 'verify': {
        // 验收 ToWow 任务
        const commitment = await prisma.commitment.findFirst({
          where: { towowTaskId: taskId }
        })

        if (!commitment) {
          return NextResponse.json(
            { code: 404, error: '找不到对应的承诺' },
            { status: 404 }
          )
        }

        const result = await sdk.verifyCommitment({
          commitmentId: commitment.id,
          verifierId: userId,
          fulfilled: fulfilled === true,
          comment
        })

        return NextResponse.json({
          code: 0,
          data: result
        })
      }

      default:
        return NextResponse.json(
          { code: 400, error: 'Invalid action' },
          { status: 400 }
        )
    }
  } catch (error: any) {
    console.error('ToWow sync error:', error)
    return NextResponse.json(
      { code: 500, error: error.message },
      { status: 500 }
    )
  }
}
