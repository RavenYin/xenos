/**
 * 内部承诺 API（供 SecondMe 前端使用）
 * 
 * GET  /api/commitment - 获取承诺列表
 * POST /api/commitment - 创建承诺
 */

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
    const view = searchParams.get('view') || 'promiser' // promiser | delegator
    const limit = parseInt(searchParams.get('limit') || '20')
    const offset = parseInt(searchParams.get('offset') || '0')

    // 根据 view 决定查询条件
    const where: any = {}
    if (status) where.status = status
    if (context) where.context = context
    
    if (view === 'promiser') {
      where.promiserId = userId
    } else if (view === 'delegator') {
      where.receiverId = userId
    }

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

    // 创建承诺（委托方发起）
    // receiverId 传入的是指定的承诺方ID（如果有）
    // 当前用户是委托方，存储在 receiverId 字段（反向命名，需要修正 schema）
    // 临时方案：promiserId = 指定的承诺方（可以为空表示公开）
    //           receiverId 的实际含义需要重新理解
    
    // 正确的语义：
    // - promiserId: 承诺方（接任务的人）- 可空表示待接受
    // - receiverId: 委托方（发任务的人）- 当前用户
    
    // 但当前 schema 中 promiserId 是必填的，所以暂时用指定用户或创建占位用户
    
    let promiserId = receiverId // 如果指定了承诺方
    
    if (!promiserId) {
      // 没有指定承诺方，创建一个"待接受"占位
      // 查找或创建 "open" 用户作为占位
      let openUser = await prisma.user.findFirst({
        where: { secondmeUserId: 'open_for_acceptance' }
      })
      
      if (!openUser) {
        openUser = await prisma.user.create({
          data: {
            secondmeUserId: 'open_for_acceptance',
            name: '待接受',
            accessToken: `open_${Date.now()}`,
            refreshToken: `open_refresh_${Date.now()}`,
            tokenExpiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
          }
        })
      }
      promiserId = openUser.id
    }

    const commitment = await prisma.commitment.create({
      data: {
        promiserId,  // 承诺方（指定的或占位）
        receiverId: userId,  // 委托方 = 当前用户
        context,
        task,
        deadline: deadline ? new Date(deadline) : null,
        status: 'PENDING_ACCEPT',
        source: 'manual'
      },
      include: {
        promiser: {
          select: { id: true, name: true, avatarUrl: true }
        },
        receiver: {
          select: { id: true, name: true, avatarUrl: true }
        }
      }
    })

    // 记录审计日志
    await prisma.auditLog.create({
      data: {
        action: 'create_commitment',
        actorId: userId,
        targetType: 'commitment',
        targetId: commitment.id,
        payload: JSON.stringify({
          context,
          task,
          deadline,
          assignedPromiserId: receiverId
        })
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
