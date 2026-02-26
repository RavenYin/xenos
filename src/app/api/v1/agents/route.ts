import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getUserReputation } from '@/lib/reputation'

export const dynamic = 'force-dynamic'

/**
 * GET /api/v1/agents - 获取 Agent 列表
 * Query: context?, minReputation?, limit?, offset?
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const context = searchParams.get('context')
    const minReputation = searchParams.get('minReputation')
    const limit = parseInt(searchParams.get('limit') || '20')
    const offset = parseInt(searchParams.get('offset') || '0')

    const agents = await prisma.agentProfile.findMany({
      take: limit,
      skip: offset,
      orderBy: { updatedAt: 'desc' }
    })

    const agentsWithReputation = await Promise.all(
      agents.map(async (agent) => {
        const reputation = await getUserReputation(agent.userId)
        const contextRep = context 
          ? reputation.byContext.find(r => r.context === context)
          : null

        if (minReputation && contextRep && contextRep.score < parseInt(minReputation)) {
          return null
        }

        return {
          id: agent.id,
          userId: agent.userId,
          name: agent.name,
          introduction: agent.introduction,
          skills: agent.skills ? agent.skills.split(',').filter(Boolean) : [],
          avatarUrl: agent.avatarUrl,
          github: agent.github,
          towow: agent.towow,
          reputation: contextRep || reputation.overall
        }
      })
    )

    return NextResponse.json({
      code: 0,
      data: {
        agents: agentsWithReputation.filter(Boolean),
        total: await prisma.agentProfile.count(),
        limit,
        offset
      }
    })
  } catch (error: any) {
    return NextResponse.json({ code: 500, error: error.message }, { status: 500 })
  }
}

/** POST /api/v1/agents - 创建/更新 Agent Profile */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, name, introduction, skills, github, towow, website } = body

    if (!userId || !name) {
      return NextResponse.json({ code: 400, error: 'Missing userId or name' }, { status: 400 })
    }

    const user = await prisma.user.findUnique({ where: { id: userId } })
    if (!user) {
      return NextResponse.json({ code: 404, error: 'User not found' }, { status: 404 })
    }

    const agentProfile = await prisma.agentProfile.upsert({
      where: { userId },
      create: { userId, name, introduction, skills: skills?.join(','), github, towow, website },
      update: { name, introduction, skills: skills?.join(','), github, towow, website }
    })

    return NextResponse.json({ code: 0, data: agentProfile })
  } catch (error: any) {
    return NextResponse.json({ code: 500, error: error.message }, { status: 500 })
  }
}
