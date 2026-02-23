import { NextRequest, NextResponse } from 'next/server'
import { getVCA_SDK } from '@/lib/vca-sdk'

export const dynamic = 'force-dynamic'

/**

 * GET /api/v1/reputation?userId=xxx
 * 获取用户信誉
 */


export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json(
        { code: 400, error: 'Missing userId' },
        { status: 400 }
      )
    }

    const sdk = getVCA_SDK()
    const result = await sdk.getReputation(userId)

    return NextResponse.json({
      code: 0,
      data: result
    })
  } catch (error: any) {
    console.error('Get reputation error:', error)
    return NextResponse.json(
      { code: 500, error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
