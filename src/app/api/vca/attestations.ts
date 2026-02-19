import { NextRequest, NextResponse } from 'next/server'
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
    const promiseId = url.searchParams.get('promise_id')

    const skip = (page - 1) * limit

    let where = `a.attester_id = ${userId} OR a.target_id = ${userId}`
    if (promiseId) {
      where += ` AND a.promise_id = ${promiseId}`
    }

    const attestations = await prisma.$queryRaw`
      SELECT 
        a.*, 
        p.title as promise_title,
        p.category as promise_category,
        CASE 
          WHEN a.attester_id = ${userId} THEN 'given'
          WHEN a.target_id = ${userId} THEN 'received'
        END as direction
      FROM "attestations" a
      JOIN "promises" p ON a.promise_id = p.id
      WHERE ${where}
      ORDER BY a.created_at DESC
      LIMIT ${limit} OFFSET ${skip}
    ` as any[]

    const total = await prisma.$queryRaw`
      SELECT COUNT(*) as total 
      FROM "attestations" a
      WHERE ${where}
    ` as any[]

    return NextResponse.json({
      code: 0,
      data: {
        attestations,
        pagination: {
          page,
          limit,
          total: total[0]?.['COUNT(*)'] || 0,
          pages: Math.ceil((total[0]?.['COUNT(*)'] || 0) / limit)
        }
      }
    })
  } catch (error) {
    console.error('Get attestations error:', error)
    return NextResponse.json({ code: 1, error: '获取证明列表失败' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const userId = request.cookies.get('session_user_id')?.value

    if (!userId) {
      return NextResponse.json({ code: 1, error: '未登录' }, { status: 401 })
    }

    const body = await request.json()
    const { promiseId, targetId, type = 'witness', content, score, confidence = 1.0, tags = '[]' } = body

    if (!promiseId || !targetId || !content) {
      return NextResponse.json({ code: 1, error: '缺少必要参数' }, { status: 400 })
    }

    // 检查承诺是否存在且属于当前用户
    const promiseCheck = await prisma.$queryRaw`
      SELECT 1 FROM "promises" WHERE id = ${promiseId} AND user_id = ${userId}
    ` as any[]

    if (!promiseCheck || promiseCheck.length === 0) {
      return NextResponse.json({ code: 1, error: '承诺不存在或无权限' }, { status: 403 })
    }

    const result = await prisma.$queryRaw`
      INSERT INTO "attestations" (
        promise_id, attester_id, target_id, type, content, score, confidence, tags, created_at, updated_at
      ) VALUES (
        ${promiseId}, ${userId}, ${targetId}, ${type}, ${content}, ${score}, ${confidence}, ${tags}, datetime('now'), datetime('now')
      )
      RETURNING id, type, content, score, confidence, verified, created_at
    ` as any[]

    return NextResponse.json({
      code: 0,
      data: {
        id: result[0].id,
        type: result[0].type,
        content: result[0].content,
        score: result[0].score,
        confidence: result[0].confidence,
        verified: result[0].verified,
        createdAt: result[0].created_at
      }
    })
  } catch (error) {
    console.error('Create attestation error:', error)
    return NextResponse.json({ code: 1, error: '创建证明失败' }, { status: 500 })
  }
}