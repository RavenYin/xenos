'use client'

import { useSearchParams } from "next/navigation"
import Link from "next/link"

export default function AuthError() {
  const searchParams = useSearchParams()
  const error = searchParams.get("error")
  const callbackUrl = searchParams.get("callbackUrl")

  const errorMessages: Record<string, string> = {
    OAuthCallback: "OAuth 回调处理失败。可能是 token 交换失败或用户配置获取失败。",
    OAuthAccountNotLinked: "账户未链接。",
    Configuration: "NextAuth 配置错误。",
    AccessDenied: "访问被拒绝。",
    Verification: "验证失败。",
    Default: "未知错误。"
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-lg w-full p-6 bg-white rounded-lg shadow-lg">
        <h1 className="text-2xl font-bold text-red-600 mb-4">登录失败</h1>
        
        {error && (
          <div className="mb-4">
            <p className="text-gray-600">错误代码:</p>
            <p className="text-red-500 font-mono bg-red-50 p-2 rounded text-sm mb-2">
              {error}
            </p>
            <p className="text-gray-600">错误说明:</p>
            <p className="text-orange-600 text-sm">
              {errorMessages[error] || errorMessages.Default}
            </p>
          </div>
        )}

        {callbackUrl && (
          <div className="mb-4">
            <p className="text-gray-600">回调地址:</p>
            <p className="text-blue-600 text-sm break-all font-mono bg-blue-50 p-2 rounded">
              {callbackUrl}
            </p>
          </div>
        )}

        <div className="bg-yellow-50 p-4 rounded-lg mb-4">
          <p className="text-yellow-800 text-sm font-semibold mb-2">可能的解决方案:</p>
          <ul className="text-yellow-700 text-sm list-disc pl-4 space-y-1">
            <li>检查 SecondMe 开发者后台的 Redirect URI 配置</li>
            <li>检查服务器日志中的详细错误信息</li>
            <li>确保 SECONDME_CLIENT_ID 和 SECONDME_CLIENT_SECRET 正确</li>
            <li>尝试清除浏览器缓存后重试</li>
          </ul>
        </div>
        
        <Link
          href="/"
          className="block w-full text-center bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700"
        >
          返回首页重试
        </Link>
      </div>
    </div>
  )
}
