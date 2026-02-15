import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/v1/reputation/:agentId - Get reputation for an agent
export async function GET(
  req: NextRequest,
  { params }: { params: { agentId: string } }
) {
  try {
    const { agentId } = params;
    const { searchParams } = new URL(req.url);
    const context = searchParams.get("context") || "towow-task";

    if (!agentId) {
      return NextResponse.json(
        { error: "Agent ID required" },
        { status: 400 }
      );
    }

    // Find agent by DID or ID
    const agent = await prisma.agent.findFirst({
      where: {
        OR: [{ did: agentId }, { id: agentId }],
      },
      include: {
        owner: {
          select: {
            name: true,
            image: true,
            secondMeId: true,
          },
        },
      },
    });

    if (!agent) {
      return NextResponse.json(
        { error: "Agent not found" },
        { status: 404 }
      );
    }

    // Get reputation for specific context
    const reputation = await prisma.reputation.findUnique({
      where: {
        agentId_context: {
          agentId: agent.id,
          context,
        },
      },
    });

    // Get all reputations across contexts
    const allReputations = await prisma.reputation.findMany({
      where: { agentId: agent.id },
    });

    // Calculate aggregated stats
    const totalTasks = allReputations.reduce((sum, r) => sum + r.totalTasks, 0);
    const totalFulfilled = allReputations.reduce(
      (sum, r) => sum + r.fulfilled,
      0
    );
    const overallRate = totalTasks > 0 ? (totalFulfilled / totalTasks) * 100 : 100;

    // Get recent commitments
    const recentCommitments = await prisma.commitment.findMany({
      where: {
        OR: [{ fromAgentId: agent.id }, { toAgentId: agent.id }],
      },
      include: {
        fromAgent: true,
        toAgent: true,
        attestations: true,
      },
      orderBy: { createdAt: "desc" },
      take: 10,
    });

    return NextResponse.json({
      agent: {
        id: agent.id,
        did: agent.did,
        name: agent.name,
        description: agent.description,
        owner: agent.owner,
        createdAt: agent.createdAt,
      },
      reputation: {
        context: context,
        tasksInContext: reputation?.totalTasks || 0,
        fulfilledInContext: reputation?.fulfilled || 0,
        rateInContext:
          reputation && reputation.totalTasks > 0
            ? (reputation.fulfilled / reputation.totalTasks) * 100
            : 100,
        overall: {
          totalTasks,
          totalFulfilled,
          fulfillmentRate: overallRate,
        },
      },
      recentActivity: recentCommitments.map((c) => ({
        id: c.id,
        role: c.fromAgentId === agent.id ? "issuer" : "recipient",
        context: c.context,
        task: c.task,
        status: c.status,
        createdAt: c.createdAt,
        hasAttestation: c.attestations.length > 0,
        fulfilled: c.attestations.some((a) => a.fulfilled),
      })),
    });
  } catch (error) {
    console.error("[Reputation GET] Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
