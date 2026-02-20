/**
 * VCA SDK REST API - v1
 * 
 * 公开 API 端点，供 ToWow、客服系统等外部应用调用
 * 
 * POST /api/v1/commitment - 创建承诺（委托方发起）
 * GET  /api/v1/commitment - 获取承诺详情
 */

import { NextRequest, NextResponse } from 'next/server'
import { getVCA_SDK, CreateCommitmentParams } from '@/lib/vca-sdk'

/**
 * 验证 API Key
 */
function validateApiKey(request: NextRequest): boolean {
  const apiKey = request.headers.get('x-api-key') || 
                 request.headers.get('authorization')?.replace('Bearer ', '')
  
  // MVP 阶段：允许无 API Key 调用（生产环境需要验证）
  // TODO: 添加 API Key 验证
  return true
}

/**
 * POST /api/v1/commitment
 * 委托方发起承诺请求
 * 
 * Body:
 * {
 *   "promiserId": "user_123",     // 必填：承诺方 ID
 *   "delegatorId": "user_456",    // 必填：委托方 ID
 *   "task": "完成登录页面开发",    // 必填：任务描述
 *   "deadline": "2026-02-25T18:00:00Z",  // 可选：截止时间
 *   "context": "towow",           // 可选：来源上下文
 *   "externalId": "task_789"      // 可选：外部系统 ID
 * }
 */
export async function POST(request: NextRequest) {
  if (!validateApiKey(request)) {
    return NextResponse.json(
      { code: 401, error: 'Invalid API key' },
      { status: 401 }
    )
  }

  try {
    const body = await request.json()
    const { promiserId, delegatorId, task, deadline, context, externalId, metadata } = body

    // 参数验证
    if (!promiserId || !delegatorId || !task) {
      return NextResponse.json(
        { code: 400, error: 'Missing required fields: promiserId, delegatorId, task' },
        { status: 400 }
      )
    }

    const sdk = getVCA_SDK()
    const params: CreateCommitmentParams = {
      promiserId,
      delegatorId,
      task,
      deadline,
      context,
      externalId,
      metadata
    }

    const result = await sdk.createCommitment(params)

    return NextResponse.json({
      code: 0,
      data: result
    })
  } catch (error: any) {
    console.error('Create commitment error:', error)
    return NextResponse.json(
      { code: 500, error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * GET /api/v1/commitment?id=xxx
 * 获取承诺详情
 */
export async function GET(request: NextRequest) {
  if (!validateApiKey(request)) {
    return NextResponse.json(
      { code: 401, error: 'Invalid API key' },
      { status: 401 }
    )
  }

  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { code: 400, error: 'Missing commitment id' },
        { status: 400 }
      )
    }

    const sdk = getVCA_SDK()
    const result = await sdk.getCommitment(id)

    if (!result) {
      return NextResponse.json(
        { code: 404, error: 'Commitment not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      code: 0,
      data: result
    })
  } catch (error: any) {
    console.error('Get commitment error:', error)
    return NextResponse.json(
      { code: 500, error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
