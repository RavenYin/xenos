import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const userId = request.cookies.get('session_user_id')?.value

    if (!userId) {
      return NextResponse.json({ code: 1, error: '未登录' }, { status: 401 })
    }

    // 获取用户信誉信息
    const reputation = await prisma.$queryRaw`
      SELECT 
        level,
        score,
        trust_points,
        rank,
        stats
      FROM "reputations"
      WHERE user_id = ${userId}
    ` as any[]

    if (!reputation || reputation.length === 0) {
      // 如果用户没有信誉记录，创建默认记录
      const defaultReputation = await prisma.$queryRaw`
        INSERT INTO "reputations" (
          user_id, level, score, trust_points, rank, stats, updated_at
        ) VALUES (
          ${userId}, 'beginner', 0.0, 0, 0, '{}', datetime('now')
        )
        RETURNING level, score, trust_points, rank, stats
      ` as any[]

      return NextResponse.json({
        code: 0,
        data: {
          level: defaultReputation[0].level,
          score: parseFloat(defaultReputation[0].score),
          trustPoints: parseInt(defaultReputation[0].trust_points),
          rank: parseInt(defaultReputation[0].rank),
          stats: JSON.parse(defaultReputation[0].stats || '{}')
        }
      })
    }

    const rep = reputation[0]
    return NextResponse.json({
      code: 0,
      data: {
        level: rep.level,
        score: parseFloat(rep.score),
        trustPoints: parseInt(rep.trust_points),
        rank: parseInt(rep.rank),
        stats: JSON.parse(rep.stats || '{}')
      }
    })
  } catch (error) {
    console.error('Get reputation error:', error)
    return NextResponse.json({ code: 1, error: '获取信誉信息失败' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const userId = request.cookies.get('session_user_id')?.value

    if (!userId) {
      return NextResponse.json({ code: 1, error: '未登录' }, { status: 401 })
    }

    const body = await request.json()
    const { action, targetId, promiseId, score, reason } = body

    if (!action || !targetId || !promiseId || score === undefined) {
      return NextResponse.json({ code: 1, error: '缺少必要参数' }, { status: 400 })
    }

    // 检查目标用户是否存在
    const targetUser = await prisma.$queryRaw`
      SELECT 1 FROM "users" WHERE id = ${targetId}
    ` as any[]

    if (!targetUser || targetUser.length === 0) {
      return NextResponse.json({ code: 1, error: '目标用户不存在' }, { status: 404 })
    }

    // 检查承诺是否存在
    const promise = await prisma.$queryRaw`
      SELECT 1 FROM "promises" WHERE id = ${promiseId}
    ` as any[]

    if (!promise || promise.length === 0) {
      return NextResponse.json({ code: 1, error: '承诺不存在' }, { status: 404 })
    }

    // 记录信誉操作
    const operation = await prisma.$queryRaw`
      INSERT INTO "attestations" (
        promise_id, attester_id, target_id, type, content, score, confidence, tags, created_at, updated_at
      ) VALUES (
        ${promiseId}, ${userId}, ${targetId}, 'evaluation', ${reason || '信誉评分'}, ${score}, 1.0, '["reputation"]', datetime('now'), datetime('now')
      )
      RETURNING id
    ` as any[]

    // 更新目标用户的信誉分数
    const scoreChange = Math.max(-10, Math.min(10, score)) // 限制在 -10 到 +10 之间
    await prisma.$queryRaw`
      UPDATE "reputations"
      SET 
        score = score + ${scoreChange * 0.1}, -- 每次评分影响 0.1 分
        trust_points = trust_points + ${scoreChange > 0 ? 1 : -1},
        updated_at = datetime('now')
      WHERE user_id = ${targetId}
    ` as any[]

    return NextResponse.json({
      code: 0,
      data: {
        operationId: operation[0].id,
        scoreChange: scoreChange * 0.1,
        totalImpact: scoreChange
      }
    })
  } catch (error) {
    console.error('Update reputation error:', error)
    return NextResponse.json({ code: 1, error: '更新信誉失败' }, { status: 500 })
  }
}