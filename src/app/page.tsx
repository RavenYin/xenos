import Link from 'next/link'

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-primary-50 to-white p-8">
      <div className="max-w-md w-full text-center">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Xenos
          </h1>
          <p className="text-gray-600 text-lg">
            集成 SecondMe OAuth 登录
          </p>
          <p className="text-gray-500 mt-2">
            获取个人信息、笔记和聊天功能
          </p>
        </div>
        
        <div className="space-y-4">
          <Link
            href="/api/auth/login"
            className="btn-primary inline-flex items-center justify-center w-full"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
            </svg>
            使用 SecondMe 登录
          </Link>
          
          <p className="text-sm text-gray-400">
            登录即表示您同意我们的服务条款
          </p>
        </div>
        
        <div className="mt-12 pt-8 border-t border-gray-100">
          <p className="text-sm text-gray-400">
            由 SecondMe 提供认证服务
          </p>
        </div>
      </div>
    </main>
  )
}
