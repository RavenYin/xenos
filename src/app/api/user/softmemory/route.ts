import { NextRequest, NextResponse } from 'next/server'
import { getValidAccessToken } from '@/lib/auth'
import { getUserSoftMemory } from '@/lib/secondme'

export const dynamic = 'force-dynamic'



export async function GET(request: NextRequest) {
  const userId = request.cookies.get('session_user_id')?.value

  if (!userId) {
    return NextResponse.json({ error: '未登录' }, { status: 401 })
  }

  try {
    const accessToken = await getValidAccessToken(userId)
    const list = await getUserSoftMemory(accessToken)
    
    return NextResponse.json({
      code: 0,
      data: { list },
    })
  } catch (error) {
    console.error('Get soft memory error:', error)
    return NextResponse.json({ error: '获取软记忆失败' }, { status: 500 })
  }
}
