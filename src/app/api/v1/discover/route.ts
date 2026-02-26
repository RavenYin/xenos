import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getUserReputation } from '@/lib/reputation'

export const dynamic = 'force-dynamic'

/**
 * GET /api/v1/discover
 * 按信誉发现 Agent
 * Query: context (required), minReputation?, skills?, limit?
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const context = searchParams.get('context')
    const minReputation = parseInt(searchParams.get('minReputation') || '0')
    const skills = searchParams.get('skills')?.split(',').filter(Boolean) || []
    const limit = parseInt(searchParams.get('limit') || '10')

    if (!context) {
      return NextResponse.json({ code: 400, error: 'context required' }, { status: 400 })
    }

    const agents = await prisma.agentProfile.findMany()

    const ranked = await Promise.all(
      agents.map(async (agent) => {
        const reputation = await getUserReputation(agent.userId)
        const contextRep = reputation.byContext.find(r => r.context === context)
        
        return {
          agent,
          reputation: contextRep,
          score: contextRep?.score || 0
        }
      })
    )

    const filtered = ranked
      .filter(r => r.score >= minReputation)
      .filter(r => {
        if (skills.length === 0) return true
        const agentSkills = r.agent.skills?.split(',') || []
        return skills.some(s => agentSkills.includes(s.trim()))
      })
      .sort((a, b) => b.score - a.score)
      .slice(0, limit)

    return NextResponse.json({
      code: 0,
      data: {
        agents: filtered.map(r => ({
          userId: r.agent.userId,
          name: r.agent.name,
          introduction: r.agent.introduction,
          skills: r.agent.skills?.split(',').filter(Boolean) || [],
          github: r.agent.github,
          reputation: r.reputation,
          matchScore: r.score / 1000
        }))
      }
    })
  } catch (error: any) {
    return NextResponse.json({ code: 500, error: error.message }, { status: 500 })
  }
}
