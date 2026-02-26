/**
 * 简单速率限制器实现
 * 基于内存的请求限流
 */

interface RateLimitEntry {
  count: number
  resetAt: number
}

class RateLimiter {
  private limits = new Map<string, RateLimitEntry>()
  private defaultLimit = 100 // 默认每分钟 100 次
  private defaultWindow = 60 * 1000 // 默认 1 分钟窗口

  /**
   * 检查是否超过限制
   */
  check(identifier: string, limit?: number, window?: number): {
    allowed: boolean
    remaining: number
    resetAt: number
  } {
    const now = Date.now()
    const maxLimit = limit || this.defaultLimit
    const windowMs = window || this.defaultWindow

    const entry = this.limits.get(identifier)

    if (!entry || now > entry.resetAt) {
      // 新窗口
      this.limits.set(identifier, {
        count: 1,
        resetAt: now + windowMs
      })
      return {
        allowed: true,
        remaining: maxLimit - 1,
        resetAt: now + windowMs
      }
    }

    if (entry.count >= maxLimit) {
      return {
        allowed: false,
        remaining: 0,
        resetAt: entry.resetAt
      }
    }

    entry.count++
    return {
      allowed: true,
      remaining: maxLimit - entry.count,
      resetAt: entry.resetAt
    }
  }

  /**
   * 获取当前使用量
   */
  getUsage(identifier: string): number {
    const entry = this.limits.get(identifier)
    if (!entry || Date.now() > entry.resetAt) return 0
    return entry.count
  }

  /**
   * 重置限制
   */
  reset(identifier: string): void {
    this.limits.delete(identifier)
  }

  /**
   * 清理过期记录
   */
  prune(): void {
    const now = Date.now()
    for (const [key, entry] of this.limits.entries()) {
      if (now > entry.resetAt) {
        this.limits.delete(key)
      }
    }
  }
}

// 导出单例
export const rateLimiter = new RateLimiter()

/**
 * 创建速率限制中间件
 */
export function createRateLimiter(options?: {
  limit?: number
  window?: number
  keyGenerator?: (req: Request) => string
}) {
  const { limit, window, keyGenerator } = options || {}

  return (req: Request): { allowed: boolean; remaining: number; resetAt: number } => {
    const identifier = keyGenerator 
      ? keyGenerator(req)
      : req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown'
    
    return rateLimiter.check(identifier, limit, window)
  }
}
