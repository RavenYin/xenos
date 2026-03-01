import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

/**
 * GET /api/v1/user/achievements
 * 获取用户成就数据
 */

// 成就定义
const achievementDefinitions: Record<string, { name: string; description: string; icon: string; maxProgress?: number }> = {
  first_commitment: { name: '初次承诺', description: '创建你的第一个承诺', icon: '🌱', maxProgress: 1 },
  first_fulfill: { name: '履约先锋', description: '完成第一个承诺', icon: '🏆', maxProgress: 1 },
  three_completions: { name: '渐入佳境', description: '完成 3 个承诺', icon: '⭐', maxProgress: 3 },
  ten_completions: { name: '信守承诺', description: '完成 10 个承诺', icon: '🌟', maxProgress: 10 },
  perfect_rate: { name: '完美主义', description: '保持 100% 完成率（至少完成 5 个）', icon: '💎', maxProgress: 5 },
  speed_master: { name: '效率达人', description: '在 1 小时内完成承诺', icon: '⚡', maxProgress: 1 },
  reputation_500: { name: '信誉新星', description: '信誉达到 500 分', icon: '🎯' },
  reputation_800: { name: '信誉大师', description: '信誉达到 800 分', icon: '👑' },
  streak_3: { name: '连击新手', description: '连续 3 天完成承诺', icon: '🔥', maxProgress: 3 },
  streak_7: { name: '坚持七日', description: '连续 7 天完成承诺', icon: '🌈', maxProgress: 7 },
  variety_seeker: { name: '探索者', description: '在 5 个不同上下文完成任务', icon: '🗺️', maxProgress: 5 },
  community_helper: { name: '社区贡献者', description: '累计帮助他人 20 次', icon: '🤝', maxProgress: 20 },
}

export async function GET(request: NextRequest) {
  const userId = request.cookies.get('session_user_id')?.value

  if (!userId) {
    return NextResponse.json({ code: 401, error: '未登录' }, { status: 401 })
  }

  try {
    // 获取用户承诺数据
    const commitments = await prisma.commitment.findMany({
      where: { promiserId: userId },
      orderBy: { createdAt: 'asc' },
    })

    const fulfilled = commitments.filter(c => c.status === 'FULFILLED')
    const total = commitments.length
    const failed = commitments.filter(c => c.status === 'FAILED').length
    const completed = fulfilled.length + failed
    const completionRate = completed > 0 ? fulfilled.length / completed : 0

    // 计算进度
    const progress: Record<string, number> = {
      first_commitment: Math.min(total, 1),
      first_fulfill: Math.min(fulfilled.length, 1),
      three_completions: Math.min(fulfilled.length, 3),
      ten_completions: Math.min(fulfilled.length, 10),
      perfect_rate: Math.min(completed, 5),
      speed_master: 0, // 需要记录创建和完成时间
      reputation_500: 0, // 需要计算信誉
      reputation_800: 0, // 需要计算信誉
      streak_3: 0, // 需要计算连续天数
      streak_7: 0, // 需要计算连续天数
      variety_seeker: new Set(commitments.map(c => c.context)).size,
      community_helper: 0, // 需要统计作为委托方的完成数
    }

    // 计算信誉
    const baseScore = completionRate * 700
    const quantityBonus = Math.min(fulfilled.length * 20, 200)
    const score = Math.round(Math.min(baseScore + quantityBonus, 1000))

    progress.reputation_500 = Math.min(score, 500)
    progress.reputation_800 = Math.max(0, Math.min(score, 800) - 500)

    // 计算效率达人（1小时内完成）
    fulfilled.forEach(c => {
      if (c.createdAt && c.updatedAt) {
        const hours = (new Date(c.updatedAt).getTime() - new Date(c.createdAt).getTime()) / (1000 * 60 * 60)
        if (hours <= 1) {
          progress.speed_master = 1
        }
      }
    })

    // 计算连续完成天数
    const completedDates = fulfilled
      .map(c => c.updatedAt ? new Date(c.updatedAt).toDateString() : null)
      .filter((d): d is string => d !== null)

    if (completedDates.length > 0) {
      const sortedDates = [...new Set(completedDates)].sort().reverse()
      let streak = 0
      const today = new Date().toDateString()
      let checkDate = new Date()

      for (const date of sortedDates) {
        if (date === checkDate.toDateString()) {
          streak++
          checkDate.setDate(checkDate.getDate() - 1)
        } else if (streak > 0) {
          // 允许中间有一天中断
          checkDate.setDate(checkDate.getDate() - 1)
          if (date !== checkDate.toDateString()) {
            break
          }
        }
      }
      progress.streak_3 = Math.min(streak, 3)
      progress.streak_7 = Math.min(streak, 7)
    }

    // 判断哪些成就已解锁
    const unlockedAchievements: string[] = []
    const unlockedAt: Record<string, string> = {}

    if (total >= 1) unlockedAchievements.push('first_commitment')
    if (fulfilled.length >= 1) unlockedAchievements.push('first_fulfill')
    if (fulfilled.length >= 3) unlockedAchievements.push('three_completions')
    if (fulfilled.length >= 10) unlockedAchievements.push('ten_completions')
    if (completed >= 5 && completionRate === 1) unlockedAchievements.push('perfect_rate')
    if (progress.speed_master >= 1) unlockedAchievements.push('speed_master')
    if (score >= 500) unlockedAchievements.push('reputation_500')
    if (score >= 800) unlockedAchievements.push('reputation_800')
    if (progress.streak_3 >= 3) unlockedAchievements.push('streak_3')
    if (progress.streak_7 >= 7) unlockedAchievements.push('streak_7')
    if (progress.variety_seeker >= 5) unlockedAchievements.push('variety_seeker')
    if (progress.community_helper >= 20) unlockedAchievements.push('community_helper')

    // 设置解锁时间（简化处理，使用第一个完成承诺的时间）
    if (fulfilled.length > 0) {
      const firstFulfilled = fulfilled[0].updatedAt?.toISOString()
      unlockedAchievements.forEach(id => {
        if (!unlockedAt[id]) unlockedAt[id] = firstFulfilled || new Date().toISOString()
      })
    }

    return NextResponse.json({
      code: 0,
      data: {
        achievements: unlockedAchievements,
        progress,
        unlockedAt,
        total: unlockedAchievements.length,
        maxTotal: Object.keys(achievementDefinitions).length,
      },
    })
  } catch (error: any) {
    console.error('Get achievements error:', error)
    return NextResponse.json(
      { code: 500, error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
