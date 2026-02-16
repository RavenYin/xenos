'use client'

import { useSession, signIn, signOut } from "next-auth/react"
import Link from "next/link"

export default function Home() {
  const { data: session, status } = useSession()

  // 直接跳转到 SecondMe OAuth
  const directLogin = () => {
    const clientId = process.env.NEXT_PUBLIC_SECONDME_CLIENT_ID || '79127965-7c40-4609-9862-15933fa9712e'
    const redirectUri = 'http://localhost:3001/api/auth/callback/secondme'
    const authUrl = `https://go.second.me/oauth/?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=user.info`
    window.location.href = authUrl
  }

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">加载中...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <header className="py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            信契 <span className="text-blue-600">Xenos</span>
          </h1>
          <p className="text-xl text-gray-700 mb-4">
            链接信任与履约的去中心化协议
          </p>
          <p className="text-lg text-gray-600 mb-10">
            基于 SecondMe 身份认证，为 ToWow 生态提供不可篡改的信任基础设施
          </p>

          {!session ? (
            <div className="space-y-4">
              <button
                onClick={() => signIn("secondme", { callbackUrl: "/dashboard" })}
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-4 px-10 rounded-xl text-lg shadow-lg transition-all block w-full max-w-md mx-auto"
              >
                使用 SecondMe 登录 (NextAuth)
              </button>
              
              <button
                onClick={directLogin}
                className="bg-gray-600 hover:bg-gray-700 text-white font-semibold py-3 px-8 rounded-xl text-base shadow-lg transition-all block w-full max-w-md mx-auto"
              >
                直接跳转 SecondMe (备选)
              </button>

              <a 
                href="/api/debug-callback"
                className="text-blue-600 hover:underline text-sm block mt-4"
              >
                测试回调接口
              </a>
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-green-600 font-medium">
                欢迎，{session.user?.name || "用户"}
              </p>
              <Link
                href="/dashboard"
                className="inline-block bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-8 rounded-lg shadow transition-colors"
              >
                进入控制台
              </Link>
            </div>
          )}
        </div>
      </header>
    </div>
  )
}
