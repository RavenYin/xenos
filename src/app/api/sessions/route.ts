import { NextRequest, NextResponse } from 'next/server'
n// Force dynamic rendering
export const dynamic = 'force-dynamic'

import { getValidAccessToken } from '@/lib/auth'
import { getChatSessions } from '@/lib/secondme'

export async function GET(request: NextRequest) {
  const userId = request.cookies.get('session_user_id')?.value

  if (!userId) {
    return NextResponse.json({ error: '未登录' }, { status: 401 })
  }

  try {
    const accessToken = await getValidAccessToken(userId)
    const sessions = await getChatSessions(accessToken)
    
    return NextResponse.json({
      code: 0,
      data: { sessions },
    })
  } catch (error) {
    console.error('Get sessions error:', error)
    return NextResponse.json({ error: '获取会话列表失败' }, { status: 500 })
  }
}
