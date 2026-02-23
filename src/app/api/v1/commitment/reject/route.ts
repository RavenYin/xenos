import { NextRequest, NextResponse } from 'next/server'
import { getVCA_SDK } from '@/lib/vca-sdk'

export const dynamic = 'force-dynamic'

/**

 * POST /api/v1/commitment/reject
 * 承诺方拒绝承诺
 * 
 * Body:
 * {
 *   "commitmentId": "xxx",
 *   "promiserId": "user_123",
 *   "reason": "时间冲突"  // 可选
 * }
 */


export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { commitmentId, promiserId, reason } = body

    if (!commitmentId || !promiserId) {
      return NextResponse.json(
        { code: 400, error: 'Missing required fields: commitmentId, promiserId' },
        { status: 400 }
      )
    }

    const sdk = getVCA_SDK()
    const result = await sdk.rejectCommitment(commitmentId, promiserId, reason)

    return NextResponse.json({
      code: 0,
      data: result
    })
  } catch (error: any) {
    console.error('Reject commitment error:', error)
    return NextResponse.json(
      { code: 500, error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
