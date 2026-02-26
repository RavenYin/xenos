import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getUserReputation } from '@/lib/reputation'

export const dynamic = 'force-dynamic'

/**
 * GET /api/v1/agents/[id]
 * 获取单个 Agent 详情
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    
    const agent = await prisma.agentProfile.findUnique({
      where: { id }
    })

    if (!agent) {
      return NextResponse.json({ code: 404, error: 'Agent not found' }, { status: 404 })
    }

    // 获取信誉
    const reputation = await getUserReputation(agent.userId)

    // 获取担保关系
    const givenVouches = await prisma.vouch.findMany({
      where: { voucherId: agent.userId },
      include: {
        vouchee: { select: { id: true, name: true } }
      }
    })

    const receivedVouches = await prisma.vouch.findMany({
      where: { voucheeId: agent.userId },
      include: {
        voucher: { select: { id: true, name: true } }
      }
    })

    return NextResponse.json({
      code: 0,
      data: {
        id: agent.id,
        userId: agent.userId,
        name: agent.name,
        introduction: agent.introduction,
        skills: agent.skills ? agent.skills.split(',').filter(Boolean) : [],
        avatarUrl: agent.avatarUrl,
        github: agent.github,
        towow: agent.towow,
        website: agent.website,
        reputation,
        vouches: {
          given: givenVouches.map(v => ({
            voucheeId: v.voucheeId,
            voucheeName: v.vouchee.name,
            context: v.context,
            comment: v.comment
          })),
          received: receivedVouches.map(v => ({
            voucherId: v.voucherId,
            voucherName: v.voucher.name,
            context: v.context,
            comment: v.comment
          }))
        }
      }
    })
  } catch (error: any) {
    return NextResponse.json({ code: 500, error: error.message }, { status: 500 })
  }
}
