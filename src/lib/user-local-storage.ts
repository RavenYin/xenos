/**
 * 用户本地存储模块
 * 三层架构的第一层：用户设备本地存储
 *
 * 数据格式基于 JSON-LD 和 Verifiable Credentials 标准
 */

// ==================== 数据类型定义 ====================

/**
 * 用户偏好数据
 */
export interface UserPreferences {
  '@context': string[]
  id: string                    // 用户 DID
  type: 'UserPreferences'
  version: string               // 数据格式版本
  updatedAt: string             // ISO 8601 时间戳

  // 通知偏好
  notifications: {
    email: boolean
    push: boolean
    digest: 'none' | 'daily' | 'weekly'
  }

  // 隐私设置
  privacy: {
    profileVisibility: 'public' | 'private' | 'contacts'
    showReputation: boolean
    showActivity: boolean
  }

  // Agent 交互偏好
  agentSettings: {
    autoAcceptCommitments: boolean
    trustedAgents: string[]     // 信任的 Agent ID 列表
    blockedAgents: string[]
    preferredContexts: string[] // 偏好的协作场景
  }

  // 扩展字段
  extensions?: Record<string, any>
}

/**
 * 行为痕迹记录（本地存储版本）
 */
export interface LocalTraceRecord {
  '@context': string[]
  id: string                    // 记录 ID
  type: 'TraceRecord'
  userId: string                // 用户 DID
  timestamp: string             // ISO 8601

  // 行为信息
  action: string                // 行为类型
  context: string               // 场景上下文
  result: 'success' | 'failed' | 'pending'

  // 关联数据
  relatedEntity?: {
    type: 'commitment' | 'attestation' | 'vouch'
    id: string
  }

  // 元数据（加密存储敏感信息）
  metadata?: {
    encrypted?: boolean
    data?: string               // 加密后的数据
    iv?: string                 // 初始化向量
  }
}

/**
 * 本地存储根结构
 */
export interface UserLocalStorage {
  version: string               // 存储格式版本
  did: string                   // 用户 DID
  createdAt: string
  updatedAt: string

  preferences: UserPreferences
  traces: LocalTraceRecord[]

  // 同步状态
  sync: {
    lastSyncAt: string | null
    pendingUploads: string[]    // 待上传的记录 ID
    pendingDownloads: string[]  // 待下载的记录 ID
  }

  // 加密密钥（加密存储）
  encryption?: {
    publicKey: string
    encryptedPrivateKey: string
    algorithm: 'AES-256-GCM'
  }
}

// ==================== 存储管理类 ====================

const STORAGE_KEY = 'xenos_local_storage'
const STORAGE_VERSION = '1.0.0'

/**
 * 本地存储管理器
 */
export class LocalStorageManager {
  private storage: Storage | null = null
  private memoryFallback: Map<string, string> = new Map()

  constructor() {
    // 检查 localStorage 可用性
    if (typeof window !== 'undefined' && window.localStorage) {
      this.storage = window.localStorage
    }
  }

  /**
   * 初始化用户本地存储
   */
  async initialize(did: string): Promise<UserLocalStorage> {
    const existing = await this.load()
    if (existing && existing.did === did) {
      return existing
    }

    const newStorage: UserLocalStorage = {
      version: STORAGE_VERSION,
      did,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      preferences: this.getDefaultPreferences(did),
      traces: [],
      sync: {
        lastSyncAt: null,
        pendingUploads: [],
        pendingDownloads: [],
      },
    }

    await this.save(newStorage)
    return newStorage
  }

  /**
   * 获取默认偏好设置
   */
  private getDefaultPreferences(did: string): UserPreferences {
    return {
      '@context': ['https://www.w3.org/ns/user-preferences/v1'],
      id: did,
      type: 'UserPreferences',
      version: '1.0.0',
      updatedAt: new Date().toISOString(),
      notifications: {
        email: true,
        push: false,
        digest: 'daily',
      },
      privacy: {
        profileVisibility: 'public',
        showReputation: true,
        showActivity: false,
      },
      agentSettings: {
        autoAcceptCommitments: false,
        trustedAgents: [],
        blockedAgents: [],
        preferredContexts: [],
      },
    }
  }

  /**
   * 加载本地存储
   */
  async load(): Promise<UserLocalStorage | null> {
    try {
      const data = this.storage
        ? this.storage.getItem(STORAGE_KEY)
        : this.memoryFallback.get(STORAGE_KEY)

      if (!data) return null
      return JSON.parse(data) as UserLocalStorage
    } catch (error) {
      console.error('[LocalStorage] Load failed:', error)
      return null
    }
  }

  /**
   * 保存到本地存储
   */
  async save(storage: UserLocalStorage): Promise<void> {
    storage.updatedAt = new Date().toISOString()
    const data = JSON.stringify(storage)

    if (this.storage) {
      this.storage.setItem(STORAGE_KEY, data)
    } else {
      this.memoryFallback.set(STORAGE_KEY, data)
    }
  }

  /**
   * 更新偏好设置
   */
  async updatePreferences(
    preferences: Partial<UserPreferences>
  ): Promise<UserPreferences | null> {
    const storage = await this.load()
    if (!storage) return null

    storage.preferences = {
      ...storage.preferences,
      ...preferences,
      updatedAt: new Date().toISOString(),
    }

    await this.save(storage)
    return storage.preferences
  }

  /**
   * 添加行为痕迹
   */
  async addTrace(trace: Omit<LocalTraceRecord, '@context' | 'id'>): Promise<LocalTraceRecord | null> {
    const storage = await this.load()
    if (!storage) return null

    const newTrace: LocalTraceRecord = {
      '@context': ['https://www.w3.org/ns/activitystreams/v1'],
      id: `trace:${Date.now()}:${Math.random().toString(36).slice(2)}`,
      ...trace,
    }

    storage.traces.push(newTrace)
    storage.sync.pendingUploads.push(newTrace.id)

    // 限制本地存储的痕迹数量
    if (storage.traces.length > 1000) {
      storage.traces = storage.traces.slice(-500)
    }

    await this.save(storage)
    return newTrace
  }

  /**
   * 获取待同步的痕迹
   */
  async getPendingTraces(): Promise<LocalTraceRecord[]> {
    const storage = await this.load()
    if (!storage) return []

    return storage.traces.filter(t =>
      storage!.sync.pendingUploads.includes(t.id)
    )
  }

  /**
   * 标记为已同步
   */
  async markSynced(traceIds: string[]): Promise<void> {
    const storage = await this.load()
    if (!storage) return

    storage.sync.pendingUploads = storage.sync.pendingUploads.filter(
      id => !traceIds.includes(id)
    )
    storage.sync.lastSyncAt = new Date().toISOString()

    await this.save(storage)
  }

  /**
   * 导出数据（用于备份或迁移）
   */
  async exportData(): Promise<string> {
    const storage = await this.load()
    if (!storage) throw new Error('No data to export')
    return JSON.stringify(storage, null, 2)
  }

  /**
   * 导入数据
   */
  async importData(data: string): Promise<UserLocalStorage> {
    const storage = JSON.parse(data) as UserLocalStorage

    // 验证数据格式
    if (!storage.version || !storage.did) {
      throw new Error('Invalid data format')
    }

    await this.save(storage)
    return storage
  }

  /**
   * 清空本地存储
   */
  async clear(): Promise<void> {
    if (this.storage) {
      this.storage.removeItem(STORAGE_KEY)
    } else {
      this.memoryFallback.delete(STORAGE_KEY)
    }
  }
}

// 导出单例
export const localStorageManager = new LocalStorageManager()

// ==================== 同步 API ====================

/**
 * 本地存储同步 API
 * 用于与 Xenos 服务器同步偏好和痕迹数据
 */
export class LocalStorageSyncAPI {
  private baseUrl: string

  constructor(baseUrl?: string) {
    this.baseUrl = baseUrl || process.env.NEXT_PUBLIC_API_URL || '/api/v1'
  }

  /**
   * 同步待上传的痕迹到服务器
   */
  async syncTraces(): Promise<{ uploaded: number; failed: number }> {
    const pendingTraces = await localStorageManager.getPendingTraces()

    if (pendingTraces.length === 0) {
      return { uploaded: 0, failed: 0 }
    }

    let uploaded = 0
    let failed = 0
    const uploadedIds: string[] = []

    for (const trace of pendingTraces) {
      try {
        // 调用服务器 API 上传痕迹
        const response = await fetch(`${this.baseUrl}/user/traces`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(trace),
        })

        if (response.ok) {
          uploaded++
          uploadedIds.push(trace.id)
        } else {
          failed++
        }
      } catch (error) {
        console.error('[Sync] Trace upload failed:', error)
        failed++
      }
    }

    // 标记已同步
    if (uploadedIds.length > 0) {
      await localStorageManager.markSynced(uploadedIds)
    }

    return { uploaded, failed }
  }

  /**
   * 从服务器下载偏好设置
   */
  async downloadPreferences(): Promise<UserPreferences | null> {
    try {
      const response = await fetch(`${this.baseUrl}/user/preferences`)
      if (!response.ok) return null

      const data = await response.json()
      if (data.code === 0 && data.data) {
        await localStorageManager.updatePreferences(data.data)
        return data.data
      }
      return null
    } catch (error) {
      console.error('[Sync] Download preferences failed:', error)
      return null
    }
  }

  /**
   * 上传偏好设置到服务器
   */
  async uploadPreferences(preferences: UserPreferences): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/user/preferences`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(preferences),
      })
      return response.ok
    } catch (error) {
      console.error('[Sync] Upload preferences failed:', error)
      return false
    }
  }
}

export const syncAPI = new LocalStorageSyncAPI()
