'use client'

import { useState, useEffect } from 'react'

interface UserInfo {
  id: string
  name: string
}

interface ReputationData {
  score: number
  level: string
  totalCommitments: number
  fulfilledCount: number
  fulfillmentRate: number
}

export default function GameHero({ user }: { user: UserInfo }) {
  const [reputation, setReputation] = useState<ReputationData | null>(null)

  useEffect(() => {
    fetch('/api/v1/reputation?userId=' + user.id)
      .then(res => res.json())
      .then(result => {
        if (result.code === 0 && result.data) {
          setReputation(result.data)
        }
      })
      .catch(console.error)
  }, [user.id])

  const levelEmoji: Record<string, string> = {
    '新人': '🌱',
    '入门': '🌿',
    '熟练': '🌳',
    '专家': '🏅',
    '大师': '🎖️',
    '传奇': '👑',
  }

  const getLevelColor = (level: string) => {
    switch (level) {
      case '传奇': return 'from-yellow-400 to-amber-500'
      case '大师': return 'from-purple-400 to-purple-600'
      case '专家': return 'from-blue-400 to-blue-600'
      case '熟练': return 'from-green-400 to-green-600'
      case '入门': return 'from-orange-400 to-orange-500'
      default: return 'from-gray-400 to-gray-500'
    }
  }

  return (
    <div className="bg-gradient-to-br from-white to-gray-50 rounded-3xl shadow-lg border border-gray-100 p-6 mb-6">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            欢迎回来，{user.name}！
          </h2>
          <p className="text-gray-600 mb-4">
            完成承诺，建立你的信誉，解锁更多成就
          </p>

          {reputation && (
            <div className="flex items-center gap-4">
              <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r ${getLevelColor(reputation.level)} text-white shadow-md`}>
                <span className="text-xl">{levelEmoji[reputation.level] || '🌱'}</span>
                <span className="font-bold">{reputation.level}</span>
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <span className="text-xl">⭐</span>
                <span className="font-semibold text-lg">{reputation.score}</span>
                <span className="text-sm">信誉分</span>
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <span className="text-xl">✅</span>
                <span className="font-semibold text-lg">{reputation.fulfilledCount}</span>
                <span className="text-sm">已完成</span>
              </div>
            </div>
          )}
        </div>

        <div className="text-8xl animate-pulse">🎯</div>
      </div>

      {/* Progress Bar */}
      {reputation && (
        <div className="mt-6 pt-6 border-t border-gray-100">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">完成率</span>
            <span className="text-sm font-bold text-blue-600">
              {Math.round(reputation.fulfillmentRate * 100)}%
            </span>
          </div>
          <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full transition-all duration-1000 ease-out"
              style={{ width: `${reputation.fulfillmentRate * 100}%` }}
            />
          </div>
        </div>
      )}
    </div>
  )
}
