/**
 * POST /api/v1/commitment/submit
 * 承诺方提交履约（标记为待验收）
 * 
 * Body:
 * {
 *   "commitmentId": "xxx",
 *   "promiserId": "user_123",
 *   "evidence": "https://..."  // 可选：证据链接
 * }
 */

import { NextRequest, NextResponse } from 'next/server'
import { getVCA_SDK } from '@/lib/vca-sdk'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { commitmentId, promiserId, evidence } = body

    if (!commitmentId || !promiserId) {
      return NextResponse.json(
        { code: 400, error: 'Missing required fields: commitmentId, promiserId' },
        { status: 400 }
      )
    }

    const sdk = getVCA_SDK()
    const result = await sdk.submitFulfillment(commitmentId, promiserId, evidence)

    return NextResponse.json({
      code: 0,
      data: result
    })
  } catch (error: any) {
    console.error('Submit fulfillment error:', error)
    return NextResponse.json(
      { code: 500, error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
