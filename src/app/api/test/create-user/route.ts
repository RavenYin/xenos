/**
n// Force dynamic rendering
export const dynamic = 'force-dynamic'

 * 测试用户创建 API（仅用于测试环境）
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  // 仅在非生产环境允许
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json({ error: 'Not allowed in production' }, { status: 403 })
  }

  try {
    const { email, name } = await request.json()

    // 查找或创建测试用户
    let user = await prisma.user.findFirst({
      where: {
        OR: [
          { email },
          { secondmeUserId: 'test_user_001' }
        ]
      }
    })

    if (!user) {
      user = await prisma.user.create({
        data: {
          secondmeUserId: 'test_user_001',
          email: email || 'test@example.com',
          name: name || 'Test User',
          accessToken: `test_${Date.now()}`,
          refreshToken: `test_refresh_${Date.now()}`,
          tokenExpiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
        }
      })
    }

    return NextResponse.json({
      code: 0,
      data: {
        id: user.id,
        email: user.email,
        name: user.name
      }
    })
  } catch (error) {
    console.error('Create test user error:', error)
    return NextResponse.json({ error: 'Failed to create test user' }, { status: 500 })
  }
}
