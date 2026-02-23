/**
n// Force dynamic rendering
export const dynamic = 'force-dynamic'

 * ToWow 任务同步 API
 * 
 * GET /api/towow/tasks - 获取 ToWow 任务列表
 * POST /api/towow/sync - 手动同步任务
 */

import { NextRequest, NextResponse } from 'next/server'
import { getTowowClient, isTowowEnabled } from '@/lib/towow'

/**
 * GET /api/towow/tasks
 * 获取 ToWow 任务列表
 */
export async function GET(request: NextRequest) {
  const userId = request.cookies.get('session_user_id')?.value

  if (!userId) {
    return NextResponse.json({ error: '未登录' }, { status: 401 })
  }

  if (!isTowowEnabled()) {
    return NextResponse.json({
      code: 0,
      data: {
        enabled: false,
        message: 'ToWow 集成未启用，请在 .env.local 中配置 TOWOW_ENABLED=true',
        tasks: []
      }
    })
  }

  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status') || undefined

    const towow = getTowowClient()
    const tasks = await towow.getTasks(status)

    return NextResponse.json({
      code: 0,
      data: {
        enabled: true,
        tasks
      }
    })
  } catch (error: any) {
    console.error('Get ToWow tasks error:', error)
    return NextResponse.json({
      code: 0,
      data: {
        enabled: true,
        error: error.message,
        tasks: []
      }
    })
  }
}
