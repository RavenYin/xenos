/**
 * 简单内存缓存实现
 * 用于 API 响应缓存
 */

interface CacheEntry<T> {
  data: T
  expiresAt: number
}

class MemoryCache {
  private cache = new Map<string, CacheEntry<any>>()
  private defaultTTL = 60 * 1000 // 默认 1 分钟

  /**
   * 获取缓存
   */
  get<T>(key: string): T | null {
    const entry = this.cache.get(key)
    if (!entry) return null
    
    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key)
      return null
    }
    
    return entry.data as T
  }

  /**
   * 设置缓存
   */
  set<T>(key: string, data: T, ttl?: number): void {
    this.cache.set(key, {
      data,
      expiresAt: Date.now() + (ttl || this.defaultTTL)
    })
  }

  /**
   * 删除缓存
   */
  delete(key: string): void {
    this.cache.delete(key)
  }

  /**
   * 清空所有缓存
   */
  clear(): void {
    this.cache.clear()
  }

  /**
   * 清空过期缓存
   */
  prune(): void {
    const now = Date.now()
    for (const [key, entry] of this.cache.entries()) {
      if (now > entry.expiresAt) {
        this.cache.delete(key)
      }
    }
  }
}

// 导出单例
export const cache = new MemoryCache()

/**
 * 缓存装饰器 - 用于函数结果缓存
 */
export function cached<T extends (...args: any[]) => Promise<any>>(
  fn: T,
  ttl?: number
): T {
  return (async (...args: any[]) => {
    const key = `${fn.name}:${JSON.stringify(args)}`
    const cached = cache.get(key)
    if (cached) return cached
    
    const result = await fn(...args)
    cache.set(key, result, ttl)
    return result
  }) as T
}
