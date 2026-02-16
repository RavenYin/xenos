import { NextRequest, NextResponse } from "next/server";

// 调试回调 - 查看 SecondMe 返回了什么
export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;
  
  console.log("=== CALLBACK DEBUG ===");
  console.log("Full URL:", req.url);
  console.log("Query Params:");
  for (const [key, value] of searchParams.entries()) {
    console.log(`  ${key}: ${value}`);
  }
  
  // 检查是否有 code
  const code = searchParams.get('code');
  const error = searchParams.get('error');
  const state = searchParams.get('state');
  
  if (error) {
    return NextResponse.json({
      error: "SecondMe returned error",
      error_code: error,
      error_description: searchParams.get('error_description'),
    }, { status: 400 });
  }
  
  if (!code) {
    return NextResponse.json({
      error: "No authorization code received",
      message: "SecondMe did not return a code parameter",
      params: Object.fromEntries(searchParams.entries()),
    }, { status: 400 });
  }
  
  // 返回成功响应
  return NextResponse.json({
    success: true,
    message: "Authorization code received",
    code: code.substring(0, 20) + "...",
    state: state,
    next_step: "This code should be exchanged for a token by NextAuth",
  });
}
