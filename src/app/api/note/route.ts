import { NextRequest, NextResponse } from 'next/server'
import { getValidAccessToken } from '@/lib/auth'
import { addNote } from '@/lib/secondme'

export const dynamic = 'force-dynamic'



export async function POST(request: NextRequest) {
  const userId = request.cookies.get('session_user_id')?.value

  if (!userId) {
    return NextResponse.json({ error: '未登录' }, { status: 401 })
  }

  try {
    const { content } = await request.json()
    
    if (!content || typeof content !== 'string') {
      return NextResponse.json({ error: '笔记内容不能为空' }, { status: 400 })
    }

    const accessToken = await getValidAccessToken(userId)
    const noteId = await addNote(accessToken, content)
    
    return NextResponse.json({
      code: 0,
      data: { noteId },
    })
  } catch (error) {
    console.error('Add note error:', error)
    return NextResponse.json({ error: '添加笔记失败' }, { status: 500 })
  }
}
