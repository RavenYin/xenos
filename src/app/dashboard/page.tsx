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

type TabType = 'profile' | 'my-delegations' | 'my-promises' | 'towow' | 'reputation'

const tabs: { key: TabType; label: string; description: string }[] = [
  { key: 'profile', label: '个人信息', description: '' },
  { key: 'my-delegations', label: '我的委托', description: '我发布的任务（ToWow、手动等）' },
  { key: 'my-promises', label: '接受的承诺', description: '我接受的任务承诺' },
  { key: 'towow', label: 'ToWow', description: 'ToWow 任务市场' },
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
          
          {activeTab === 'my-delegations' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium mb-1">我的委托</h3>
                <p className="text-sm text-gray-500 mb-4">我发布的任务，可从多个渠道发布（ToWow、手动等）</p>
              </div>
              <CommitmentForm onSuccess={() => window.location.reload()} />
              <div className="border-t pt-6">
                <CommitmentList view="delegator" />
              </div>
            </div>
          )}
          
          {activeTab === 'my-promises' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium mb-1">接受的承诺</h3>
                <p className="text-sm text-gray-500 mb-4">我接受的任务承诺</p>
              </div>
              <CommitmentList view="promiser" />
            </div>
          )}
          
          {activeTab === 'reputation' && <ReputationDisplay />}
        </div>
      </main>
    </div>
  )
}
