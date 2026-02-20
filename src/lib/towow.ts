/**
 * ToWow API 客户端
 * 用于调用 ToWow.net 的 Intent Field API
 */

const TOWOW_API_URL = process.env.TOWOW_API_URL || 'https://towow.net'

export interface TowowIntent {
  id: string
  text: string
  owner_id: string
  created_at: string
  metadata?: Record<string, any>
}

export interface TowowMatchResult {
  intent_id: string
  score: number
  text: string
  owner_id: string
}

export interface TowowTask {
  id: string
  title: string
  description: string
  deadline?: string
  reward?: {
    amount: number
    currency: string
  }
  publisher: {
    id: string
    name: string
  }
  assignee?: {
    id: string
    name: string
  }
  status: 'open' | 'assigned' | 'completed' | 'cancelled'
}

/**
 * ToWow API 客户端
 */
export class TowowClient {
  private baseUrl: string
  private apiKey?: string

  constructor(baseUrl?: string, apiKey?: string) {
    this.baseUrl = baseUrl || TOWOW_API_URL
    this.apiKey = apiKey || process.env.TOWOW_API_KEY
  }

  /**
   * 存入意图到 Intent Field
   */
  async depositIntent(text: string, ownerId: string, metadata?: Record<string, any>): Promise<TowowIntent> {
    const response = await fetch(`${this.baseUrl}/field/api/deposit`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({
        text,
        owner_id: ownerId,
        metadata
      })
    })

    if (!response.ok) {
      throw new Error(`ToWow deposit failed: ${response.status}`)
    }

    const result = await response.json()
    return result.data || result
  }

  /**
   * 匹配意图
   */
  async matchIntents(query: string, topK: number = 10): Promise<TowowMatchResult[]> {
    const response = await fetch(`${this.baseUrl}/field/api/match`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({
        text: query,
        top_k: topK
      })
    })

    if (!response.ok) {
      throw new Error(`ToWow match failed: ${response.status}`)
    }

    const result = await response.json()
    return result.data?.matches || result.matches || []
  }

  /**
   * 按拥有者聚合匹配
   */
  async matchOwners(query: string): Promise<Array<{ owner_id: string; score: number; count: number }>> {
    const response = await fetch(`${this.baseUrl}/field/api/match-owners`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ text: query })
    })

    if (!response.ok) {
      throw new Error(`ToWow match-owners failed: ${response.status}`)
    }

    const result = await response.json()
    return result.data?.owners || result.owners || []
  }

  /**
   * 获取任务列表
   */
  async getTasks(status?: string): Promise<TowowTask[]> {
    const url = new URL(`${this.baseUrl}/v1/api/tasks`, this.baseUrl)
    if (status) {
      url.searchParams.set('status', status)
    }

    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: this.getHeaders()
    })

    if (!response.ok) {
      throw new Error(`ToWow get tasks failed: ${response.status}`)
    }

    const result = await response.json()
    return result.data?.tasks || result.tasks || []
  }

  /**
   * 接受任务
   */
  async acceptTask(taskId: string, assigneeId: string): Promise<TowowTask> {
    const response = await fetch(`${this.baseUrl}/v1/api/tasks/${taskId}/accept`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ assignee_id: assigneeId })
    })

    if (!response.ok) {
      throw new Error(`ToWow accept task failed: ${response.status}`)
    }

    const result = await response.json()
    return result.data?.task || result.task
  }

  /**
   * 验证 Webhook 签名
   */
  verifyWebhookSignature(payload: string, signature: string): boolean {
    // TODO: 实现 HMAC 签名验证
    // 目前 MVP 阶段先简单检查
    return !!(signature && signature.length > 0)
  }

  private getHeaders(): HeadersInit {
    const headers: HeadersInit = {
      'Content-Type': 'application/json'
    }
    if (this.apiKey) {
      headers['Authorization'] = `Bearer ${this.apiKey}`
    }
    return headers
  }
}

// 单例实例
let towowClient: TowowClient | null = null

export function getTowowClient(): TowowClient {
  if (!towowClient) {
    towowClient = new TowowClient()
  }
  return towowClient
}

/**
 * 检查 ToWow 是否启用
 */
export function isTowowEnabled(): boolean {
  return process.env.TOWOW_ENABLED === 'true'
}
