import { NextRequest, NextResponse } from 'next/server'
export const dynamic = 'force-dynamic'

import { getValidAccessToken, getUserInfo } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  const userId = request.cookies.get('session_user_id')?.value

  if (!userId) {
    return NextResponse.json({ error: '未登录' }, { status: 401 })
  }

  try {
    // 从数据库获取用户信息
    const dbUser = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        avatarUrl: true,
        secondmeUserId: true,
        createdAt: true,
      },
    })

    if (!dbUser) {
      return NextResponse.json({ error: '用户不存在' }, { status: 404 })
    }

    // 尝试从 SecondMe 获取最新信息，如果失败则使用数据库信息
    try {
      const accessToken = await getValidAccessToken(userId)
      const userInfo = await getUserInfo(accessToken)
      
      return NextResponse.json({
        code: 0,
        data: {
          ...userInfo,
          ...dbUser,
        },
      })
    } catch (authError) {
      // SecondMe API 调用失败，返回数据库中的信息
      console.log('SecondMe API 调用失败，使用数据库信息:', authError)
      return NextResponse.json({
        code: 0,
        data: dbUser,
      })
    }
  } catch (error) {
    console.error('Get user info error:', error)
    return NextResponse.json({ error: '获取用户信息失败' }, { status: 500 })
  }
}
