/**
 * Xenos VCA SDK
 * 可验证承诺证明 SDK - 供外部应用调用
 * 
 * 术语说明：
 * - 承诺方 (promiser): 承诺完成任务的人（接任务）
 * - 委托方 (delegator): 发布任务、等待完成的人（发任务）
 * 
 * 流程：
 * 1. 委托方 发起承诺请求 → PENDING_ACCEPT
 * 2. 承诺方 接受 → ACCEPTED（开始履约）
 * 3. 承诺方 履约完成 → 提交履约
 * 4. 委托方 验收 → FULFILLED/FAILED
 * 
 * 使用方式：
 * 1. REST API: POST https://xenos.io/api/v1/commitment
 * 2. NPM 包: npm install @xenos/vca-sdk
 */

import { prisma } from '@/lib/prisma'

// ============ 类型定义 ============

/**
 * 承诺状态
 */
export type CommitmentStatus = 
  | 'PENDING_ACCEPT'  // 待承诺方确认
  | 'ACCEPTED'        // 已接受，履约中
  | 'REJECTED'        // 已拒绝
  | 'PENDING'         // 履约中（旧状态，兼容）
  | 'FULFILLED'       // 已完成
  | 'FAILED'          // 失败
  | 'CANCELLED'       // 已取消

/**
 * 创建承诺参数（委托方发起）
 */
export interface CreateCommitmentParams {
  promiserId: string       // 承诺方 ID（接任务的人）
  delegatorId: string      // 委托方 ID（发任务的人）
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
  promiserId: string       // 承诺方
  delegatorId: string      // 委托方
  task: string
  status: CommitmentStatus
  deadline?: string
  context: string
  source: string
  externalId?: string
  createdAt: string
  updatedAt: string
}

/**
 * 验收参数
 */
export interface CreateVerificationParams {
  commitmentId: string
  verifierId: string       // 验收方 ID（通常是委托方）
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

/**
 * 信誉结果
 */
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
   * 委托方发起承诺请求
   * 
   * @example
   * ```typescript
   * // ToWow 协商成功后，委托方发起承诺
   * await sdk.createCommitment({
   *   promiserId: 'user_123',      // 接任务的人（承诺方）
   *   delegatorId: 'user_456',     // 发布任务的人（委托方）
   *   task: '完成登录页面开发',
   *   deadline: '2026-02-25T18:00:00Z',
   *   context: 'towow',
   *   externalId: 'towow_task_789'
   * })
   * ```
   */
  async createCommitment(params: CreateCommitmentParams): Promise<CommitmentResult> {
    if (!params.promiserId) {
      throw new Error('promiserId is required')
    }
    if (!params.delegatorId) {
      throw new Error('delegatorId is required')
    }
    if (!params.task) {
      throw new Error('task is required')
    }

    const promiser = await this.findOrCreateUser(params.promiserId)
    const delegator = await this.findOrCreateUser(params.delegatorId)

    const commitment = await prisma.commitment.create({
      data: {
        promiserId: promiser.id,
        receiverId: delegator.id,
        task: params.task,
        deadline: params.deadline ? new Date(params.deadline) : null,
        context: params.context || 'api',
        source: params.context || 'api',
        towowTaskId: params.externalId || null,
        status: 'PENDING_ACCEPT', // 新建时等待承诺方确认
      } as any
    })

    await this.logAudit('create_commitment', params.delegatorId, 'commitment', commitment.id, params)

    return this.formatCommitment(commitment, promiser.id, delegator.id)
  }

  /**
   * 承诺方接受承诺
   */
  async acceptCommitment(commitmentId: string, promiserId: string): Promise<CommitmentResult> {
    const commitment = await prisma.commitment.findUnique({
      where: { id: commitmentId }
    })

    if (!commitment) {
      throw new Error('Commitment not found')
    }

    const user = await this.findUser(promiserId)
    if (!user || commitment.promiserId !== user.id) {
      throw new Error('Not authorized to accept this commitment')
    }

    if (commitment.status !== 'PENDING_ACCEPT') {
      throw new Error(`Cannot accept commitment with status ${commitment.status}`)
    }

    const updated = await prisma.commitment.update({
      where: { id: commitmentId },
      data: { status: 'ACCEPTED' }
    })

    await this.logAudit('accept_commitment', promiserId, 'commitment', commitmentId, {})

    return this.formatCommitment(updated, commitment.promiserId, commitment.receiverId || undefined)
  }

  /**
   * 承诺方拒绝承诺
   */
  async rejectCommitment(commitmentId: string, promiserId: string, reason?: string): Promise<CommitmentResult> {
    const commitment = await prisma.commitment.findUnique({
      where: { id: commitmentId }
    })

    if (!commitment) {
      throw new Error('Commitment not found')
    }

    const user = await this.findUser(promiserId)
    if (!user || commitment.promiserId !== user.id) {
      throw new Error('Not authorized to reject this commitment')
    }

    if (commitment.status !== 'PENDING_ACCEPT') {
      throw new Error(`Cannot reject commitment with status ${commitment.status}`)
    }

    const updated = await prisma.commitment.update({
      where: { id: commitmentId },
      data: { status: 'REJECTED' }
    })

    await this.logAudit('reject_commitment', promiserId, 'commitment', commitmentId, { reason })

    return this.formatCommitment(updated, commitment.promiserId, commitment.receiverId || undefined)
  }

  /**
   * 承诺方提交履约（标记为待验收）
   */
  async submitFulfillment(commitmentId: string, promiserId: string, evidence?: string): Promise<CommitmentResult> {
    const commitment = await prisma.commitment.findUnique({
      where: { id: commitmentId }
    })

    if (!commitment) {
      throw new Error('Commitment not found')
    }

    const user = await this.findUser(promiserId)
    if (!user || commitment.promiserId !== user.id) {
      throw new Error('Not authorized')
    }

    if (commitment.status !== 'ACCEPTED' && commitment.status !== 'PENDING') {
      throw new Error(`Cannot submit with status ${commitment.status}`)
    }

    const updated = await prisma.commitment.update({
      where: { id: commitmentId },
      data: { 
        status: 'PENDING',
        evidence: evidence || null
      }
    })

    await this.logAudit('submit_fulfillment', promiserId, 'commitment', commitmentId, { evidence })

    return this.formatCommitment(updated, commitment.promiserId, commitment.receiverId || undefined)
  }

  /**
   * 获取承诺详情
   */
  async getCommitment(id: string): Promise<CommitmentResult | null> {
    const commitment = await prisma.commitment.findUnique({
      where: { id }
    })

    if (!commitment) return null

    return this.formatCommitment(commitment, commitment.promiserId, commitment.receiverId || undefined)
  }

  /**
   * 列出我承诺的任务（承诺方视角）
   */
  async listMyPromises(params: {
    promiserId: string
    status?: CommitmentStatus
    limit?: number
    offset?: number
  }): Promise<{ commitments: CommitmentResult[]; total: number }> {
    const user = await this.findUser(params.promiserId)
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
      commitments: commitments.map(c => this.formatCommitment(c, c.promiserId, c.receiverId || undefined)),
      total
    }
  }

  /**
   * 列出我委托的任务（委托方视角）
   */
  async listMyDelegations(params: {
    delegatorId: string
    status?: CommitmentStatus
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
      commitments: commitments.map(c => this.formatCommitment(c, c.promiserId, c.receiverId || undefined)),
      total
    }
  }

  /**
   * 委托方验收承诺
   * 
   * @example
   * ```typescript
   * // 委托方验收承诺
   * await sdk.verifyCommitment({
   *   commitmentId: 'xxx',
   *   verifierId: 'user_456',  // 委托方验收
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

    // 验证验收方是委托方
    const verifier = await this.findUser(params.verifierId)
    if (!verifier || commitment.receiverId !== verifier.id) {
      throw new Error('Not authorized to verify this commitment')
    }

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
    const newStatus = params.fulfilled ? 'FULFILLED' : 'FAILED'
    await prisma.commitment.update({
      where: { id: params.commitmentId },
      data: { status: newStatus }
    })

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
    const pendingCount = commitments.filter(c => 
      c.status === 'PENDING' || c.status === 'PENDING_ACCEPT' || c.status === 'ACCEPTED'
    ).length

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

  private formatCommitment(
    commitment: any, 
    promiserId: string, 
    delegatorId?: string
  ): CommitmentResult {
    return {
      id: commitment.id,
      promiserId,
      delegatorId: delegatorId || '',
      task: commitment.task,
      status: commitment.status as CommitmentStatus,
      deadline: commitment.deadline?.toISOString() || undefined,
      context: commitment.context,
      source: commitment.source || 'api',
      externalId: commitment.towowTaskId || undefined,
      createdAt: commitment.createdAt.toISOString(),
      updatedAt: commitment.updatedAt.toISOString()
    }
  }

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
