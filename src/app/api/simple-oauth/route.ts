import { NextRequest, NextResponse } from "next/server";

const SECONDME_ENDPOINT = process.env.SECONDME_ENDPOINT || 'https://app.mindos.com/gate/lab';

// 最简单的 OAuth 测试 - 手动完成整个流程
export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;
  const code = searchParams.get('code');
  
  if (!code) {
    // 第一步：直接跳转到 SecondMe 授权页面
    const params = new URLSearchParams({
      client_id: process.env.SECONDME_CLIENT_ID!,
      redirect_uri: 'http://localhost:3001/api/simple-oauth',
      response_type: 'code',
      scope: 'user.info',
    });
    
    return NextResponse.redirect(`https://go.second.me/oauth/?${params.toString()}`);
  }
  
  // 第二步：用 code 换取 token
  try {
    console.log('[Simple OAuth] Exchanging code:', code.substring(0, 20) + '...');
    
    const tokenRes = await fetch(`${SECONDME_ENDPOINT}/api/oauth/token/code`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code: code,
        redirect_uri: 'http://localhost:3001/api/simple-oauth',
        client_id: process.env.SECONDME_CLIENT_ID!,
        client_secret: process.env.SECONDME_CLIENT_SECRET!,
      }),
    });
    
    const tokenData = await tokenRes.json();
    console.log('[Simple OAuth] Token response:', tokenData.code, tokenData.message);
    
    if (tokenData.code !== 0 || !tokenData.data) {
      return NextResponse.json({
        error: "Token exchange failed",
        details: tokenData,
      }, { status: 400 });
    }
    
    // 第三步：获取用户信息
    const userRes = await fetch(`${SECONDME_ENDPOINT}/api/secondme/user/info`, {
      headers: { Authorization: `Bearer ${tokenData.data.accessToken}` },
    });
    
    const userData = await userRes.json();
    
    if (userData.code !== 0 || !userData.data) {
      return NextResponse.json({
        error: "Failed to fetch user info",
        details: userData,
      }, { status: 400 });
    }
    
    // 成功！返回用户信息
    return NextResponse.json({
      success: true,
      message: "OAuth flow completed successfully!",
      user: {
        id: userData.data.sub,
        name: userData.data.name,
        email: userData.data.email,
        picture: userData.data.picture,
      },
      token: {
        accessToken: tokenData.data.accessToken?.substring(0, 20) + "...",
        expiresIn: tokenData.data.expiresIn,
      },
    });
    
  } catch (error: any) {
    console.error('[Simple OAuth] Error:', error);
    return NextResponse.json({
      error: "OAuth flow failed",
      message: error.message,
    }, { status: 500 });
  }
}
