/**
 * 审计服务 - 操作日志记录
 */

import { prisma } from './prisma'

export type AuditAction =
  | 'create_commitment'
  | 'update_commitment'
  | 'fulfill_commitment'
  | 'fail_commitment'
  | 'cancel_commitment'
  | 'create_attestation'
  | 'user_login'
  | 'user_logout'
  | 'did_generated'

export type TargetType =
  | 'commitment'
  | 'attestation'
  | 'user'
  | 'reputation'

export interface AuditLogEntry {
  action: AuditAction
  actorId: string
  targetType: TargetType
  targetId: string
  payload?: Record<string, any>
}

/**
 * 记录审计日志
 */
export async function logAudit(entry: AuditLogEntry): Promise<void> {
  try {
    await prisma.auditLog.create({
      data: {
        action: entry.action,
        actorId: entry.actorId,
        targetType: entry.targetType,
        targetId: entry.targetId,
        payload: entry.payload ? JSON.stringify(entry.payload) : '{}'
      }
    })
  } catch (error) {
    // 审计日志失败不应阻塞主流程
    console.error('Audit log failed:', error)
  }
}

/**
 * 查询审计日志
 */
export async function queryAuditLogs(options: {
  actorId?: string
  targetType?: TargetType
  targetId?: string
  action?: AuditAction
  limit?: number
  offset?: number
}): Promise<{
  logs: Array<{
    id: string
    action: string
    actorId: string
    targetType: string
    targetId: string
    payload: any
    timestamp: Date
  }>
  total: number
}> {
  const { actorId, targetType, targetId, action, limit = 20, offset = 0 } = options
  
  const where: any = {}
  if (actorId) where.actorId = actorId
  if (targetType) where.targetType = targetType
  if (targetId) where.targetId = targetId
  if (action) where.action = action
  
  const [logs, total] = await Promise.all([
    prisma.auditLog.findMany({
      where,
      orderBy: { timestamp: 'desc' },
      take: limit,
      skip: offset
    }),
    prisma.auditLog.count({ where })
  ])
  
  return {
    logs: logs.map(log => ({
      ...log,
      payload: JSON.parse(log.payload)
    })),
    total
  }
}

/**
 * 获取用户活动摘要
 */
export async function getUserActivitySummary(userId: string): Promise<{
  totalActions: number
  recentActions: Array<{
    action: string
    timestamp: Date
    targetType: string
  }>
}> {
  const logs = await prisma.auditLog.findMany({
    where: { actorId: userId },
    orderBy: { timestamp: 'desc' },
    take: 10
  })
  
  const total = await prisma.auditLog.count({
    where: { actorId: userId }
  })
  
  return {
    totalActions: total,
    recentActions: logs.map(log => ({
      action: log.action,
      timestamp: log.timestamp,
      targetType: log.targetType
    }))
  }
}
