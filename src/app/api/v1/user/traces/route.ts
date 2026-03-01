/**
 * 用户痕迹记录 API
 * POST /api/v1/user/traces - 上传痕迹
 * GET /api/v1/user/traces - 获取痕迹列表
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { unifiedCache, CacheKeys, CacheTTL } from '@/lib/redis-cache'

// 从 cookie 获取当前用户 ID
function getUserIdFromRequest(request: NextRequest): string | null {
  return request.cookies.get('session_user_id')?.value || null
}

// 痕迹类型定义
interface TraceInput {
  action: string
  result: 'success' | 'failed' | 'pending'
  metadata?: Record<string, any>
  timestamp?: string
}

// GET - 获取用户痕迹列表
export async function GET(request: NextRequest) {
  try {
    const userId = getUserIdFromRequest(request)
    if (!userId) {
      return NextResponse.json(
        { code: 401, error: '未授权' },
        { status: 401 }
      )
    }
    const { searchParams } = new URL(request.url)
    const action = searchParams.get('action')
    const limit = parseInt(searchParams.get('limit') || '50')

    // 构建缓存键
    const cacheKey = CacheKeys.traceList(userId, action || undefined)

    // 尝试从缓存获取
    const cached = await unifiedCache.get(cacheKey)
    if (cached) {
      return NextResponse.json({ code: 0, data: cached })
    }

    // 从数据库查询审计日志作为痕迹记录
    const logs = await prisma.auditLog.findMany({
      where: {
        actorId: userId,
        ...(action && { action: { contains: action } }),
      },
      orderBy: { timestamp: 'desc' },
      take: limit,
    })

    // 解析 payload JSON
    const traces = logs.map(log => {
      let payload: any = {}
      try {
        payload = log.payload ? JSON.parse(log.payload) : {}
      } catch {
        payload = {}
      }

      return {
        id: log.id,
        action: log.action,
        result: payload.result || 'success',
        timestamp: log.timestamp.toISOString(),
        metadata: payload,
        targetType: log.targetType,
        targetId: log.targetId,
      }
    })

    const result = {
      traces,
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
    const userId = getUserIdFromRequest(request)
    if (!userId) {
      return NextResponse.json(
        { code: 401, error: '未授权' },
        { status: 401 }
      )
    }
    const body: TraceInput = await request.json()

    // 验证输入
    if (!body.action) {
      return NextResponse.json(
        { code: 400, error: '缺少必要字段 action' },
        { status: 400 }
      )
    }

    // 记录到审计日志
    const payload = {
      result: body.result || 'success',
      metadata: body.metadata,
      clientTimestamp: body.timestamp,
    }

    const log = await prisma.auditLog.create({
      data: {
        actorId: userId,
        action: body.action,
        targetType: 'trace',
        targetId: userId,
        payload: JSON.stringify(payload),
      },
    })

    // 清除相关缓存
    const cacheKey = CacheKeys.traceList(userId)
    await unifiedCache.delete(cacheKey)

    return NextResponse.json({
      code: 0,
      data: {
        traceId: log.id,
        recorded: true,
        timestamp: log.timestamp.toISOString(),
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
