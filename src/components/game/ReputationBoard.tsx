'use client'

import { useState, useEffect } from 'react'

interface ReputationData {
  userId: string
  score: number
  level: string
  totalCommitments: number
  fulfilledCount: number
  failedCount: number
  pendingCount: number
  fulfillmentRate: number
}

interface UserInfo {
  id: string
}

const levelConfig = [
  { level: '新人', minScore: 0, maxScore: 199, color: 'from-gray-400 to-gray-500', icon: '🌱', reward: '解锁创建承诺' },
  { level: '入门', minScore: 200, maxScore: 399, color: 'from-orange-400 to-orange-500', icon: '🌿', reward: '解锁高级任务' },
  { level: '熟练', minScore: 400, maxScore: 599, color: 'from-green-400 to-green-600', icon: '🌳', reward: '增加奖励倍数' },
  { level: '专家', minScore: 600, maxScore: 749, color: 'from-blue-400 to-blue-600', icon: '🏅', reward: '解锁专家徽章' },
  { level: '大师', minScore: 750, maxScore: 899, color: 'from-purple-400 to-purple-600', icon: '🎖️', reward: '解锁大师权限' },
  { level: '传奇', minScore: 900, maxScore: 1000, color: 'from-yellow-400 to-amber-500', icon: '👑', reward: '传奇专属称号' },
]

export default function ReputationBoard() {
  const [user, setUser] = useState<UserInfo | null>(null)
  const [reputation, setReputation] = useState<ReputationData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/user/info')
      .then(res => res.json())
      .then(result => {
        if (result.code === 0) {
          setUser(result.data)
          // 使用 secondmeUserId 作为信誉查询参数
          const userId = result.data.secondmeUserId || result.data.id
          return fetch('/api/v1/reputation?userId=' + userId)
        }
      })
      .then(res => res?.json())
      .then(result => {
        if (result?.code === 0 && result?.data) {
          setReputation(result.data)
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 p-8 text-center">
        <div className="text-4xl mb-4 animate-pulse">⭐</div>
        <div className="text-gray-500">加载信誉数据...</div>
      </div>
    )
  }

  if (!reputation) {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 p-8 text-center">
        <div className="text-6xl mb-4">🌱</div>
        <h3 className="text-lg font-medium text-gray-700 mb-2">开始你的信誉之旅</h3>
        <p className="text-gray-500">完成第一个承诺来建立你的信誉分</p>
      </div>
    )
  }

  const currentLevelIndex = levelConfig.findIndex(
    l => l.level === reputation.level
  )
  const currentLevel = levelConfig[currentLevelIndex]
  const nextLevel = levelConfig[currentLevelIndex + 1]

  const progressToNext = nextLevel
    ? ((reputation.score - currentLevel.minScore) / (nextLevel.minScore - currentLevel.minScore)) * 100
    : 100

  return (
    <div className="space-y-4">
      {/* Main Reputation Card */}
      <div className="bg-gradient-to-br from-white to-gray-50 rounded-3xl shadow-lg border border-gray-100 p-8">
        {/* Level Badge */}
        <div className="flex items-center justify-center mb-6">
          <div className={`relative`}>
            <div className={`w-32 h-32 rounded-full bg-gradient-to-br ${currentLevel.color} flex items-center justify-center shadow-xl`}>
              <div className="text-center text-white">
                <div className="text-5xl mb-1">{currentLevel.icon}</div>
                <div className="text-2xl font-bold">{reputation.level}</div>
              </div>
            </div>
            <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-white px-4 py-1 rounded-full shadow-md border border-gray-100">
              <span className="font-bold text-gray-900">{reputation.score}</span>
              <span className="text-gray-500 text-sm ml-1">分</span>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-xl p-4 text-center shadow-sm">
            <div className="text-3xl mb-1">📋</div>
            <div className="text-2xl font-bold text-gray-900">{reputation.totalCommitments}</div>
            <div className="text-xs text-gray-500">总承诺</div>
          </div>
          <div className="bg-white rounded-xl p-4 text-center shadow-sm">
            <div className="text-3xl mb-1">✅</div>
            <div className="text-2xl font-bold text-green-600">{reputation.fulfilledCount}</div>
            <div className="text-xs text-gray-500">已完成</div>
          </div>
          <div className="bg-white rounded-xl p-4 text-center shadow-sm">
            <div className="text-3xl mb-1">⏳</div>
            <div className="text-2xl font-bold text-blue-600">{reputation.pendingCount}</div>
            <div className="text-xs text-gray-500">进行中</div>
          </div>
          <div className="bg-white rounded-xl p-4 text-center shadow-sm">
            <div className="text-3xl mb-1">📊</div>
            <div className="text-2xl font-bold text-purple-600">{Math.round(reputation.fulfillmentRate * 100)}%</div>
            <div className="text-xs text-gray-500">完成率</div>
          </div>
        </div>

        {/* Progress to Next Level */}
        {nextLevel && (
          <div className="bg-white rounded-xl p-4 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">
                距离 {nextLevel.level}
              </span>
              <span className="text-sm font-bold text-blue-600">
                还需 {nextLevel.minScore - reputation.score} 分
              </span>
            </div>
            <div className="h-4 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full transition-all duration-1000 ease-out"
                style={{ width: `${progressToNext}%` }}
              />
            </div>
            <div className="flex justify-between mt-2">
              <span className="text-xs text-gray-500">{currentLevel.icon} {currentLevel.level}</span>
              <span className="text-xs text-gray-500">{nextLevel.icon} {nextLevel.level}</span>
            </div>
          </div>
        )}

        {/* Reward Hint */}
        <div className="mt-6 p-4 bg-gradient-to-r from-amber-50 to-yellow-50 rounded-xl border border-amber-100">
          <div className="flex items-center gap-2 text-amber-700">
            <span className="text-xl">🎁</span>
            <span className="font-medium">{currentLevel.reward}</span>
          </div>
        </div>
      </div>

      {/* Level Progression */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">等级进度</h3>
        <div className="space-y-3">
          {levelConfig.map((level, index) => {
            const isCurrent = level.level === reputation.level
            const isUnlocked = index <= currentLevelIndex
            const isFuture = index > currentLevelIndex

            return (
              <div
                key={level.level}
                className={`flex items-center gap-4 p-4 rounded-xl transition-all ${
                  isCurrent
                    ? 'bg-gradient-to-r from-blue-50 to-purple-50 border-2 border-blue-300'
                    : isUnlocked
                    ? 'bg-gray-50'
                    : 'bg-gray-50 opacity-50'
                }`}
              >
                <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                  isCurrent
                    ? 'bg-gradient-to-br ' + level.color + ' text-white'
                    : isUnlocked
                    ? 'bg-gray-200'
                    : 'bg-gray-100'
                }`}>
                  <span className="text-xl">{level.icon}</span>
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className={`font-semibold ${
                      isCurrent ? 'text-blue-600' : isUnlocked ? 'text-gray-900' : 'text-gray-400'
                    }`}>
                      {level.level}
                    </span>
                    {isCurrent && (
                      <span className="px-2 py-0.5 bg-blue-500 text-white text-xs rounded-full">当前</span>
                    )}
                    {!isUnlocked && <span className="text-xs text-gray-400">{level.minScore} 分解锁</span>}
                  </div>
                  <div className="text-sm text-gray-500">{level.reward}</div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium text-gray-700">{level.minScore}-{level.maxScore} 分</div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
