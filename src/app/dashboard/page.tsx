'use client';

import { useSession, signIn, signOut } from "next-auth/react";
import { useEffect, useState } from "react";

export default function Dashboard() {
  const { data: session, status } = useSession();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [apiKey, setApiKey] = useState<string | null>(null);

  useEffect(() => {
    if (session) {
      fetchProfile();
      fetchApiKey();
    }
  }, [session]);

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/profile');
      if (res.ok) {
        const data = await res.json();
        setProfile(data);
      }
    } catch (error) {
      console.error('Failed to fetch profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchApiKey = async () => {
    try {
      const res = await fetch('/api/user/apikey');
      if (res.ok) {
        const data = await res.json();
        setApiKey(data.apiKey);
      }
    } catch (error) {
      console.error('Failed to fetch API key:', error);
    }
  };

  const generateApiKey = async () => {
    try {
      const res = await fetch('/api/user/apikey', { method: 'POST' });
      if (res.ok) {
        const data = await res.json();
        setApiKey(data.apiKey);
      }
    } catch (error) {
      console.error('Failed to generate API key:', error);
    }
  };

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent"></div>
          <p className="mt-4 text-gray-600">加载中...</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">请先登录</h1>
          <p className="text-gray-600 mb-6">您需要登录才能访问控制台</p>
          <button
            onClick={() => signIn('secondme')}
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-lg"
          >
            登录
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-5xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <h1 className="text-2xl font-bold text-gray-900">
              信契 <span className="text-blue-600">Xenos</span>
            </h1>
            <span className="text-sm text-gray-500">控制台</span>
          </div>
          <div className="flex items-center space-x-4">
            <button
              onClick={() => window.location.href = '/'}
              className="text-gray-600 hover:text-gray-900 transition-colors"
            >
              返回首页
            </button>
            <button
              onClick={() => signOut()}
              className="text-red-600 hover:text-red-700 transition-colors"
            >
              退出登录
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-5xl mx-auto px-4 py-10">
        {/* Profile Section */}
        <section className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">个人信息</h2>
          {loading ? (
            <p className="text-gray-500">加载中...</p>
          ) : profile ? (
            <div className="flex items-start space-x-6">
              {profile.image && (
                <img
                  src={profile.image}
                  alt={profile.name || '用户头像'}
                  className="w-20 h-20 rounded-full"
                />
              )}
              <div className="flex-1">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">姓名</p>
                    <p className="text-gray-900 font-medium">{profile.name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">邮箱</p>
                    <p className="text-gray-900 font-medium">{profile.email}</p>
                  </div>
                  {profile.secondMeId && (
                    <div>
                      <p className="text-sm text-gray-500">SecondMe ID</p>
                      <p className="text-gray-900 font-mono text-sm">{profile.secondMeId}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <p className="text-gray-500">暂无个人信息</p>
          )}
        </section>

        {/* API Key Section */}
        <section className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">ToWow 集成 API Key</h2>
          <p className="text-gray-600 mb-4">
            使用此 API Key 在您的 ToWow 应用或 Agent 中调用信契的信任协议 API。
          </p>
          
          {apiKey ? (
            <div className="bg-gray-100 p-4 rounded-lg border border-gray-300">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-700">您的 API Key</span>
                <button
                  onClick={() => navigator.clipboard.writeText(apiKey)}
                  className="text-sm text-blue-600 hover:text-blue-700"
                >
                  复制
                </button>
              </div>
              <code className="text-gray-900 font-mono text-sm break-all">{apiKey}</code>
            </div>
          ) : (
            <button
              onClick={generateApiKey}
              className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-lg"
            >
              生成 API Key
            </button>
          )}

          <div className="mt-6 pt-6 border-t border-gray-200">
            <h3 className="font-semibold text-gray-900 mb-3">API 使用示例</h3>
            <pre className="bg-gray-900 text-green-400 p-4 rounded-lg overflow-x-auto text-sm">
{`curl -X POST https://xenos.network/api/v1/commitments \\
  -H "Authorization: Bearer ${apiKey || 'YOUR_API_KEY'}" \\
  -H "Content-Type: application/json" \\
  -d '{
    "to": "did:key:example...",
    "context": "towow-task",
    "task": "Deploy website within 24h"
  }'`}
            </pre>
          </div>
        </section>

        {/* Trust Stats */}
        <section className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">信任数据</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600">0</div>
              <div className="text-gray-600 text-sm">已创建承诺</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600">0</div>
              <div className="text-gray-600 text-sm">已完成履约</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-indigo-600">100%</div>
              <div className="text-gray-600 text-sm">履约率</div>
            </div>
          </div>
          <p className="text-sm text-gray-500 mt-4">
            * 数据将在与 ToWow 集成后实时更新
          </p>
        </section>

        {/* ToWow Integration */}
        <section className="bg-gradient-to-r from-indigo-600 to-blue-600 rounded-xl shadow-sm p-6 text-white">
          <h2 className="text-xl font-semibold mb-4">与 ToWow 的集成</h2>
          <ul className="space-y-2">
            <li className="flex items-start">
              <span className="mr-2">✓</span>
              <span>SecondMe 身份认证，确保participant真实可信</span>
            </li>
            <li className="flex items-start">
              <span className="mr-2">✓</span>
              <span>任务分发时自动创建不可篡改的承诺记录</span>
            </li>
            <li className="flex items-start">
              <span className="mr-2">✓</span>
              <span>任务完成后生成可验证的履约证明</span>
            </li>
            <li className="flex items-start">
              <span className="mr-2">✓</span>
              <span>基于历史履约记录的动态信誉评分</span>
            </li>
          </ul>
          <div className="mt-6">
            <a
              href="/api-docs"
              className="inline-block bg-white text-indigo-600 font-medium py-2 px-6 rounded-lg hover:bg-gray-100 transition-colors"
            >
              查看 API 文档
            </a>
          </div>
        </section>
      </main>
    </div>
  );
}