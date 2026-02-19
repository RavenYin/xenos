import { NextRequest } from 'next/server'
import { getValidAccessToken } from '@/lib/auth'

const API_BASE_URL = process.env.SECONDME_API_BASE_URL || 'https://app.mindos.com/gate/lab'

export async function POST(request: NextRequest) {
  const userId = request.cookies.get('session_user_id')?.value

  if (!userId) {
    return new Response(JSON.stringify({ error: '未登录' }), { 
      status: 401,
      headers: { 'Content-Type': 'application/json' }
    })
  }

  try {
    const accessToken = await getValidAccessToken(userId)
    const { message, sessionId } = await request.json()
    
    if (!message) {
      return new Response(JSON.stringify({ error: '消息不能为空' }), { 
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    // 代理请求到 SecondMe API
    const response = await fetch(`${API_BASE_URL}/api/secondme/chat/stream`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message,
        sessionId,
      }),
    })

    // 流式响应
    return new Response(response.body, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    })
  } catch (error) {
    console.error('Chat error:', error)
    return new Response(JSON.stringify({ error: '聊天失败' }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    })
  }
}
