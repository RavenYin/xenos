/**
 * 信誉服务 - 动态上下文履约率计算
 * 核心原则：
 * 1. 无时间衰减 - 履约记录是历史事实
 * 2. 按上下文统计 - 不同场景独立计算
 * 3. 防刷规则 - 承诺者不能自证 fulfilled=true
 */

import { prisma } from './prisma'

export interface ReputationStats {
  context: string
  totalCommitments: number
  fulfilledCount: number
  failedCount: number
  pendingCount: number
  fulfillmentRate: number // 0-100
  score: number           // 0-1000
}

export interface UserReputation {
  overall: {
    totalCommitments: number
    totalFulfilled: number
    totalFailed: number
    overallRate: number
    score: number
  }
  byContext: ReputationStats[]
}

/**
 * 计算用户在某上下文中的信誉
 */
export async function calculateContextReputation(
  userId: string,
  context: string
): Promise<ReputationStats> {
  // 获取该用户在该上下文中的所有承诺
  const commitments = await prisma.commitment.findMany({
    where: {
      promiserId: userId,
      context
    },
    include: {
      attestations: true
    }
  })
  
  let fulfilledCount = 0
  let failedCount = 0
  let pendingCount = 0
  
  for (const commitment of commitments) {
    // 只有有证明的才算履约/失败
    const validAttestations = commitment.attestations.filter(a => a.fulfilled !== null)
    
    if (commitment.status === 'FULFILLED') {
      fulfilledCount++
    } else if (commitment.status === 'FAILED') {
      failedCount++
    } else if (commitment.status === 'PENDING') {
      pendingCount++
    } else if (commitment.status === 'CANCELLED') {
      // 取消的不计入统计
      continue
    }
  }
  
  const totalCommitments = fulfilledCount + failedCount + pendingCount
  const fulfillmentRate = totalCommitments > 0 
    ? (fulfilledCount / (fulfilledCount + failedCount)) * 100 
    : 0
  
  // 信誉分数计算 (0-1000)
  // 基于履约率，但有最低记录数要求
  let score = 0
  if (totalCommitments >= 3) {
    score = Math.round(fulfillmentRate * 10)
  } else if (totalCommitments > 0) {
    // 记录不足时给基础分
    score = Math.round(fulfillmentRate * 10 * (totalCommitments / 3))
  }
  
  return {
    context,
    totalCommitments,
    fulfilledCount,
    failedCount,
    pendingCount,
    fulfillmentRate: Math.round(fulfillmentRate * 10) / 10,
    score
  }
}

/**
 * 获取用户完整信誉报告
 */
export async function getUserReputation(userId: string): Promise<UserReputation> {
  // 获取所有承诺
  const commitments = await prisma.commitment.findMany({
    where: { promiserId: userId },
    select: {
      context: true,
      status: true
    }
  })
  
  // 按上下文分组
  const contextSet = new Set(commitments.map(c => c.context))
  const byContext: ReputationStats[] = []
  
  let totalFulfilled = 0
  let totalFailed = 0
  let totalPending = 0
  
  for (const context of contextSet) {
    const stats = await calculateContextReputation(userId, context)
    byContext.push(stats)
    totalFulfilled += stats.fulfilledCount
    totalFailed += stats.failedCount
    totalPending += stats.pendingCount
  }
  
  const totalCommitments = totalFulfilled + totalFailed + totalPending
  const overallRate = totalCommitments > 0 
    ? (totalFulfilled / (totalFulfilled + totalFailed)) * 100 
    : 0
  
  // 整体分数：各上下文分数的加权平均
  let overallScore = 0
  if (byContext.length > 0) {
    const totalWeight = byContext.reduce((sum, s) => sum + s.totalCommitments, 0)
    overallScore = byContext.reduce((sum, s) => {
      const weight = s.totalCommitments / totalWeight
      return sum + (s.score * weight)
    }, 0)
    overallScore = Math.round(overallScore)
  }
  
  return {
    overall: {
      totalCommitments,
      totalFulfilled,
      totalFailed,
      overallRate: Math.round(overallRate * 10) / 10,
      score: overallScore
    },
    byContext: byContext.sort((a, b) => b.totalCommitments - a.totalCommitments)
  }
}

/**
 * 获取信誉等级
 */
export function getReputationLevel(score: number): {
  level: string
  label: string
  color: string
} {
  if (score >= 900) return { level: 'legendary', label: '传奇', color: '#FFD700' }
  if (score >= 750) return { level: 'master', label: '大师', color: '#9333EA' }
  if (score >= 600) return { level: 'expert', label: '专家', color: '#2563EB' }
  if (score >= 400) return { level: 'skilled', label: '熟练', color: '#0891B2' }
  if (score >= 200) return { level: 'novice', label: '入门', color: '#65A30D' }
  return { level: 'newcomer', label: '新人', color: '#6B7280' }
}

/**
 * 检查是否可以添加履约证明
 * 防刷规则：承诺者不能自证 fulfilled=true
 */
export async function canAttest(
  commitmentId: string,
  attesterId: string,
  fulfilled: boolean
): Promise<{ canAttest: boolean; reason?: string }> {
  const commitment = await prisma.commitment.findUnique({
    where: { id: commitmentId },
    include: { attestations: true }
  })
  
  if (!commitment) {
    return { canAttest: false, reason: '承诺不存在' }
  }
  
  // 规则1：承诺者不能自证 fulfilled=true
  if (commitment.promiserId === attesterId && fulfilled === true) {
    return { canAttest: false, reason: '承诺者不能自证履约' }
  }
  
  // 规则2：同用户+同上下文只能给同承诺者1条记录
  const existingAttestation = await prisma.attestation.findFirst({
    where: {
      attesterId,
      commitment: {
        promiserId: commitment.promiserId,
        context: commitment.context
      }
    }
  })
  
  if (existingAttestation) {
    return { canAttest: false, reason: '您已为该用户在此上下文中提供过证明' }
  }
  
  return { canAttest: true }
}
