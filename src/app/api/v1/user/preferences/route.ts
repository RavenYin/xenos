/**
 * 用户偏好设置 API
 * PUT /api/v1/user/preferences
 * GET /api/v1/user/preferences
 */

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma'
import { unifiedCache, CacheKeys, CacheTTL } from '@/lib/redis-cache'

// GET - 获取用户偏好设置
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
    const cacheKey = CacheKeys.agentProfile(userId)

    // 尝试从缓存获取
    const cached = await unifiedCache.get(cacheKey)
    if (cached) {
      return NextResponse.json({ code: 0, data: cached })
    }

    // 从数据库获取用户偏好
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        did: true,
        name: true,
        profileText: true,
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
    const session = await getServerSession()
    if (!session?.user?.id) {
      return NextResponse.json(
        { code: 401, error: '未授权' },
        { status: 401 }
      )
    }

    const userId = session.user.id
    const body = await request.json()

    // 验证输入
    const { preferences } = body
    if (!preferences) {
      return NextResponse.json(
        { code: 400, error: '缺少偏好设置数据' },
        { status: 400 }
      )
    }

    // 更新用户资料（存储在 profileText 中作为 JSON）
    // 注意：实际生产环境应该有独立的 preferences 表
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        profileText: JSON.stringify(preferences),
        updatedAt: new Date(),
      },
    })

    // 清除缓存
    const cacheKey = CacheKeys.agentProfile(userId)
    await unifiedCache.delete(cacheKey)

    return NextResponse.json({
      code: 0,
      data: {
        userId,
        preferences,
        updatedAt: updatedUser.updatedAt.toISOString(),
      },
    })
  } catch (error) {
    console.error('[API] Update preferences error:', error)
    return NextResponse.json(
      { code: 500, error: '服务器错误' },
      { status: 500 }
    )
  }
}
