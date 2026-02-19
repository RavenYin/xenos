import { NextRequest, NextResponse } from 'next/server'
import { getValidAccessToken, getUserInfo } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  const userId = request.cookies.get('session_user_id')?.value

  if (!userId) {
    return NextResponse.json({ error: '未登录' }, { status: 401 })
  }

  try {
    const accessToken = await getValidAccessToken(userId)
    const userInfo = await getUserInfo(accessToken)
    
    // 同时从数据库获取最新信息
    const dbUser = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        avatarUrl: true,
        createdAt: true,
      },
    })

    return NextResponse.json({
      code: 0,
      data: {
        ...userInfo,
        ...dbUser,
      },
    })
  } catch (error) {
    console.error('Get user info error:', error)
    return NextResponse.json({ error: '获取用户信息失败' }, { status: 500 })
  }
}
