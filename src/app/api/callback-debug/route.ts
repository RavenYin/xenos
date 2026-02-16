import { NextRequest, NextResponse } from "next/server";

// 捕获 SecondMe 回调并显示所有参数
export async function GET(req: NextRequest) {
  const url = req.url;
  const searchParams = req.nextUrl.searchParams;
  
  // 记录所有参数
  const params: Record<string, string> = {};
  searchParams.forEach((value, key) => {
    params[key] = value;
  });
  
  console.log("=== SecondMe Callback Debug ===");
  console.log("URL:", url);
  console.log("Params:", params);
  
  // 检查是否有 code
  if (!params.code) {
    return NextResponse.json({
      error: "Missing authorization code",
      url: url,
      params: params,
      note: "SecondMe should have returned a 'code' parameter"
    }, { status: 400 });
  }
  
  // 返回成功响应
  return NextResponse.json({
    success: true,
    message: "Callback received successfully",
    code: params.code?.substring(0, 20) + "...",
    state: params.state,
    allParams: params,
    nextStep: "This code should be exchanged for a token",
    timestamp: new Date().toISOString()
  });
}
