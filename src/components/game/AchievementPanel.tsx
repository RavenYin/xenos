'use client'

import { useState, useEffect } from 'react'

interface Achievement {
  id: string
  name: string
  description: string
  icon: string
  unlocked: boolean
  progress?: number
  maxProgress?: number
  unlockedAt?: string
}

interface UserInfo {
  id: string
}

const achievements: Omit<Achievement, 'unlocked' | 'unlockedAt'>[] = [
  {
    id: 'first_commitment',
    name: '初次承诺',
    description: '创建你的第一个承诺',
    icon: '🌱',
    maxProgress: 1,
  },
  {
    id: 'first_fulfill',
    name: '履约先锋',
    description: '完成第一个承诺',
    icon: '🏆',
    maxProgress: 1,
  },
  {
    id: 'three_completions',
    name: '渐入佳境',
    description: '完成 3 个承诺',
    icon: '⭐',
    maxProgress: 3,
  },
  {
    id: 'ten_completions',
    name: '信守承诺',
    description: '完成 10 个承诺',
    icon: '🌟',
    maxProgress: 10,
  },
  {
    id: 'perfect_rate',
    name: '完美主义',
    description: '保持 100% 完成率（至少完成 5 个）',
    icon: '💎',
    maxProgress: 5,
  },
  {
    id: 'speed_master',
    name: '效率达人',
    description: '在 1 小时内完成承诺',
    icon: '⚡',
    maxProgress: 1,
  },
  {
    id: 'reputation_500',
    name: '信誉新星',
    description: '信誉达到 500 分',
    icon: '🎯',
  },
  {
    id: 'reputation_800',
    name: '信誉大师',
    description: '信誉达到 800 分',
    icon: '👑',
  },
  {
    id: 'streak_3',
    name: '连击新手',
    description: '连续 3 天完成承诺',
    icon: '🔥',
    maxProgress: 3,
  },
  {
    id: 'streak_7',
    name: '坚持七日',
    description: '连续 7 天完成承诺',
    icon: '🌈',
    maxProgress: 7,
  },
  {
    id: 'variety_seeker',
    name: '探索者',
    description: '在 5 个不同上下文完成任务',
    icon: '🗺️',
    maxProgress: 5,
  },
  {
    id: 'community_helper',
    name: '社区贡献者',
    description: '累计帮助他人 20 次',
    icon: '🤝',
    maxProgress: 20,
  },
]

export default function AchievementPanel() {
  const [user, setUser] = useState<UserInfo | null>(null)
  const [userAchievements, setUserAchievements] = useState<Achievement[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/user/info')
      .then(res => res.json())
      .then(result => {
        if (result.code === 0) {
          setUser(result.data)
          return fetch('/api/v1/user/achievements')
        }
      })
      .then(res => res?.json())
      .then(result => {
        if (result?.code === 0 && result?.data) {
          const unlockedIds = result.data.achievements || []
          const progressData = result.data.progress || {}

          const achievementsWithStatus = achievements.map(achievement => ({
            ...achievement,
            unlocked: unlockedIds.includes(achievement.id),
            progress: progressData[achievement.id] || 0,
            maxProgress: achievement.maxProgress || 1,
            unlockedAt: result.data.unlockedAt?.[achievement.id],
          }))

          setUserAchievements(achievementsWithStatus)
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 p-8 text-center">
        <div className="text-4xl mb-4 animate-spin">🏆</div>
        <div className="text-gray-500">加载成就数据...</div>
      </div>
    )
  }

  const unlockedCount = userAchievements.filter(a => a.unlocked).length
  const totalCount = achievements.length
  const progressPercent = Math.round((unlockedCount / totalCount) * 100)

  return (
    <div className="space-y-4">
      {/* Overall Progress */}
      <div className="bg-gradient-to-br from-amber-50 to-yellow-50 rounded-3xl border border-amber-100 p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-xl font-bold text-gray-900">成就进度</h3>
            <p className="text-gray-600">解锁 {unlockedCount} / {totalCount} 个成就</p>
          </div>
          <div className="text-5xl">🏆</div>
        </div>
        <div className="h-4 bg-amber-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-amber-400 to-yellow-500 rounded-full transition-all duration-1000 ease-out"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Achievement List */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">成就列表</h3>
        <div className="space-y-3">
          {userAchievements.map(achievement => (
            <div
              key={achievement.id}
              className={`flex items-center gap-4 p-4 rounded-xl transition-all ${
                achievement.unlocked
                  ? 'bg-gradient-to-r from-amber-50 to-yellow-50 border border-amber-200'
                  : 'bg-gray-50 opacity-70'
              }`}
            >
              <div className={`w-14 h-14 rounded-xl flex items-center justify-center text-3xl ${
                achievement.unlocked
                  ? 'bg-white shadow-md'
                  : 'bg-gray-200 grayscale'
              }`}>
                {achievement.icon}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className={`font-semibold ${
                    achievement.unlocked ? 'text-gray-900' : 'text-gray-500'
                  }`}>
                    {achievement.name}
                  </span>
                  {achievement.unlocked && (
                    <span className="px-2 py-0.5 bg-amber-100 text-amber-700 text-xs rounded-full">已解锁</span>
                  )}
                </div>
                <p className="text-sm text-gray-500">{achievement.description}</p>

                {/* Progress Bar */}
                {!achievement.unlocked && achievement.maxProgress && achievement.progress !== undefined && (
                  <div className="mt-2">
                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-blue-400 to-purple-400 rounded-full transition-all duration-500 ease-out"
                        style={{ width: `${Math.min((achievement.progress / achievement.maxProgress) * 100, 100)}%` }}
                      />
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {achievement.progress} / {achievement.maxProgress}
                    </div>
                  </div>
                )}

                {achievement.unlocked && achievement.unlockedAt && (
                  <div className="text-xs text-gray-500 mt-1">
                    解锁于 {new Date(achievement.unlockedAt).toLocaleDateString('zh-CN')}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Empty State */}
      {unlockedCount === 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 p-8 text-center">
          <div className="text-6xl mb-4">🔒</div>
          <h3 className="text-lg font-medium text-gray-700 mb-2">还没有解锁任何成就</h3>
          <p className="text-gray-500">完成承诺来解锁你的第一个成就</p>
        </div>
      )}
    </div>
  )
}
