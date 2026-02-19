import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  const response = NextResponse.json({ success: true })
  
  // 清除 session cookie
  response.cookies.delete('session_user_id')
  
  return response
}
