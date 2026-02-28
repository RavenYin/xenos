/**
 * Redis 缓存层
 * 用于三层架构中的第二层缓存
 *
 * 环境变量：
 * - REDIS_URL: Redis 连接 URL (如 redis://localhost:6379)
 * - REDIS_ENABLED: 是否启用 Redis (默认 false，使用内存缓存)
 */

import { cache as memoryCache } from './cache'

// 缓存键前缀
const CACHE_PREFIX = 'xenos:'

// 默认 TTL 配置（秒）
export const CacheTTL = {
  REPUTATION: 300,        // 信誉分数：5 分钟
  AGENT_PROFILE: 300,     // Agent 档案：5 分钟
  COMMITMENT: 600,        // 承诺详情：10 分钟
  USER_DATA: 60,          // 用户数据：1 分钟
  TRACE_LIST: 120,        // 痕迹列表：2 分钟
} as const

// 缓存键生成器
export const CacheKeys = {
  reputation: (userId: string, context: string) =>
    `${CACHE_PREFIX}rep:${userId}:${context}`,
  agentProfile: (agentId: string) =>
    `${CACHE_PREFIX}agent:${agentId}`,
  commitment: (commitmentId: string) =>
    `${CACHE_PREFIX}commit:${commitmentId}`,
  userCommitments: (userId: string, type: 'delegations' | 'promises') =>
    `${CACHE_PREFIX}user:${userId}:${type}`,
  traceList: (userId: string, context?: string) =>
    `${CACHE_PREFIX}traces:${userId}${context ? `:${context}` : ''}`,
}

interface RedisLike {
  get(key: string): Promise<string | null>
  set(key: string, value: string, ...args: any[]): Promise<void>
  del(key: string): Promise<void>
  expire(key: string, seconds: number): Promise<void>
}

/**
 * Redis 客户端封装
 */
class RedisClient implements RedisLike {
  private client: any = null
  private enabled: boolean
  private url: string

  constructor() {
    this.enabled = process.env.REDIS_ENABLED === 'true'
    this.url = process.env.REDIS_URL || 'redis://localhost:6379'
  }

  async connect(): Promise<void> {
    if (!this.enabled || this.client) return

    try {
      // 动态导入 ioredis（仅在启用时）
      const Redis = (await import('ioredis')).default
      this.client = new Redis(this.url)
      console.log('[Redis] Connected successfully')
    } catch (error) {
      console.warn('[Redis] Connection failed, falling back to memory cache:', error)
      this.enabled = false
    }
  }

  async get(key: string): Promise<string | null> {
    if (!this.enabled || !this.client) return null
    try {
      return await this.client.get(key)
    } catch (error) {
      console.error('[Redis] Get error:', error)
      return null
    }
  }

  async set(key: string, value: string, ttl?: number): Promise<void> {
    if (!this.enabled || !this.client) return
    try {
      if (ttl) {
        await this.client.set(key, value, 'EX', ttl)
      } else {
        await this.client.set(key, value)
      }
    } catch (error) {
      console.error('[Redis] Set error:', error)
    }
  }

  async del(key: string): Promise<void> {
    if (!this.enabled || !this.client) return
    try {
      await this.client.del(key)
    } catch (error) {
      console.error('[Redis] Del error:', error)
    }
  }

  async expire(key: string, seconds: number): Promise<void> {
    if (!this.enabled || !this.client) return
    try {
      await this.client.expire(key, seconds)
    } catch (error) {
      console.error('[Redis] Expire error:', error)
    }
  }

  isConnected(): boolean {
    return this.enabled && this.client !== null
  }
}

// Redis 单例
let redisClient: RedisClient | null = null

function getRedisClient(): RedisClient {
  if (!redisClient) {
    redisClient = new RedisClient()
  }
  return redisClient
}

/**
 * 统一缓存接口
 * 自动选择 Redis 或内存缓存
 */
export class UnifiedCache {
  private redis: RedisClient

  constructor() {
    this.redis = getRedisClient()
  }

  /**
   * 初始化连接
   */
  async init(): Promise<void> {
    await this.redis.connect()
  }

  /**
   * 获取缓存
   */
  async get<T>(key: string): Promise<T | null> {
    // 优先从 Redis 获取
    if (this.redis.isConnected()) {
      const data = await this.redis.get(key)
      if (data) {
        try {
          return JSON.parse(data) as T
        } catch {
          return data as unknown as T
        }
      }
    }

    // 回退到内存缓存
    return memoryCache.get<T>(key)
  }

  /**
   * 设置缓存
   */
  async set<T>(key: string, data: T, ttl?: number): Promise<void> {
    const serialized = JSON.stringify(data)

    // 写入 Redis
    if (this.redis.isConnected()) {
      await this.redis.set(key, serialized, ttl)
    }

    // 同时写入内存缓存（作为本地热缓存）
    memoryCache.set(key, data, ttl ? ttl * 1000 : undefined)
  }

  /**
   * 删除缓存
   */
  async delete(key: string): Promise<void> {
    if (this.redis.isConnected()) {
      await this.redis.del(key)
    }
    memoryCache.delete(key)
  }

  /**
   * 批量删除（按前缀）
   */
  async deleteByPrefix(prefix: string): Promise<void> {
    // 内存缓存：遍历删除
    // Redis：需要使用 SCAN 命令（简化实现中暂时不支持）
    // 这里只清理内存缓存
    memoryCache.clear()
  }

  /**
   * 获取或设置缓存（常用模式）
   */
  async getOrSet<T>(
    key: string,
    fetcher: () => Promise<T>,
    ttl?: number
  ): Promise<T> {
    const cached = await this.get<T>(key)
    if (cached !== null) {
      return cached
    }

    const data = await fetcher()
    await this.set(key, data, ttl)
    return data
  }
}

// 导出单例
export const unifiedCache = new UnifiedCache()

// 便捷方法
export const cache = {
  get: <T>(key: string) => unifiedCache.get<T>(key),
  set: <T>(key: string, data: T, ttl?: number) => unifiedCache.set(key, data, ttl),
  delete: (key: string) => unifiedCache.delete(key),
  getOrSet: <T>(key: string, fetcher: () => Promise<T>, ttl?: number) =>
    unifiedCache.getOrSet(key, fetcher, ttl),
}
