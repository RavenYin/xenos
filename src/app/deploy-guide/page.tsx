import Link from "next/link"

export default function DeployGuide() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">部署到生产环境</h1>
        <p className="text-gray-600 mb-8">将信契部署到 Vercel，获得稳定的 SecondMe OAuth 登录体验</p>

        <div className="space-y-6">
          {/* 步骤 1 */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center mb-4">
              <span className="bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold mr-3">1</span>
              <h2 className="text-xl font-semibold">创建数据库</h2>
            </div>
            <p className="text-gray-600 mb-4">使用 Supabase 创建免费的 PostgreSQL 数据库</p>
            <ol className="list-decimal list-inside space-y-2 text-gray-700">
              <li>访问 <a href="https://supabase.com" className="text-blue-600 hover:underline" target="_blank">supabase.com</a></li>
              <li>注册账号并创建新项目</li>
              <li>Project name: <code className="bg-gray-100 px-2 py-1 rounded">xenos-db</code></li>
              <li>Region: <code className="bg-gray-100 px-2 py-1 rounded">Asia (Singapore)</code></li>
              <li>进入 Settings → Database 复制连接字符串</li>
            </ol>
          </div>

          {/* 步骤 2 */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center mb-4">
              <span className="bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold mr-3">2</span>
              <h2 className="text-xl font-semibold">部署到 Vercel</h2>
            </div>
            <p className="text-gray-600 mb-4">一键部署 Next.js 应用到 Vercel</p>
            <ol className="list-decimal list-inside space-y-2 text-gray-700">
              <li>访问 <a href="https://vercel.com/new" className="text-blue-600 hover:underline" target="_blank">vercel.com/new</a></li>
              <li>导入 GitHub 仓库或上传代码</li>
              <li>配置环境变量（见下方）</li>
              <li>点击 Deploy 等待部署完成</li>
            </ol>
            
            <div className="mt-4 bg-gray-50 p-4 rounded-lg">
              <h3 className="font-semibold text-gray-900 mb-2">环境变量配置</h3>
              <pre className="text-sm bg-gray-800 text-green-400 p-3 rounded overflow-x-auto">
{`NEXTAUTH_URL=https://你的域名.vercel.app
NEXTAUTH_SECRET=pgPXwDDO0SONLT8ZjSaiquNiNvpQQZ1SN44cpDDlY4Y=
SECONDME_CLIENT_ID=79127965-7c40-4609-9862-15933fa9712e
SECONDME_CLIENT_SECRET=9e4dc0a90f0292be2ce79e5861dae535a323ae78ec6cdb8c7a4a18c628493870
SECONDME_ENDPOINT=https://app.mindos.com/gate/lab
DATABASE_URL=postgresql://...`}
              </pre>
            </div>
          </div>

          {/* 步骤 3 */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center mb-4">
              <span className="bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold mr-3">3</span>
              <h2 className="text-xl font-semibold">更新回调地址</h2>
            </div>
            <p className="text-gray-600 mb-4">在 SecondMe 开发者后台添加生产环境回调地址</p>
            <ol className="list-decimal list-inside space-y-2 text-gray-700">
              <li>访问 <a href="https://develop.second.me/apps/79127965-7c40-4609-9862-15933fa9712e/info" className="text-blue-600 hover:underline" target="_blank">SecondMe 开发者后台</a></li>
              <li>找到 Redirect URIs 字段</li>
              <li>添加新的回调地址：
                <code className="bg-gray-100 px-2 py-1 rounded block mt-1">
                  https://你的域名.vercel.app/api/auth/callback/secondme
                </code>
              </li>
              <li>点击 Save 保存</li>
            </ol>
          </div>

          {/* 步骤 4 */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center mb-4">
              <span className="bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold mr-3">4</span>
              <h2 className="text-xl font-semibold">验证登录</h2>
            </div>
            <p className="text-gray-600 mb-4">测试生产环境的 SecondMe OAuth 登录</p>
            <ol className="list-decimal list-inside space-y-2 text-gray-700">
              <li>访问你的 Vercel 域名</li>
              <li>点击"使用 SecondMe 登录"</li>
              <li>完成授权流程</li>
              <li>确认成功跳转到 Dashboard</li>
            </ol>
          </div>
        </div>

        <div className="mt-8 flex gap-4">
          <Link 
            href="/"
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-8 rounded-lg text-center"
          >
            返回首页
          </Link>
          <a 
            href="https://vercel.com/new"
            target="_blank"
            className="bg-gray-800 hover:bg-gray-900 text-white font-semibold py-3 px-8 rounded-lg text-center"
          >
            开始部署 →
          </a>
        </div>
      </div>
    </div>
  )
}
