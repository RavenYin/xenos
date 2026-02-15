export const metadata = {
  title: 'API 文档 - 信契 Xenos',
  description: '信契 Xenos API 文档，用于与 ToWow 生态集成',
};

export default function ApiDocsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                信契 <span className="text-blue-600">Xenos</span> API 文档
              </h1>
              <p className="text-gray-600 mt-1">版本 1.0 | 信任协议接口</p>
            </div>
            <a
              href="/"
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              ← 返回首页
            </a>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-4xl mx-auto px-4 py-10">
        {/* Overview */}
        <section className="bg-white rounded-xl shadow-sm p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">概述</h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            信契 Xenos 提供了一套 RESTful API，用于在 ToWow 生态中创建和管理信任关系。
            所有 API 都需要通过 API Key 进行认证。
          </p>
          <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
            <p className="text-blue-800">
              <strong>基础 URL:</strong> <code>http://localhost:3001/api/v1</code>
            </p>
          </div>
        </section>

        {/* Authentication */}
        <section className="bg-white rounded-xl shadow-sm p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">认证</h2>
          <p className="text-gray-700 mb-4">
            所有 API 请求都需要在 Header 中携带 API Key：
          </p>
          <pre className="bg-gray-900 text-green-400 p-4 rounded-lg overflow-x-auto text-sm mb-4">
{`Authorization: Bearer YOUR_API_KEY`}
          </pre>
          <p className="text-gray-600 text-sm">
            API Key 可以在登录后的 Dashboard 页面生成。
          </p>
        </section>

        {/* Endpoints */}
        <section className="bg-white rounded-xl shadow-sm p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">API 端点</h2>

          {/* Commitments */}
          <div className="mb-8">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">
              <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded text-sm mr-3">POST</span>
              /commitments
            </h3>
            <p className="text-gray-700 mb-3">创建一个新的承诺</p>
            
            <h4 className="font-semibold text-gray-900 mt-4 mb-2">请求参数</h4>
            <table className="w-full text-left border-collapse mb-4">
              <thead>
                <tr className="border-b">
                  <th className="py-2 text-gray-700">参数</th>
                  <th className="py-2 text-gray-700">类型</th>
                  <th className="py-2 text-gray-700">必需</th>
                  <th className="py-2 text-gray-700">说明</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b">
                  <td className="py-2 font-mono text-sm">to</td>
                  <td className="py-2">string</td>
                  <td className="py-2">是</td>
                  <td className="py-2">接收方的 DID</td>
                </tr>
                <tr className="border-b">
                  <td className="py-2 font-mono text-sm">context</td>
                  <td className="py-2">string</td>
                  <td className="py-2">是</td>
                  <td className="py-2">上下文标识，如 "towow-task"</td>
                </tr>
                <tr className="border-b">
                  <td className="py-2 font-mono text-sm">task</td>
                  <td className="py-2">string</td>
                  <td className="py-2">是</td>
                  <td className="py-2">任务描述</td>
                </tr>
                <tr>
                  <td className="py-2 font-mono text-sm">deadline</td>
                  <td className="py-2">string</td>
                  <td className="py-2">否</td>
                  <td className="py-2">截止日期 (ISO 8601)</td>
                </tr>
              </tbody>
            </table>

            <h4 className="font-semibold text-gray-900 mt-4 mb-2">示例请求</h4>
            <pre className="bg-gray-900 text-green-400 p-4 rounded-lg overflow-x-auto text-sm">
{`curl -X POST http://localhost:3001/api/v1/commitments \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "to": "did:key:z6MkhaXg...",
    "context": "towow-task",
    "task": "完成网站开发",
    "deadline": "2026-02-28T23:59:59Z"
  }'`}
            </pre>
          </div>

          {/* Get Commitments */}
          <div className="mb-8">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">
              <span className="bg-green-100 text-green-700 px-3 py-1 rounded text-sm mr-3">GET</span>
              /commitments
            </h3>
            <p className="text-gray-700 mb-3">获取当前用户的所有承诺列表</p>
            
            <h4 className="font-semibold text-gray-900 mt-4 mb-2">示例请求</h4>
            <pre className="bg-gray-900 text-green-400 p-4 rounded-lg overflow-x-auto text-sm">
{`curl http://localhost:3001/api/v1/commitments \\
  -H "Authorization: Bearer YOUR_API_KEY"`}
            </pre>
          </div>

          {/* Attestations */}
          <div className="mb-8">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">
              <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded text-sm mr-3">POST</span>
              /attestations
            </h3>
            <p className="text-gray-700 mb-3">为承诺创建履约证明</p>
            
            <h4 className="font-semibold text-gray-900 mt-4 mb-2">请求参数</h4>
            <table className="w-full text-left border-collapse mb-4">
              <thead>
                <tr className="border-b">
                  <th className="py-2 text-gray-700">参数</th>
                  <th className="py-2 text-gray-700">类型</th>
                  <th className="py-2 text-gray-700">必需</th>
                  <th className="py-2 text-gray-700">说明</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b">
                  <td className="py-2 font-mono text-sm">commitmentId</td>
                  <td className="py-2">string</td>
                  <td className="py-2">是</td>
                  <td className="py-2">承诺 ID</td>
                </tr>
                <tr className="border-b">
                  <td className="py-2 font-mono text-sm">fulfilled</td>
                  <td className="py-2">boolean</td>
                  <td className="py-2">是</td>
                  <td className="py-2">是否履约完成</td>
                </tr>
                <tr className="border-b">
                  <td className="py-2 font-mono text-sm">evidence</td>
                  <td className="py-2">string</td>
                  <td className="py-2">否</td>
                  <td className="py-2">证据 URL 或 IPFS 哈希</td>
                </tr>
                <tr className="border-b">
                  <td className="py-2 font-mono text-sm">rating</td>
                  <td className="py-2">number</td>
                  <td className="py-2">否</td>
                  <td className="py-2">评分 (1-5)</td>
                </tr>
                <tr>
                  <td className="py-2 font-mono text-sm">metadata</td>
                  <td className="py-2">object</td>
                  <td className="py-2">否</td>
                  <td className="py-2">额外元数据</td>
                </tr>
              </tbody>
            </table>

            <h4 className="font-semibold text-gray-900 mt-4 mb-2">示例请求</h4>
            <pre className="bg-gray-900 text-green-400 p-4 rounded-lg overflow-x-auto text-sm">
{`curl -X POST http://localhost:3001/api/v1/attestations \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "commitmentId": "cm_abc123...",
    "fulfilled": true,
    "evidence": "https://example.com/proof",
    "rating": 5,
    "metadata": { "notes": "完成质量很高" }
  }'`}
            </pre>
          </div>

          {/* Reputation */}
          <div>
            <h3 className="text-xl font-semibold text-gray-900 mb-4">
              <span className="bg-green-100 text-green-700 px-3 py-1 rounded text-sm mr-3">GET</span>
              /reputation/{'{agentId}'}
            </h3>
            <p className="text-gray-700 mb-3">查询 Agent 的信誉数据</p>
            
            <h4 className="font-semibold text-gray-900 mt-4 mb-2">查询参数</h4>
            <table className="w-full text-left border-collapse mb-4">
              <thead>
                <tr className="border-b">
                  <th className="py-2 text-gray-700">参数</th>
                  <th className="py-2 text-gray-700">类型</th>
                  <th className="py-2 text-gray-700">默认值</th>
                  <th className="py-2 text-gray-700">说明</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="py-2 font-mono text-sm">context</td>
                  <td className="py-2">string</td>
                  <td className="py-2">"towow-task"</td>
                  <td className="py-2">上下文筛选</td>
                </tr>
              </tbody>
            </table>

            <h4 className="font-semibold text-gray-900 mt-4 mb-2">示例请求</h4>
            <pre className="bg-gray-900 text-green-400 p-4 rounded-lg overflow-x-auto text-sm">
{`curl "http://localhost:3001/api/v1/reputation/did:key:z6MkhaXg...?context=towow-task"`}
            </pre>
          </div>
        </section>

        {/* Data Models */}
        <section className="bg-white rounded-xl shadow-sm p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">数据模型</h2>

          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">CommitmentStatus 枚举</h3>
              <div className="flex flex-wrap gap-2">
                <span className="bg-yellow-100 text-yellow-700 px-3 py-1 rounded text-sm">PENDING</span>
                <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded text-sm">IN_PROGRESS</span>
                <span className="bg-green-100 text-green-700 px-3 py-1 rounded text-sm">COMPLETED</span>
                <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded text-sm">CANCELLED</span>
                <span className="bg-red-100 text-red-700 px-3 py-1 rounded text-sm">DISPUTED</span>
              </div>
            </div>
          </div>
        </section>

        {/* Error Codes */}
        <section className="bg-white rounded-xl shadow-sm p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">错误码</h2>
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b">
                <th className="py-2 text-gray-700">状态码</th>
                <th className="py-2 text-gray-700">说明</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b">
                <td className="py-2 font-mono text-sm">400</td>
                <td className="py-2">请求参数错误</td>
              </tr>
              <tr className="border-b">
                <td className="py-2 font-mono text-sm">401</td>
                <td className="py-2">未授权（API Key 无效或缺失）</td>
              </tr>
              <tr className="border-b">
                <td className="py-2 font-mono text-sm">404</td>
                <td className="py-2">资源不存在</td>
              </tr>
              <tr>
                <td className="py-2 font-mono text-sm">500</td>
                <td className="py-2">服务器内部错误</td>
              </tr>
            </tbody>
          </table>
        </section>
      </main>

      {/* Footer */}
      <footer className="py-8 px-4 bg-gray-900 text-gray-400 text-center mt-12">
        <p>© 2026 信契 Xenos · 链接 SecondMe 与 ToWow 的信任协议</p>
      </footer>
    </div>
  );
}
