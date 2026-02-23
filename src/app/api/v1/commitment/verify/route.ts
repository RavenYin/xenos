import { NextRequest, NextResponse } from 'next/server'
import { getVCA_SDK } from '@/lib/vca-sdk'

export const dynamic = 'force-dynamic'

/**

 * POST /api/v1/commitment/verify
 * 委托方验收承诺
 * 
 * Body:
 * {
 *   "commitmentId": "xxx",
 *   "verifierId": "user_456",   // 委托方 ID
 *   "fulfilled": true,          // 是否履约
 *   "evidence": "...",          // 可选：证据
 *   "comment": "完成得很好"      // 可选：备注
 * }
 */


export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { commitmentId, verifierId, fulfilled, evidence, comment } = body

    if (!commitmentId || !verifierId || fulfilled === undefined) {
      return NextResponse.json(
        { code: 400, error: 'Missing required fields: commitmentId, verifierId, fulfilled' },
        { status: 400 }
      )
    }

    const sdk = getVCA_SDK()
    const result = await sdk.verifyCommitment({
      commitmentId,
      verifierId,
      fulfilled,
      evidence,
      comment
    })

    return NextResponse.json({
      code: 0,
      data: result
    })
  } catch (error: any) {
    console.error('Verify commitment error:', error)
    return NextResponse.json(
      { code: 500, error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
