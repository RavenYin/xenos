import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// POST /api/v1/attestations - Create attestation for a commitment
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
    });

    if (!user || user.apiKey !== apiKey) {
      return NextResponse.json(
        { error: "Invalid API key" },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { commitmentId, fulfilled, evidence, metadata, rating } = body;

    if (!commitmentId || typeof fulfilled !== "boolean") {
      return NextResponse.json(
        { error: "Missing required fields: commitmentId, fulfilled" },
        { status: 400 }
      );
    }

    // Verify commitment exists and user is involved
    const commitment = await prisma.commitment.findFirst({
      where: {
        id: commitmentId,
        OR: [
          { fromAgent: { ownerId: user.id } },
          { toAgent: { ownerId: user.id } },
        ],
      },
      include: {
        fromAgent: true,
        toAgent: true,
      },
    });

    if (!commitment) {
      return NextResponse.json(
        { error: "Commitment not found or access denied" },
        { status: 404 }
      );
    }

    // Create attestation
    const attestation = await prisma.attestation.create({
      data: {
        commitmentId,
        fulfilled,
        evidence: evidence || null,
        metadata: metadata
          ? { ...metadata, rating: rating || null }
          : rating
          ? { rating }
          : null,
        signedBy: user.secondMeId || user.id,
        signature: "placeholder-signature", // TODO: Implement real signing
      },
    });

    // Update commitment status
    const newStatus = fulfilled ? "COMPLETED" : "DISPUTED";
    await prisma.commitment.update({
      where: { id: commitmentId },
      data: { status: newStatus },
    });

    // Update reputation for both agents
    await updateReputation(commitment.fromAgentId, commitment.context, fulfilled);
    await updateReputation(commitment.toAgentId, commitment.context, fulfilled);

    return NextResponse.json(
      {
        id: attestation.id,
        commitmentId: attestation.commitmentId,
        fulfilled: attestation.fulfilled,
        evidence: attestation.evidence,
        metadata: attestation.metadata,
        signedBy: attestation.signedBy,
        createdAt: attestation.createdAt,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("[Attestations POST] Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// Helper function to update reputation
async function updateReputation(
  agentId: string,
  context: string,
  fulfilled: boolean
) {
  const reputation = await prisma.reputation.findUnique({
    where: {
      agentId_context: {
        agentId,
        context,
      },
    },
  });

  if (reputation) {
    await prisma.reputation.update({
      where: {
        agentId_context: {
          agentId,
          context,
        },
      },
      data: {
        totalTasks: { increment: 1 },
        fulfilled: { increment: fulfilled ? 1 : 0 },
        lastUpdated: new Date(),
      },
    });
  } else {
    await prisma.reputation.create({
      data: {
        agentId,
        context,
        totalTasks: 1,
        fulfilled: fulfilled ? 1 : 0,
      },
    });
  }
}
