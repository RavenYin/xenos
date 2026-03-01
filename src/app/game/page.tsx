'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import GameHero from '@/components/game/GameHero'
import CommitmentQuest from '@/components/game/CommitmentQuest'
import ReputationBoard from '@/components/game/ReputationBoard'
import AchievementPanel from '@/components/game/AchievementPanel'

interface UserInfo {
  id: string
  name: string
  email: string
  avatarUrl?: string
}

type TabType = 'quest' | 'reputation' | 'achievements'

const tabs: { key: TabType; label: string; icon: string }[] = [
  { key: 'quest', label: '任务', icon: '⚔️' },
  { key: 'reputation', label: '信誉', icon: '⭐' },
  { key: 'achievements', label: '成就', icon: '🏆' },
]

export default function GamePage() {
  const router = useRouter()
  const [user, setUser] = useState<UserInfo | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<TabType>('quest')

  useEffect(() => {
    fetch('/api/user/info')
      .then(res => res.json())
      .then(result => {
        if (result.code === 0) {
          setUser(result.data)
        } else {
          router.push('/api/auth/login')
        }
      })
      .catch(() => router.push('/api/auth/login'))
      .finally(() => setLoading(false))
  }, [router])

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' })
    router.push('/game')
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50">
        <div className="text-center">
          <div className="text-4xl mb-4 animate-bounce">🎮</div>
          <div className="text-gray-600">正在载入游戏...</div>
        </div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Game Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-100 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🎯</span>
            <div>
              <h1 className="text-lg font-bold text-gray-900">Xenos 承诺游戏</h1>
              <p className="text-xs text-gray-500">建立你的信誉值</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-gray-100 rounded-full px-3 py-1.5">
              {user.avatarUrl && (
                <img
                  src={user.avatarUrl}
                  alt={user.name}
                  className="w-6 h-6 rounded-full"
                />
              )}
              <span className="text-sm font-medium text-gray-700">{user.name}</span>
            </div>
            <button
              onClick={handleLogout}
              className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
            >
              退出
            </button>
          </div>
        </div>
      </header>

      {/* Game Content */}
      <main className="max-w-4xl mx-auto px-4 py-6">
        {/* Hero Section */}
        <GameHero user={user} />

        {/* Tab Navigation */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-1.5 flex gap-1 mb-6">
          {tabs.map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                activeTab === tab.key
                  ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-md'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <span className="text-lg">{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="min-h-[400px]">
          {activeTab === 'quest' && (
            <div className="space-y-4">
              <CommitmentQuest />
            </div>
          )}

          {activeTab === 'reputation' && (
            <div className="space-y-4">
              <ReputationBoard />
            </div>
          )}

          {activeTab === 'achievements' && (
            <div className="space-y-4">
              <AchievementPanel />
            </div>
          )}
        </div>
      </main>

      {/* Floating Decorations */}
      <div className="fixed bottom-4 left-4 text-6xl opacity-20 pointer-events-none">🏆</div>
      <div className="fixed top-1/3 right-4 text-4xl opacity-20 pointer-events-none">⭐</div>
    </div>
  )
}
