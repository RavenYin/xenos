/**
n// Force dynamic rendering
export const dynamic = 'force-dynamic'

 * GET /api/v1/delegations?delegatorId=xxx&status=PENDING_ACCEPT
 * 列出我委托的任务（委托方视角）
 */

import { NextRequest, NextResponse } from 'next/server'
import { getVCA_SDK, CommitmentStatus } from '@/lib/vca-sdk'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const delegatorId = searchParams.get('delegatorId')
    const status = searchParams.get('status') as CommitmentStatus | null
    const limit = parseInt(searchParams.get('limit') || '20')
    const offset = parseInt(searchParams.get('offset') || '0')

    if (!delegatorId) {
      return NextResponse.json(
        { code: 400, error: 'Missing delegatorId' },
        { status: 400 }
      )
    }

    const sdk = getVCA_SDK()
    const result = await sdk.listMyDelegations({
      delegatorId,
      status: status || undefined,
      limit,
      offset
    })

    return NextResponse.json({
      code: 0,
      data: result
    })
  } catch (error: any) {
    console.error('List delegations error:', error)
    return NextResponse.json(
      { code: 500, error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
