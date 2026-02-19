import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const userId = request.cookies.get('session_user_id')?.value

    if (!userId) {
      return NextResponse.json({ code: 1, error: '未登录' }, { status: 401 })
    }

    // 获取用户的所有承诺统计
    const stats = await prisma.$queryRaw`
      SELECT 
        COUNT(*) as total_promises,
        COUNT(CASE WHEN status = 'active' THEN 1 END) as active_promises,
        COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_promises,
        COUNT(CASE WHEN status = 'failed' THEN 1 END) as failed_promises,
        COUNT(DISTINCT promise_id) as total_attestations
      FROM "promises" p
      LEFT JOIN "attestations" a ON p.id = a.promise_id
      WHERE p.user_id = ${userId}
    ` as any[]

    // 获取信誉等级统计
    const reputation = await prisma.$queryRaw`
      SELECT 
        level,
        score,
        trust_points,
        rank
      FROM "reputations"
      WHERE user_id = ${userId}
    ` as any[]

    return NextResponse.json({
      code: 0,
      data: {
        promises: stats[0],
        reputation: reputation[0] || {
          level: 'beginner',
          score: 0.0,
          trust_points: 0,
          rank: 0
        }
      }
    })
  } catch (error) {
    console.error('Get VCA stats error:', error)
    return NextResponse.json({ code: 1, error: '获取统计数据失败' }, { status: 500 })
  }
}