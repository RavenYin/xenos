import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// Generate a random API key
function generateApiKey() {
  const crypto = require('crypto');
  return 'xk_' + crypto.randomBytes(24).toString('hex');
}

// GET /api/user/apikey - 获取用户的 API Key
export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    return NextResponse.json({ error: '未授权' }, { status: 401 });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { apiKey: true },
    });

    if (!user?.apiKey) {
      return NextResponse.json({ apiKey: null });
    }

    return NextResponse.json({ apiKey: user.apiKey });
  } catch (error) {
    console.error('Failed to fetch API key:', error);
    return NextResponse.json(
      { error: '获取 API Key 失败' },
      { status: 500 }
    );
  }
}

// POST /api/user/apikey - 生成新的 API Key
export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    return NextResponse.json({ error: '未授权' }, { status: 401 });
  }

  try {
    const apiKey = generateApiKey();

    // Save to user record
    const user = await prisma.user.update({
      where: { id: session.user.id },
      data: { apiKey },
      select: { apiKey: true },
    });

    return NextResponse.json({ apiKey: user.apiKey });
  } catch (error) {
    console.error('Failed to generate API key:', error);
    return NextResponse.json(
      { error: '生成 API Key 失败' },
      { status: 500 }
    );
  }
}