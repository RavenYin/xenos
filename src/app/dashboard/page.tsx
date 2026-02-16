'use client'

import { useSession, signOut } from "next-auth/react"
import Link from "next/link"

export default function Dashboard() {
  const { data: session, status } = useSession()

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

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">请先登录</h1>
          <Link
            href="/"
            className="text-blue-600 hover:text-blue-700 font-medium"
          >
            返回首页
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-5xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">
            信契 <span className="text-blue-600">控制台</span>
          </h1>
          <div className="flex items-center gap-4">
            <span className="text-gray-600">{session.user?.name}</span>
            <button
              onClick={() => signOut({ callbackUrl: "/" })}
              className="text-red-600 hover:text-red-700 font-medium"
            >
              退出
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-10">
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            个人信息
          </h2>
          <div className="space-y-3">
            <div className="flex justify-between py-2 border-b">
              <span className="text-gray-600">姓名</span>
              <span className="font-medium">{session.user?.name || "-"}</span>
            </div>
            <div className="flex justify-between py-2 border-b">
              <span className="text-gray-600">邮箱</span>
              <span className="font-medium">{session.user?.email || "-"}</span>
            </div>
            <div className="flex justify-between py-2 border-b">
              <span className="text-gray-600">用户 ID</span>
              <span className="font-mono text-sm">{session.user?.id}</span>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
