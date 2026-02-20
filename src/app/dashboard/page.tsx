'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import UserProfile from '@/components/UserProfile'
import ShadesList from '@/components/ShadesList'
import SoftMemoryList from '@/components/SoftMemoryList'
import ChatWindow from '@/components/ChatWindow'
import NoteEditor from '@/components/NoteEditor'
import CommitmentList from '@/components/CommitmentList'
import CommitmentForm from '@/components/CommitmentForm'
import ReputationDisplay from '@/components/ReputationDisplay'

interface UserInfo {
  id: string
  name: string
  email: string
  avatarUrl?: string
}

type TabType = 'profile' | 'shades' | 'memory' | 'chat' | 'note' | 'commitment' | 'reputation'

const tabs: { key: TabType; label: string }[] = [
  { key: 'profile', label: '个人信息' },
  { key: 'commitment', label: '承诺' },
  { key: 'reputation', label: '信誉' },
  { key: 'shades', label: '兴趣标签' },
  { key: 'memory', label: '软记忆' },
  { key: 'chat', label: '聊天' },
  { key: 'note', label: '笔记' },
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
          {activeTab === 'commitment' && (
            <div className="space-y-6">
              <CommitmentForm onSuccess={() => window.location.reload()} />
              <div className="border-t pt-6">
                <h3 className="text-lg font-medium mb-4">我的承诺</h3>
                <CommitmentList />
              </div>
            </div>
          )}
          {activeTab === 'reputation' && <ReputationDisplay />}
          {activeTab === 'shades' && <ShadesList />}
          {activeTab === 'memory' && <SoftMemoryList />}
          {activeTab === 'chat' && <ChatWindow />}
          {activeTab === 'note' && <NoteEditor />}
        </div>
      </main>
    </div>
  )
}
