import { NextResponse } from 'next/server'
n// Force dynamic rendering
export const dynamic = 'force-dynamic'

import { buildAuthUrl, generateState } from '@/lib/auth'

export async function GET() {
  const state = generateState()
  const authUrl = buildAuthUrl(state)
  
  // 在实际生产中，应该将 state 存储到 session 或数据库中进行验证
  // 这里简化处理，直接跳转
  
  return NextResponse.redirect(authUrl)
}
