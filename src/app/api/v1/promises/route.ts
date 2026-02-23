/**
export const dynamic = 'force-dynamic'

 * GET /api/v1/promises?promiserId=xxx&status=PENDING
 * 列出我承诺的任务（承诺方视角）
 */

import { NextRequest, NextResponse } from 'next/server'
import { getVCA_SDK, CommitmentStatus } from '@/lib/vca-sdk'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const promiserId = searchParams.get('promiserId')
    const status = searchParams.get('status') as CommitmentStatus | null
    const limit = parseInt(searchParams.get('limit') || '20')
    const offset = parseInt(searchParams.get('offset') || '0')

    if (!promiserId) {
      return NextResponse.json(
        { code: 400, error: 'Missing promiserId' },
        { status: 400 }
      )
    }

    const sdk = getVCA_SDK()
    const result = await sdk.listMyPromises({
      promiserId,
      status: status || undefined,
      limit,
      offset
    })

    return NextResponse.json({
      code: 0,
      data: result
    })
  } catch (error: any) {
    console.error('List promises error:', error)
    return NextResponse.json(
      { code: 500, error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
