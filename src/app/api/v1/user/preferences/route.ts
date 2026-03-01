/**
 * 用户偏好设置 API
 * PUT /api/v1/user/preferences
 * GET /api/v1/user/preferences
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { unifiedCache, CacheKeys, CacheTTL } from '@/lib/redis-cache'

// 从 cookie 获取当前用户 ID
function getUserIdFromRequest(request: NextRequest): string | null {
  return request.cookies.get('session_user_id')?.value || null
}

// GET - 获取用户偏好设置
export async function GET(request: NextRequest) {
  try {
    const userId = getUserIdFromRequest(request)
    if (!userId) {
      return NextResponse.json(
        { code: 401, error: '未授权' },
        { status: 401 }
      )
    }
    const cacheKey = CacheKeys.agentProfile(userId)

    // 尝试从缓存获取
    const cached = await unifiedCache.get(cacheKey)
    if (cached) {
      return NextResponse.json({ code: 0, data: cached })
    }

    // 从数据库获取用户信息
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        did: true,
        name: true,
        createdAt: true,
      },
    })

    if (!user) {
      return NextResponse.json(
        { code: 404, error: '用户不存在' },
        { status: 404 }
      )
    }

    // 获取或创建默认偏好
    const preferences = {
      notifications: {
        email: true,
        push: false,
        digest: 'daily' as const,
      },
      privacy: {
        profileVisibility: 'public' as const,
        showReputation: true,
        showActivity: false,
      },
      agentSettings: {
        autoAcceptCommitments: false,
        trustedAgents: [],
        blockedAgents: [],
        preferredContexts: [],
      },
    }

    const result = {
      userId: user.id,
      did: user.did,
      preferences,
      updatedAt: new Date().toISOString(),
    }

    // 缓存结果
    await unifiedCache.set(cacheKey, result, CacheTTL.USER_DATA)

    return NextResponse.json({ code: 0, data: result })
  } catch (error) {
    console.error('[API] Get preferences error:', error)
    return NextResponse.json(
      { code: 500, error: '服务器错误' },
      { status: 500 }
    )
  }
}

// PUT - 更新用户偏好设置
export async function PUT(request: NextRequest) {
  try {
    const userId = getUserIdFromRequest(request)
    if (!userId) {
      return NextResponse.json(
        { code: 401, error: '未授权' },
        { status: 401 }
      )
    }
    const body = await request.json()

    // 验证输入
    const { preferences } = body
    if (!preferences) {
      return NextResponse.json(
        { code: 400, error: '缺少偏好设置数据' },
        { status: 400 }
      )
    }

    // 注意：当前实现仅返回成功响应
    // 实际生产环境建议添加独立的 preferences 表来持久化存储
    // 这里暂时不更新数据库，仅更新缓存

    const cacheKey = CacheKeys.agentProfile(userId)

    // 更新缓存
    const result = {
      userId,
      preferences,
      updatedAt: new Date().toISOString(),
    }
    await unifiedCache.set(cacheKey, result, CacheTTL.USER_DATA)

    return NextResponse.json({
      code: 0,
      data: result,
    })
  } catch (error) {
    console.error('[API] Update preferences error:', error)
    return NextResponse.json(
      { code: 500, error: '服务器错误' },
      { status: 500 }
    )
  }
}
