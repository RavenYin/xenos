import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const code = formData.get('code') as string;
    const redirectUri = formData.get('redirect_uri') as string;

    if (!code) {
      return NextResponse.json(
        { error: 'Missing code' },
        { status: 400 }
      );
    }

    const tokenResponse = await fetch(`${process.env.SECONDME_ENDPOINT}/api/oauth/token/code`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        redirect_uri: redirectUri || process.env.NEXTAUTH_URL!,
        client_id: process.env.SECONDME_CLIENT_ID!,
        client_secret: process.env.SECONDME_CLIENT_SECRET!,
      }),
    });

    const tokenResult = await tokenResponse.json();

    if (tokenResult.code !== 0 || !tokenResult.data) {
      return NextResponse.json(
        { error: tokenResult.message || 'Token exchange failed' },
        { status: 400 }
      );
    }

    const { accessToken, refreshToken, tokenType, expiresIn, scope } = tokenResult.data;

    // Return OAuth2 standard response format expected by NextAuth
    return NextResponse.json({
      access_token: accessToken,
      refresh_token: refreshToken,
      token_type: tokenType || 'Bearer',
      expires_in: expiresIn,
      scope: scope ? (Array.isArray(scope) ? scope.join(' ') : scope) : undefined,
    });
  } catch (error) {
    console.error('Token exchange error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}