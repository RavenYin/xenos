import { NextRequest, NextResponse } from 'next/server'
import { exchangeCodeForToken, getUserInfo } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const code = searchParams.get('code')
  const error = searchParams.get('error')

  if (error) {
    return NextResponse.redirect(new URL(`/?error=${error}`, request.url))
  }

  if (!code) {
    return NextResponse.redirect(new URL('/?error=no_code', request.url))
  }

  try {
    // 用授权码换取 token
    const tokens = await exchangeCodeForToken(code)
    
    // 获取用户信息
    const userInfo = await getUserInfo(tokens.accessToken)
    
    // 调试日志：记录返回的用户信息
    console.log('SecondMe UserInfo received:', JSON.stringify(userInfo, null, 2))
    
    // 验证用户信息并确定用户标识
    let userIdentifier, userIdentifierField;
    
    // 首先尝试使用标准ID字段
    const standardIdFields = ['id', 'userId', 'sub', 'uid', 'userIdStr', 'openid'] as const;
    for (const field of standardIdFields) {
      if ((userInfo as any)[field]) {
        userIdentifier = (userInfo as any)[field];
        userIdentifierField = field;
        break;
      }
    }
    
    // 如果没有标准ID字段，使用email作为标识
    if (!userIdentifier) {
      if (!(userInfo as any).email) {
        throw new Error(`用户信息中既没有ID字段也没有email字段: ${JSON.stringify(userInfo, null, 2)}`)
      }
      userIdentifier = (userInfo as any).email;
      userIdentifierField = 'email';
      console.log('⚠️ 警告: 使用email作为用户标识，建议联系SecondMe确认正确的用户ID字段');
    }
    
    // 计算 token 过期时间
    const tokenExpiresAt = new Date(Date.now() + tokens.expiresIn * 1000)
    
    // 保存或更新用户到数据库
    const user = await prisma.user.upsert({
      where: { 
        secondmeUserId: userIdentifier 
      },
      update: {
        email: userInfo.email,
        name: userInfo.name,
        avatarUrl: userInfo.avatarUrl,
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
        tokenExpiresAt: tokenExpiresAt,
      },
      create: {
        secondmeUserId: userIdentifier,
        email: userInfo.email,
        name: userInfo.name,
        avatarUrl: userInfo.avatarUrl,
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
        tokenExpiresAt: tokenExpiresAt,
      },
    })
    
    // 记录成功信息
    console.log(`✅ User ${userIdentifier} (from field: ${userIdentifierField}) successfully authenticated and saved to database`)

    // 创建简单的 session cookie
    const response = NextResponse.redirect(new URL('/dashboard', request.url))
    response.cookies.set('session_user_id', user.id, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 天
      path: '/',
    })

    return response
  } catch (err) {
    console.error('OAuth callback error:', err)
    console.error('Error details:', {
      message: err instanceof Error ? err.message : String(err),
      stack: err instanceof Error ? err.stack : undefined,
      code: err instanceof Error ? (err as any).code : undefined
    })
    
    // 如果是特定的用户ID错误，提供更具体的错误信息
    if (err instanceof Error && err.message.includes('用户ID获取失败')) {
      return NextResponse.redirect(new URL(`/?error=invalid_user_data&message=${encodeURIComponent(err.message)}`, request.url))
    }
    
    return NextResponse.redirect(new URL('/?error=auth_failed', request.url))
  }
}
