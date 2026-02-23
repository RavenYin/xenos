import { NextRequest, NextResponse } from 'next/server'
export const dynamic = 'force-dynamic'

import { getValidAccessToken } from '@/lib/auth'
import { getUserShades } from '@/lib/secondme'

export async function GET(request: NextRequest) {
  const userId = request.cookies.get('session_user_id')?.value

  if (!userId) {
    return NextResponse.json({ error: '未登录' }, { status: 401 })
  }

  try {
    const accessToken = await getValidAccessToken(userId)
    const shades = await getUserShades(accessToken)
    
    return NextResponse.json({
      code: 0,
      data: { shades },
    })
  } catch (error) {
    console.error('Get shades error:', error)
    return NextResponse.json({ error: '获取兴趣标签失败' }, { status: 500 })
  }
}
