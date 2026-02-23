import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'



export async function GET(request: NextRequest) {
  const userId = request.cookies.get('session_user_id')?.value

  if (!userId) {
    return NextResponse.json({ code: 1, error: '未登录' }, { status: 401 })
  }

  try {
    const { searchParams } = new URL(request.url)
    const commitmentId = searchParams.get('commitmentId')
    const limit = parseInt(searchParams.get('limit') || '20')
    const offset = parseInt(searchParams.get('offset') || '0')

    const where: any = {}
    if (commitmentId) where.commitmentId = commitmentId

    // 获取用户相关证明（发出的或收到的承诺的证明）
    const attestations = await prisma.attestation.findMany({
      where: {
        ...where,
        OR: [
          { attesterId: userId },
          { commitment: { promiserId: userId } },
          { commitment: { receiverId: userId } }
        ]
      },
      include: {
        attester: {
          select: { id: true, name: true, avatarUrl: true }
        },
        commitment: {
          select: {
            id: true,
            task: true,
            context: true,
            status: true,
            promiser: { select: { id: true, name: true } },
            receiver: { select: { id: true, name: true } }
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: offset
    })

    const total = await prisma.attestation.count({
      where: {
        ...where,
        OR: [
          { attesterId: userId },
          { commitment: { promiserId: userId } },
          { commitment: { receiverId: userId } }
        ]
      }
    })

    return NextResponse.json({
      code: 0,
      data: {
        attestations,
        pagination: {
          total,
          limit,
          offset,
          hasMore: offset + limit < total
        }
      }
    })
  } catch (error) {
    console.error('Get attestations error:', error)
    return NextResponse.json({ code: 1, error: '获取证明列表失败' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  const userId = request.cookies.get('session_user_id')?.value

  if (!userId) {
    return NextResponse.json({ code: 1, error: '未登录' }, { status: 401 })
  }

  try {
    const { commitmentId, fulfilled, evidence, comment, receiverId } = await request.json()

    if (!commitmentId) {
      return NextResponse.json({ code: 1, error: '缺少承诺ID' }, { status: 400 })
    }

    // 检查承诺是否存在
    const commitment = await prisma.commitment.findUnique({
      where: { id: commitmentId }
    })

    if (!commitment) {
      return NextResponse.json({ code: 1, error: '承诺不存在' }, { status: 404 })
    }

    // 创建履约证明
    const attestation = await prisma.attestation.create({
      data: {
        commitmentId,
        attesterId: userId,
        receiverId: receiverId || null,
        fulfilled: fulfilled === true,
        evidence,
        comment
      },
      include: {
        attester: {
          select: { id: true, name: true, avatarUrl: true }
        },
        commitment: {
          select: { id: true, task: true, status: true }
        }
      }
    })

    // 记录审计日志
    await prisma.auditLog.create({
      data: {
        action: 'create_attestation',
        actorId: userId,
        targetType: 'attestation',
        targetId: attestation.id,
        payload: JSON.stringify({
          commitmentId,
          fulfilled,
          evidence,
          comment
        })
      }
    })

    // 如果证明履约成功，更新承诺状态
    if (fulfilled && commitment.status === 'PENDING') {
      // 检查是否有多个证明（可选：需要多人确认）
      const fulfillCount = await prisma.attestation.count({
        where: { commitmentId, fulfilled: true }
      })

      if (fulfillCount >= 1) {
        await prisma.commitment.update({
          where: { id: commitmentId },
          data: { status: 'FULFILLED' }
        })

        // 记录状态变更
        await prisma.auditLog.create({
          data: {
            action: 'fulfill_commitment',
            actorId: userId,
            targetType: 'commitment',
            targetId: commitmentId,
            payload: JSON.stringify({ previousStatus: 'PENDING', newStatus: 'FULFILLED' })
          }
        })
      }
    }

    return NextResponse.json({
      code: 0,
      data: attestation
    })
  } catch (error) {
    console.error('Create attestation error:', error)
    return NextResponse.json({ code: 1, error: '创建证明失败' }, { status: 500 })
  }
}
