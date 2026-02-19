import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  const userId = request.cookies.get('session_user_id')?.value

  if (!userId) {
    return NextResponse.json({ error: '未登录' }, { status: 401 })
  }

  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const context = searchParams.get('context')
    const limit = parseInt(searchParams.get('limit') || '20')
    const offset = parseInt(searchParams.get('offset') || '0')

    const where: any = {}
    if (status) where.status = status
    if (context) where.context = context

    const [commitments, totalCount] = await Promise.all([
      prisma.commitment.findMany({
        where,
        include: {
          promiser: {
            select: { id: true, name: true, avatarUrl: true }
          },
          receiver: {
            select: { id: true, name: true, avatarUrl: true }
          },
          attestations: {
            include: {
              attester: {
                select: { id: true, name: true, avatarUrl: true }
              }
            },
            orderBy: { createdAt: 'desc' }
          }
        },
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: offset
      }),
      prisma.commitment.count({ where })
    ])

    return NextResponse.json({
      code: 0,
      data: {
        commitments,
        pagination: {
          total: totalCount,
          limit,
          offset,
          hasMore: offset + limit < totalCount
        }
      }
    })
  } catch (error) {
    console.error('Get commitments error:', error)
    return NextResponse.json({ error: '获取承诺列表失败' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  const userId = request.cookies.get('session_user_id')?.value

  if (!userId) {
    return NextResponse.json({ error: '未登录' }, { status: 401 })
  }

  try {
    const { receiverId, context, task, deadline } = await request.json()

    // 基本验证
    if (!context || !task) {
      return NextResponse.json({ error: '上下文和任务描述不能为空' }, { status: 400 })
    }

    // 创建承诺
    const commitment = await prisma.commitment.create({
      data: {
        promiserId: userId,
        receiverId,
        context,
        task,
        deadline: deadline ? new Date(deadline) : null,
      },
      include: {
        promiser: {
          select: { id: true, name: true, avatarUrl: true }
        },
        receiver: receiverId ? {
          select: { id: true, name: true, avatarUrl: true }
        } : false
      }
    })

    // 记录审计日志
    await prisma.auditLog.create({
      data: {
        action: 'create_commitment',
        actorId: userId,
        targetType: 'commitment',
        targetId: commitment.id,
        payload: {
          context,
          task,
          deadline,
          receiverId
        }
      }
    })

    return NextResponse.json({
      code: 0,
      data: commitment
    })
  } catch (error) {
    console.error('Create commitment error:', error)
    return NextResponse.json({ error: '创建承诺失败' }, { status: 500 })
  }
}