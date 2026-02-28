/**
 * 用户痕迹记录 API
 * POST /api/v1/user/traces - 上传痕迹
 * GET /api/v1/user/traces - 获取痕迹列表
 */

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma'
import { unifiedCache, CacheKeys, CacheTTL } from '@/lib/redis-cache'

// 痕迹类型定义
interface TraceInput {
  userId: string
  action: string
  context: string
  result: 'success' | 'failed' | 'pending'
  metadata?: Record<string, any>
  timestamp?: string
}

// GET - 获取用户痕迹列表
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession()
    if (!session?.user?.id) {
      return NextResponse.json(
        { code: 401, error: '未授权' },
        { status: 401 }
      )
    }

    const userId = session.user.id
    const { searchParams } = new URL(request.url)
    const context = searchParams.get('context')
    const limit = parseInt(searchParams.get('limit') || '50')

    // 构建缓存键
    const cacheKey = CacheKeys.traceList(userId, context || undefined)

    // 尝试从缓存获取
    const cached = await unifiedCache.get(cacheKey)
    if (cached) {
      return NextResponse.json({ code: 0, data: cached })
    }

    // 从数据库查询痕迹
    // 使用 AuditLog 作为痕迹存储
    const traces = await prisma.auditLog.findMany({
      where: {
        userId,
        ...(context && { action: { contains: context } }),
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
    })

    const result = {
      traces: traces.map(t => ({
        id: t.id,
        action: t.action,
        context: t.resource || 'unknown',
        result: t.details?.result || 'success',
        timestamp: t.createdAt.toISOString(),
        metadata: t.details,
      })),
      total: traces.length,
      hasMore: traces.length === limit,
    }

    // 缓存结果
    await unifiedCache.set(cacheKey, result, CacheTTL.TRACE_LIST)

    return NextResponse.json({ code: 0, data: result })
  } catch (error) {
    console.error('[API] Get traces error:', error)
    return NextResponse.json(
      { code: 500, error: '服务器错误' },
      { status: 500 }
    )
  }
}

// POST - 上传新痕迹
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession()
    if (!session?.user?.id) {
      return NextResponse.json(
        { code: 401, error: '未授权' },
        { status: 401 }
      )
    }

    const userId = session.user.id
    const body: TraceInput = await request.json()

    // 验证输入
    if (!body.action || !body.context) {
      return NextResponse.json(
        { code: 400, error: '缺少必要字段' },
        { status: 400 }
      )
    }

    // 记录到审计日志
    const trace = await prisma.auditLog.create({
      data: {
        userId,
        action: body.action,
        resource: body.context,
        details: {
          result: body.result,
          metadata: body.metadata,
          clientTimestamp: body.timestamp,
        },
      },
    })

    // 清除相关缓存
    const cacheKey = CacheKeys.traceList(userId)
    await unifiedCache.delete(cacheKey)

    return NextResponse.json({
      code: 0,
      data: {
        traceId: trace.id,
        recorded: true,
        timestamp: trace.createdAt.toISOString(),
      },
    })
  } catch (error) {
    console.error('[API] Create trace error:', error)
    return NextResponse.json(
      { code: 500, error: '服务器错误' },
      { status: 500 }
    )
  }
}
