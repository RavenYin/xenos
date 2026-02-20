/**
 * Xenos VCA SDK
 * 可验证承诺证明 SDK - 供外部应用调用
 * 
 * 术语说明：
 * - 执行方 (executor): 承诺完成任务的人
 * - 委托方 (delegator): 委托任务、等待完成的人
 * - 验收方 (verifier): 验收承诺是否完成的人（通常是委托方）
 * 
 * 使用方式：
 * 1. REST API: POST https://xenos.io/api/v1/commitment
 * 2. NPM 包: npm install @xenos/vca-sdk
 */

import { prisma } from '@/lib/prisma'

// ============ 类型定义 ============

/**
 * 创建承诺参数
 */
export interface CreateCommitmentParams {
  executorId: string       // 执行方 ID（承诺完成任务的人）
  delegatorId?: string     // 委托方 ID（委托任务的人）
  task: string             // 承诺内容
  deadline?: string        // 截止时间 ISO 格式
  context?: string         // 来源上下文，如 "towow", "secondme", "manual"
  metadata?: Record<string, any>  // 附加元数据
  externalId?: string      // 外部系统 ID（如 ToWow taskId）
}

/**
 * 承诺结果
 */
export interface CommitmentResult {
  id: string
  executorId: string       // 执行方
  delegatorId?: string     // 委托方
  task: string
  status: 'PENDING' | 'FULFILLED' | 'FAILED' | 'CANCELLED'
  deadline?: string
  context: string
  source: string
  externalId?: string
  createdAt: string
}

/**
 * 创建验收参数
 */
export interface CreateVerificationParams {
  commitmentId: string
  verifierId: string       // 验收方 ID
  fulfilled: boolean       // 是否履约
  evidence?: string        // 证据链接
  comment?: string         // 备注
}

/**
 * 验收结果
 */
export interface VerificationResult {
  id: string
  commitmentId: string
  verifierId: string
  fulfilled: boolean
  evidence?: string
  comment?: string
  createdAt: string
}

export interface ReputationResult {
  userId: string
  score: number           // 0-1000
  level: string           // 新人/入门/熟练/专家/大师/传奇
  totalCommitments: number
  fulfilledCount: number
  failedCount: number
  pendingCount: number
  fulfillmentRate: number // 0-1
}

// ============ SDK 核心类 ============

export class VCA_SDK {
  
  /**
   * 创建承诺
   * 
   * @example
   * ```typescript
   * // ToWow 协商成功后创建承诺
   * await sdk.createCommitment({
   *   executorId: 'towow:user:123',   // 接单的人（执行方）
   *   delegatorId: 'towow:user:456',  // 发布任务的人（委托方）
   *   task: '完成登录页面开发',
   *   deadline: '2026-02-25T18:00:00Z',
   *   context: 'towow',
   *   externalId: 'towow_task_789'
   * })
   * ```
   */
  async createCommitment(params: CreateCommitmentParams): Promise<CommitmentResult> {
    if (!params.executorId) {
      throw new Error('executorId is required')
    }
    if (!params.task) {
      throw new Error('task is required')
    }

    const executor = await this.findOrCreateUser(params.executorId)
    let delegator = null
    if (params.delegatorId) {
      delegator = await this.findOrCreateUser(params.delegatorId)
    }

    const commitment = await prisma.commitment.create({
      data: {
        promiserId: executor.id,
        receiverId: delegator?.id || null,
        task: params.task,
        deadline: params.deadline ? new Date(params.deadline) : null,
        context: params.context || 'api',
        towowTaskId: params.externalId || null,
      } as any
    })

    await this.logAudit('create_commitment', params.executorId, 'commitment', commitment.id, params)

    return {
      id: commitment.id,
      executorId: executor.id,
      delegatorId: delegator?.id || undefined,
      task: commitment.task,
      status: commitment.status as CommitmentResult['status'],
      deadline: commitment.deadline?.toISOString() || undefined,
      context: commitment.context,
      source: params.context || 'api',
      externalId: (commitment as any).towowTaskId || undefined,
      createdAt: commitment.createdAt.toISOString()
    }
  }

  /**
   * 获取承诺详情
   */
  async getCommitment(id: string): Promise<CommitmentResult | null> {
    const commitment = await prisma.commitment.findUnique({
      where: { id }
    })

    if (!commitment) return null

    return {
      id: commitment.id,
      executorId: commitment.promiserId,
      delegatorId: commitment.receiverId || undefined,
      task: commitment.task,
      status: commitment.status as CommitmentResult['status'],
      deadline: commitment.deadline?.toISOString() || undefined,
      context: commitment.context,
      source: 'api',
      externalId: (commitment as any).towowTaskId || undefined,
      createdAt: commitment.createdAt.toISOString()
    }
  }

  /**
   * 列出我执行的承诺
   */
  async listMyExecutions(params: {
    executorId: string
    status?: string
    limit?: number
    offset?: number
  }): Promise<{ commitments: CommitmentResult[]; total: number }> {
    const user = await this.findUser(params.executorId)
    if (!user) return { commitments: [], total: 0 }

    const where: any = { promiserId: user.id }
    if (params.status) where.status = params.status

    const [commitments, total] = await Promise.all([
      prisma.commitment.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take: params.limit || 20,
        skip: params.offset || 0
      }),
      prisma.commitment.count({ where })
    ])

    return {
      commitments: commitments.map(c => ({
        id: c.id,
        executorId: c.promiserId,
        delegatorId: c.receiverId || undefined,
        task: c.task,
        status: c.status as CommitmentResult['status'],
        deadline: c.deadline?.toISOString() || undefined,
        context: c.context,
        source: 'api',
        externalId: (c as any).towowTaskId || undefined,
        createdAt: c.createdAt.toISOString()
      })),
      total
    }
  }

  /**
   * 列出我委托的承诺
   */
  async listMyDelegations(params: {
    delegatorId: string
    status?: string
    limit?: number
    offset?: number
  }): Promise<{ commitments: CommitmentResult[]; total: number }> {
    const user = await this.findUser(params.delegatorId)
    if (!user) return { commitments: [], total: 0 }

    const where: any = { receiverId: user.id }
    if (params.status) where.status = params.status

    const [commitments, total] = await Promise.all([
      prisma.commitment.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take: params.limit || 20,
        skip: params.offset || 0
      }),
      prisma.commitment.count({ where })
    ])

    return {
      commitments: commitments.map(c => ({
        id: c.id,
        executorId: c.promiserId,
        delegatorId: c.receiverId || undefined,
        task: c.task,
        status: c.status as CommitmentResult['status'],
        deadline: c.deadline?.toISOString() || undefined,
        context: c.context,
        source: 'api',
        externalId: (c as any).towowTaskId || undefined,
        createdAt: c.createdAt.toISOString()
      })),
      total
    }
  }

  /**
   * 验收承诺（添加履约证明）
   * 
   * @example
   * ```typescript
   * // 委托方验收承诺
   * await sdk.verifyCommitment({
   *   commitmentId: 'xxx',
   *   verifierId: 'towow:user:456',  // 委托方验收
   *   fulfilled: true,
   *   comment: '完成得很好'
   * })
   * ```
   */
  async verifyCommitment(params: CreateVerificationParams): Promise<VerificationResult> {
    const commitment = await prisma.commitment.findUnique({
      where: { id: params.commitmentId }
    })

    if (!commitment) {
      throw new Error('Commitment not found')
    }

    const verifier = await this.findOrCreateUser(params.verifierId)

    const attestation = await prisma.attestation.create({
      data: {
        commitmentId: params.commitmentId,
        attesterId: verifier.id,
        fulfilled: params.fulfilled,
        evidence: params.evidence || null,
        comment: params.comment || null
      }
    })

    // 更新承诺状态
    if (params.fulfilled && commitment.status === 'PENDING') {
      await prisma.commitment.update({
        where: { id: params.commitmentId },
        data: { status: 'FULFILLED' }
      })
    } else if (!params.fulfilled && commitment.status === 'PENDING') {
      await prisma.commitment.update({
        where: { id: params.commitmentId },
        data: { status: 'FAILED' }
      })
    }

    await this.logAudit('verify_commitment', params.verifierId, 'attestation', attestation.id, params)

    return {
      id: attestation.id,
      commitmentId: attestation.commitmentId,
      verifierId: verifier.id,
      fulfilled: attestation.fulfilled,
      evidence: attestation.evidence || undefined,
      comment: attestation.comment || undefined,
      createdAt: attestation.createdAt.toISOString()
    }
  }

  /**
   * 获取用户信誉
   */
  async getReputation(userId: string): Promise<ReputationResult> {
    const user = await this.findUser(userId)
    if (!user) {
      return {
        userId,
        score: 0,
        level: '新人',
        totalCommitments: 0,
        fulfilledCount: 0,
        failedCount: 0,
        pendingCount: 0,
        fulfillmentRate: 0
      }
    }

    const commitments = await prisma.commitment.findMany({
      where: { promiserId: user.id },
      select: { status: true }
    })

    const totalCommitments = commitments.length
    const fulfilledCount = commitments.filter(c => c.status === 'FULFILLED').length
    const failedCount = commitments.filter(c => c.status === 'FAILED').length
    const pendingCount = commitments.filter(c => c.status === 'PENDING').length

    const completedCount = fulfilledCount + failedCount
    const fulfillmentRate = completedCount > 0 ? fulfilledCount / completedCount : 0

    const baseScore = fulfillmentRate * 700
    const quantityBonus = Math.min(fulfilledCount * 20, 200)
    const score = Math.round(Math.min(baseScore + quantityBonus, 1000))

    return {
      userId: user.id,
      score,
      level: this.getLevel(score),
      totalCommitments,
      fulfilledCount,
      failedCount,
      pendingCount,
      fulfillmentRate: Math.round(fulfillmentRate * 100) / 100
    }
  }

  // ============ 私有方法 ============

  private async findUser(externalId: string) {
    return await prisma.user.findFirst({
      where: {
        OR: [
          { id: externalId },
          { secondmeUserId: externalId }
        ]
      }
    })
  }

  private async findOrCreateUser(externalId: string) {
    let user = await this.findUser(externalId)
    
    if (!user) {
      user = await prisma.user.create({
        data: {
          secondmeUserId: externalId,
          accessToken: `sdk_${Date.now()}`,
          refreshToken: `sdk_refresh_${Date.now()}`,
          tokenExpiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
        }
      })
    }

    return user
  }

  private getLevel(score: number): string {
    if (score >= 900) return '传奇'
    if (score >= 750) return '大师'
    if (score >= 600) return '专家'
    if (score >= 400) return '熟练'
    if (score >= 200) return '入门'
    return '新人'
  }

  private async logAudit(action: string, actorId: string, targetType: string, targetId: string, payload: any) {
    try {
      await prisma.auditLog.create({
        data: {
          action,
          actorId,
          targetType,
          targetId,
          payload: JSON.stringify(payload)
        }
      })
    } catch (e) {
      console.error('Audit log failed:', e)
    }
  }
}

// ============ 单例导出 ============

let sdkInstance: VCA_SDK | null = null

export function getVCA_SDK(): VCA_SDK {
  if (!sdkInstance) {
    sdkInstance = new VCA_SDK()
  }
  return sdkInstance
}
