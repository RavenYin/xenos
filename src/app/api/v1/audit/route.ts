import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

/**
 * GET /api/v1/audit
 * 查询审计日志
 * Query: actorId?, targetType?, targetId?, limit?, offset?
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const actorId = searchParams.get('actorId')
    const targetType = searchParams.get('targetType')
    const targetId = searchParams.get('targetId')
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')

    const where: any = {}
    if (actorId) where.actorId = actorId
    if (targetType) where.targetType = targetType
    if (targetId) where.targetId = targetId

    const logs = await prisma.auditLog.findMany({
      where,
      orderBy: { timestamp: 'desc' },
      take: limit,
      skip: offset
    })

    const total = await prisma.auditLog.count({ where })

    return NextResponse.json({
      code: 0,
      data: {
        logs: logs.map(log => ({
          id: log.id,
          action: log.action,
          actorId: log.actorId,
          targetType: log.targetType,
          targetId: log.targetId,
          payload: log.payload ? JSON.parse(log.payload) : null,
          timestamp: log.timestamp
        })),
        total,
        limit,
        offset
      }
    })
  } catch (error: any) {
    return NextResponse.json({ code: 500, error: error.message }, { status: 500 })
  }
}
