'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import UserProfile from '@/components/UserProfile'
import CommitmentList from '@/components/CommitmentList'
import CommitmentForm from '@/components/CommitmentForm'
import ReputationDisplay from '@/components/ReputationDisplay'

interface UserInfo {
  id: string
  name: string
  email: string
  avatarUrl?: string
}

type TabType = 'profile' | 'my-promises' | 'delegated' | 'reputation'

const tabs: { key: TabType; label: string; description: string }[] = [
  { key: 'profile', label: '个人信息', description: '' },
  { key: 'my-promises', label: '我承诺的', description: '我向别人承诺的任务' },
  { key: 'delegated', label: '委托我的', description: '别人承诺帮我完成的任务' },
  { key: 'reputation', label: '信誉', description: '' },
]

export default function Dashboard() {
  const router = useRouter()
  const [user, setUser] = useState<UserInfo | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<TabType>('profile')

  useEffect(() => {
    fetch('/api/user/info')
      .then(res => res.json())
      .then(result => {
        if (result.code === 0) {
          setUser(result.data)
        } else {
          router.push('/')
        }
      })
      .catch(() => router.push('/'))
      .finally(() => setLoading(false))
  }, [router])

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' })
    router.push('/')
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-gray-500">加载中...</div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="text-xl font-semibold text-gray-900">Xenos</h1>
            <span className="text-sm text-gray-500">可验证承诺证明</span>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
              {user.avatarUrl && (
                <img 
                  src={user.avatarUrl} 
                  alt={user.name} 
                  className="w-8 h-8 rounded-full"
                />
              )}
              <span className="text-gray-700">{user.name}</span>
            </div>
            <button 
              onClick={handleLogout}
              className="btn-secondary text-sm"
            >
              退出登录
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-6 py-8">
        {/* Tabs */}
        <div className="flex gap-2 mb-8 border-b border-gray-200">
          {tabs.map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-4 py-3 text-sm font-medium transition-colors border-b-2 -mb-px ${
                activeTab === tab.key
                  ? 'text-primary-600 border-primary-600'
                  : 'text-gray-500 border-transparent hover:text-gray-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="card">
          {activeTab === 'profile' && <UserProfile user={user} />}
          
          {activeTab === 'my-promises' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium mb-1">我承诺的</h3>
                <p className="text-sm text-gray-500 mb-4">我向别人承诺要完成的任务</p>
              </div>
              <CommitmentForm onSuccess={() => window.location.reload()} />
              <div className="border-t pt-6">
                <CommitmentList view="promiser" />
              </div>
            </div>
          )}
          
          {activeTab === 'delegated' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium mb-1">委托我的</h3>
                <p className="text-sm text-gray-500 mb-4">别人承诺帮我完成的任务</p>
              </div>
              <CommitmentList view="delegator" />
            </div>
          )}
          
          {activeTab === 'reputation' && <ReputationDisplay />}
        </div>
      </main>
    </div>
  )
}
