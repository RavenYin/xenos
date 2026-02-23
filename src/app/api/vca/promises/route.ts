import { NextRequest, NextResponse } from 'next/server'
export const dynamic = 'force-dynamic'

import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const userId = request.cookies.get('session_user_id')?.value

    if (!userId) {
      return NextResponse.json({ code: 1, error: '未登录' }, { status: 401 })
    }

    const url = new URL(request.url)
    const page = parseInt(url.searchParams.get('page') || '1')
    const limit = parseInt(url.searchParams.get('limit') || '10')

    const skip = (page - 1) * limit

    // 获取用户的承诺
    const promises = await prisma.$queryRaw`
      SELECT p.*, 
             (SELECT COUNT(*) FROM "attestations" a WHERE a.promise_id = p.id) as attestations_count
      FROM "promises" p 
      WHERE p.user_id = ${userId}
      ORDER BY p.created_at DESC 
      LIMIT ${limit} OFFSET ${skip}
    ` as any[]

    const total = await prisma.$queryRaw`
      SELECT COUNT(*) as total FROM "promises" WHERE user_id = ${userId}
    ` as any[]

    return NextResponse.json({
      code: 0,
      data: {
        promises,
        pagination: {
          page,
          limit,
          total: total[0]?.['COUNT(*)'] || 0,
          pages: Math.ceil((total[0]?.['COUNT(*)'] || 0) / limit)
        }
      }
    })
  } catch (error) {
    console.error('Get promises error:', error)
    return NextResponse.json({ code: 1, error: '获取承诺列表失败' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const userId = request.cookies.get('session_user_id')?.value

    if (!userId) {
      return NextResponse.json({ code: 1, error: '未登录' }, { status: 401 })
    }

    const body = await request.json()
    const { title, description, context = '{}', category = 'personal', priority = 3, estimatedDays } = body

    if (!title || !description) {
      return NextResponse.json({ code: 1, error: '标题和描述不能为空' }, { status: 400 })
    }

    const result = await prisma.$queryRaw`
      INSERT INTO "promises" (
        user_id, title, description, context, category, priority, estimated_days, created_at, updated_at
      ) VALUES (
        ${userId}, ${title}, ${description}, ${context}, ${category}, ${priority}, ${estimatedDays}, datetime('now'), datetime('now')
      )
      RETURNING id, title, description, category, status, priority, created_at
    ` as any[]

    return NextResponse.json({
      code: 0,
      data: {
        id: result[0].id,
        title: result[0].title,
        description: result[0].description,
        category: result[0].category,
        status: result[0].status,
        priority: result[0].priority,
        createdAt: result[0].created_at
      }
    })
  } catch (error) {
    console.error('Create promise error:', error)
    return NextResponse.json({ code: 1, error: '创建承诺失败' }, { status: 500 })
  }
}