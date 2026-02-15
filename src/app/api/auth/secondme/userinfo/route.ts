import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  if (!authHeader) {
    return NextResponse.json(
      { error: 'Missing authorization header' },
      { status: 401 }
    );
  }

  const token = authHeader.replace('Bearer ', '').trim();
  if (!token) {
    return NextResponse.json(
      { error: 'Invalid authorization header' },
      { status: 401 }
    );
  }

  try {
    // Fetch user info from SecondMe API using the provided token
    const response = await fetch(`${process.env.SECONDME_ENDPOINT}/api/secondme/user/info`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    const result = await response.json();

    if (result.code !== 0 || !result.data) {
      return NextResponse.json(
        { error: result.message || 'Failed to fetch user info' },
        { status: 500 }
      );
    }

    // Transform to OpenID Connect standard format expected by NextAuth
    const { sub, name, email, avatarUrl, picture } = result.data;

    return NextResponse.json({
      sub,
      name,
      email,
      picture: picture || avatarUrl,
    });
  } catch (error) {
    console.error('Userinfo fetch error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}