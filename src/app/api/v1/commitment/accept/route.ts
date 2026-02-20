/**
 * POST /api/v1/commitment/accept
 * 承诺方接受承诺
 * 
 * Body:
 * {
 *   "commitmentId": "xxx",
 *   "promiserId": "user_123"
 * }
 */

import { NextRequest, NextResponse } from 'next/server'
import { getVCA_SDK } from '@/lib/vca-sdk'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { commitmentId, promiserId } = body

    if (!commitmentId || !promiserId) {
      return NextResponse.json(
        { code: 400, error: 'Missing required fields: commitmentId, promiserId' },
        { status: 400 }
      )
    }

    const sdk = getVCA_SDK()
    const result = await sdk.acceptCommitment(commitmentId, promiserId)

    return NextResponse.json({
      code: 0,
      data: result
    })
  } catch (error: any) {
    console.error('Accept commitment error:', error)
    return NextResponse.json(
      { code: 500, error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
