/**
export const dynamic = 'force-dynamic'

 * ToWow Webhook 接收端点
 * 
 * ToWow 平台在以下事件时调用此接口：
 * - task.accepted: 任务被接受，创建承诺
 * - task.verified: 任务验收完成，更新承诺状态
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getVCA_SDK } from '@/lib/vca-sdk'

/**
 * POST /api/towow/webhook
 * 
 * 接收 ToWow 的 Webhook 事件
 * 
 * Headers:
 *   X-Towow-Signature: HMAC 签名（MVP阶段暂不验证）
 * 
 * Body:
 *   {
 *     "event": "task.accepted" | "task.verified",
 *     "timestamp": "2026-02-20T08:00:00Z",
 *     "data": { ... }
 *   }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { event, timestamp, data } = body

    console.log(`[ToWow Webhook] Received event: ${event}`)

    // 验证事件类型
    if (!event) {
      return NextResponse.json(
        { code: 400, error: 'Missing event type' },
        { status: 400 }
      )
    }

    const sdk = getVCA_SDK()

    switch (event) {
      case 'task.accepted': {
        // 任务被接受，创建承诺
        const { taskId, task, assignee, publisher } = data

        // 创建承诺
        const commitment = await sdk.createCommitment({
          promiserId: assignee.secondmeId || assignee.userId,
          delegatorId: publisher.secondmeId || publisher.userId,
          task: task.title || task.description,
          deadline: task.deadline,
          context: 'towow',
          externalId: taskId
        })

        console.log(`[ToWow Webhook] Created commitment: ${commitment.id}`)

        return NextResponse.json({
          code: 0,
          data: { commitmentId: commitment.id }
        })
      }

      case 'task.verified': {
        // 任务验收，更新承诺状态
        const { taskId, result, verifier, comment } = data

        // 查找对应的承诺
        const commitment = await prisma.commitment.findFirst({
          where: { towowTaskId: taskId }
        })

        if (!commitment) {
          return NextResponse.json(
            { code: 404, error: 'Commitment not found for this task' },
            { status: 404 }
          )
        }

        // 添加验收证明
        await sdk.verifyCommitment({
          commitmentId: commitment.id,
          verifierId: verifier.secondmeId || verifier.userId,
          fulfilled: result === 'approved',
          comment: comment
        })

        console.log(`[ToWow Webhook] Verified commitment: ${commitment.id}, result: ${result}`)

        return NextResponse.json({
          code: 0,
          data: { 
            commitmentId: commitment.id,
            status: result === 'approved' ? 'FULFILLED' : 'FAILED'
          }
        })
      }

      case 'task.created': {
        // 任务创建（可选：同步到本地）
        console.log(`[ToWow Webhook] Task created: ${data.taskId}`)
        return NextResponse.json({ code: 0, data: { received: true } })
      }

      case 'task.cancelled': {
        // 任务取消
        const { taskId } = data
        const commitment = await prisma.commitment.findFirst({
          where: { towowTaskId: taskId }
        })

        if (commitment) {
          await prisma.commitment.update({
            where: { id: commitment.id },
            data: { status: 'CANCELLED' }
          })
        }

        return NextResponse.json({ code: 0, data: { cancelled: true } })
      }

      default:
        console.log(`[ToWow Webhook] Unknown event: ${event}`)
        return NextResponse.json(
          { code: 400, error: `Unknown event type: ${event}` },
          { status: 400 }
        )
    }
  } catch (error: any) {
    console.error('[ToWow Webhook] Error:', error)
    return NextResponse.json(
      { code: 500, error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * GET /api/towow/webhook
 * 用于验证 Webhook 端点是否可用
 */
export async function GET() {
  return NextResponse.json({
    code: 0,
    data: {
      service: 'Xenos VCA Webhook',
      version: '1.0.0',
      events: ['task.accepted', 'task.verified', 'task.created', 'task.cancelled']
    }
  })
}
