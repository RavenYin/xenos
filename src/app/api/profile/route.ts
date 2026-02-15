import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth";
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { SecondMeClient } from '@/lib/secondme';

export async function GET(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    return NextResponse.json(
      { error: '未授权，请先登录' },
      { status: 401 }
    );
  }

  // 从数据库中获取用户的 access token
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { accessToken: true },
  });

  if (!user?.accessToken) {
    return NextResponse.json(
      { error: '用户未绑定 SecondMe 账户' },
      { status: 400 }
    );
  }

  try {
    const secondMeClient = new SecondMeClient(user.accessToken);
    const profile = await secondMeClient.getProfile();

    return NextResponse.json(profile, { status: 200 });
  } catch (error: any) {
    console.error('Failed to fetch SecondMe profile:', error);
    return NextResponse.json(
      { error: '获取 SecondMe 个人信息失败', details: error.message },
      { status: 500 }
    );
  }
}