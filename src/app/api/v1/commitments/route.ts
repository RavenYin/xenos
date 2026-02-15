import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { randomUUID } from "crypto";

// GET /api/v1/commitments - List user's commitments
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Verify API key from header
    const apiKey = req.headers.get("authorization")?.replace("Bearer ", "");
    if (!apiKey) {
      return NextResponse.json(
        { error: "API key required" },
        { status: 401 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user || user.apiKey !== apiKey) {
      return NextResponse.json(
        { error: "Invalid API key" },
        { status: 401 }
      );
    }

    // Get user's agents and their commitments
    const commitments = await prisma.commitment.findMany({
      where: {
        OR: [
          { fromAgent: { ownerId: user.id } },
          { toAgent: { ownerId: user.id } },
        ],
      },
      include: {
        fromAgent: true,
        toAgent: true,
        attestations: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({
      commitments: commitments.map((c) => ({
        id: c.id,
        from: c.fromAgent.did,
        to: c.toAgent.did,
        context: c.context,
        task: c.task,
        deadline: c.deadline,
        status: c.status,
        createdAt: c.createdAt,
        attestations: c.attestations.map((a) => ({
          id: a.id,
          fulfilled: a.fulfilled,
          evidence: a.evidence,
          createdAt: a.createdAt,
        })),
      })),
    });
  } catch (error) {
    console.error("[Commitments GET] Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST /api/v1/commitments - Create a new commitment
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Verify API key from header
    const apiKey = req.headers.get("authorization")?.replace("Bearer ", "");
    if (!apiKey) {
      return NextResponse.json(
        { error: "API key required" },
        { status: 401 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: {
        agents: true,
      },
    });

    if (!user || user.apiKey !== apiKey) {
      return NextResponse.json(
        { error: "Invalid API key" },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { to, context, task, deadline } = body;

    if (!to || !context || !task) {
      return NextResponse.json(
        { error: "Missing required fields: to, context, task" },
        { status: 400 }
      );
    }

    // Find or create the 'from' agent (user's default agent)
    let fromAgent = user.agents[0];
    if (!fromAgent) {
      // Create default agent for user
      fromAgent = await prisma.agent.create({
        data: {
          did: `did:key:${randomUUID()}`,
          name: user.name || "Agent",
          description: "Default agent created by Xenos",
          ownerId: user.id,
        },
      });
    }

    // Find the 'to' agent by DID
    let toAgent = await prisma.agent.findUnique({
      where: { did: to },
    });

    if (!toAgent) {
      // Create a placeholder agent for the recipient
      toAgent = await prisma.agent.create({
        data: {
          did: to,
          name: "Unknown Agent",
          description: "Agent discovered via commitment",
          ownerId: user.id, // Temporary assignment
        },
      });
    }

    const commitment = await prisma.commitment.create({
      data: {
        fromAgentId: fromAgent.id,
        toAgentId: toAgent.id,
        context,
        task,
        deadline: deadline ? new Date(deadline) : null,
        status: "PENDING",
      },
      include: {
        fromAgent: true,
        toAgent: true,
      },
    });

    return NextResponse.json(
      {
        id: commitment.id,
        from: commitment.fromAgent.did,
        to: commitment.toAgent.did,
        context: commitment.context,
        task: commitment.task,
        deadline: commitment.deadline,
        status: commitment.status,
        createdAt: commitment.createdAt,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("[Commitments POST] Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
