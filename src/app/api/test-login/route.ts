import { NextRequest, NextResponse } from "next/server";

const SECONDME_ENDPOINT = process.env.SECONDME_ENDPOINT || 'https://app.mindos.com/gate/lab';
const NEXTAUTH_URL = process.env.NEXTAUTH_URL || 'http://localhost:3001';

export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;
  const code = searchParams.get('code');
  
  if (!code) {
    // 第一步：跳转到 SecondMe 授权
    const clientId = process.env.SECONDME_CLIENT_ID;
    const redirectUri = `${NEXTAUTH_URL}/api/test-login`;
    const authUrl = `https://go.second.me/oauth/?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=user.info`;
    
    return NextResponse.redirect(authUrl);
  }
  
  // 第二步：用 code 换 token
  try {
    console.log('[Test Login] Exchanging code for token...');
    console.log('[Test Login] Code:', code.substring(0, 20) + '...');
    console.log('[Test Login] Redirect URI:', `${NEXTAUTH_URL}/api/test-login`);
    
    const tokenResponse = await fetch(`${SECONDME_ENDPOINT}/api/oauth/token/code`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code: code,
        redirect_uri: `${NEXTAUTH_URL}/api/test-login`,
        client_id: process.env.SECONDME_CLIENT_ID!,
        client_secret: process.env.SECONDME_CLIENT_SECRET!,
      }),
    });

    const tokenResult = await tokenResponse.json();
    console.log('[Test Login] Token response:', JSON.stringify(tokenResult, null, 2));

    if (tokenResult.code !== 0 || !tokenResult.data) {
      return NextResponse.json({
        error: "Token exchange failed",
        message: tokenResult.message,
        fullResponse: tokenResult,
      }, { status: 400 });
    }

    // 第三步：获取用户信息
    const { accessToken } = tokenResult.data;
    console.log('[Test Login] Got access token, fetching user info...');
    
    const userResponse = await fetch(`${SECONDME_ENDPOINT}/api/secondme/user/info`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    const userResult = await userResponse.json();
    console.log('[Test Login] User info response:', JSON.stringify(userResult, null, 2));

    if (userResult.code !== 0 || !userResult.data) {
      return NextResponse.json({
        error: "Failed to fetch user info",
        message: userResult.message,
        tokenData: tokenResult.data,
        userResponse: userResult,
      }, { status: 400 });
    }

    // 成功！
    return NextResponse.json({
      success: true,
      message: "Login successful!",
      user: userResult.data,
      token: {
        accessToken: tokenResult.data.accessToken?.substring(0, 20) + "...",
        expiresIn: tokenResult.data.expiresIn,
      },
      nextSteps: [
        "Token exchange works correctly",
        "User info can be fetched",
        "The issue is in NextAuth configuration"
      ]
    });

  } catch (error: any) {
    console.error('[Test Login] Error:', error);
    return NextResponse.json({
      error: "Login process failed",
      message: error.message,
      stack: error.stack,
    }, { status: 500 });
  }
}
