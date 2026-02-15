'use client';

import { useSession, signOut } from "next-auth/react";
import { useEffect, useState } from "react";

export default function Home() {
  const { data: session, status } = useSession();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  // Generate random state for OAuth
  const generateState = () => {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  };

  const handleSignIn = () => {
    // Ensure we're in browser
    if (typeof window === 'undefined') return;
    
    const clientId = process.env.NEXT_PUBLIC_SECONDME_CLIENT_ID || '79127965-7c40-4609-9862-15933fa9712e';
    const redirectUri = `http://localhost:3001/api/auth/callback/secondme`;
    const state = generateState();
    
    // Store state in sessionStorage for verification
    sessionStorage.setItem('oauth_state', state);
    
    // Build OAuth URL
    const params = new URLSearchParams({
      client_id: clientId,
      redirect_uri: redirectUri,
      response_type: 'code',
      scope: 'user.info',
      state: state,
    });
    
    const authUrl = `https://go.second.me/oauth/?${params.toString()}`;
    console.log('Redirecting to:', authUrl);
    
    // Direct redirect
    window.location.href = authUrl;
  };

  useEffect(() => {
    if (session) {
      fetchProfile();
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

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent"></div>
          <p className="mt-4 text-gray-600">加载中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Hero Section */}
      <header className="py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            信契 <span className="text-blue-600">Xenos</span>
          </h1>
          <p className="text-xl text-gray-700 mb-4 leading-relaxed max-w-2xl mx-auto">
            链接信任与履约的去中心化协议
          </p>
          <p className="text-lg text-gray-600 mb-10 max-w-xl mx-auto">
            基于 SecondMe 身份认证，为 ToWow 生态提供不可篡改的信任基础设施
          </p>
          
          {!session ? (
            <button
              onClick={handleSignIn}
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-4 px-10 rounded-xl text-lg shadow-lg transition-all transform hover:scale-105"
            >
              使用 SecondMe 登录体验
            </button>
          ) : (
            <div className="space-y-4">
              <p className="text-green-600 font-medium">✅ 已登录为 {profile?.name || '用户'}</p>
              <button
                onClick={() => window.location.href = '/dashboard'}
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-8 rounded-lg shadow transition-colors"
              >
                进入控制台
              </button>
            </div>
          )}
        </div>
      </header>

      {/* Value Proposition */}
      <section className="py-16 px-4 bg-white bg-opacity-60">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            为什么选择信契？
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <FeatureCard
              icon="🔐"
              title="可信身份"
              description="基于 SecondMe 的 OAuth 2.0 认证，确保每个用户都是真实可信的"
            />
            <FeatureCard
              icon="📝"
              title="履约可证"
              description="所有承诺和履约记录上链存证，不可篡改，完全可审计"
            />
            <FeatureCard
              icon="🤝"
              title="无缝集成"
              description="与 ToWow 深度集成，任务分发生成承诺，完成自动记录"
            />
          </div>
        </div>
      </section>

      {/* Philosophy */}
      <section className="py-16 px-4">
        <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-lg p-10">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
            设计理念：一诺立信，万物可协
          </h2>
          <blockquote className="text-lg text-gray-700 italic border-l-4 border-blue-500 pl-6 mb-6">
            不是用代码约束行为，而是用共识记录履约。
          </blockquote>
          <p className="text-gray-600 leading-relaxed mb-4">
            信契出自《周礼》《管子》，是中国最早的契约精神表述。在数字时代，我们把"契约"演化为可验证的数字承诺——每一次任务的完成，都是一份可审计的履约证明。
          </p>
          <p className="text-gray-600 leading-relaxed">
            我们不依赖中心化的信用评分，而是让每个Agent的声誉来自其历史履约记录。这些记录由SecondMe认证身份，由区块链存证，由ToWow实际调用——构成了完整的信任闭环。
          </p>
        </div>
      </section>

      {/* Tech Stack */}
      <section className="py-16 px-4 bg-white bg-opacity-60">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-10">
            技术架构
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            <TechItem label="前端框架" value="Next.js 14 (App Router)" />
            <TechItem label="身份认证" value="NextAuth.js + SecondMe OAuth2" />
            <TechItem label="数据存储" value="PostgreSQL + Prisma ORM" />
            <TechItem label="存证方案" value="链下可验证凭证 (VC)" />
            <TechItem label="设计原则" value="亮色主题 · 简约优雅 · 中文界面" />
            <TechItem label="目标生态" value="ToWow Agent 网络" />
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            准备好构建信任网络了吗？
          </h2>
          <p className="text-gray-600 mb-8">
            无论是开发者还是用户，信契都为您提供简单、可信的信任解决方案。
          </p>
          {!session ? (
            <button
              onClick={handleSignIn}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold py-4 px-12 rounded-xl text-lg shadow-lg transition-all"
            >
              立即开始体验
            </button>
          ) : (
            <div className="space-x-4">
              <button
                onClick={() => window.location.href = '/dashboard'}
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-8 rounded-lg shadow transition-colors"
              >
                查看控制台
              </button>
              <button
                onClick={() => signOut()}
                className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-3 px-8 rounded-lg shadow transition-colors"
              >
                退出
              </button>
            </div>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 bg-gray-900 text-gray-400 text-center">
        <p>© 2026 信契 Xenos · 链接 SecondMe 与 ToWow 的信任协议</p>
        <p className="text-sm mt-2">
          <a href="/api-docs" className="hover:text-white transition-colors">API 文档</a>
          {' · '}
          <a href="https://github.com" target="_blank" className="hover:text-white transition-colors">GitHub</a>
        </p>
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: string; title: string; description: string }) {
  return (
    <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow">
      <div className="text-4xl mb-4">{icon}</div>
      <h3 className="text-xl font-semibold text-gray-900 mb-3">{title}</h3>
      <p className="text-gray-600 leading-relaxed">{description}</p>
    </div>
  );
}

function TechItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between items-center py-2 border-b border-gray-200">
      <span className="text-gray-600">{label}</span>
      <span className="font-medium text-gray-900 text-right">{value}</span>
    </div>
  );
}