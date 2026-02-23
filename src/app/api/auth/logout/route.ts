import { NextRequest, NextResponse } from 'next/server'
n// Force dynamic rendering
export const dynamic = 'force-dynamic'


export async function POST(request: NextRequest) {
  const response = NextResponse.json({ success: true })
  
  // 清除 session cookie
  response.cookies.delete('session_user_id')
  
  return response
}
