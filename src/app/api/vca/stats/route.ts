import { NextRequest, NextResponse } from 'next/server'
n// Force dynamic rendering
export const dynamic = 'force-dynamic'

import { getUserReputation } from '@/lib/reputation'

export async function GET(request: NextRequest) {
  const userId = request.cookies.get('session_user_id')?.value

  if (!userId) {
    return NextResponse.json({ code: 1, error: '未登录' }, { status: 401 })
  }

  try {
    const reputation = await getUserReputation(userId)
    return NextResponse.json({ code: 0, data: reputation })
  } catch (error) {
    console.error('Get VCA stats error:', error)
    return NextResponse.json({ code: 1, error: '获取统计数据失败' }, { status: 500 })
  }
}