const API_BASE_URL = process.env.SECONDME_API_BASE_URL || 'https://app.mindos.com/gate/lab'

// API 响应格式
interface ApiResponse<T> {
  code: number
  data: T
  message?: string
}

// 用户兴趣标签
export interface Shade {
  id: string
  name: string
  description?: string
}

// 用户软记忆
export interface SoftMemory {
  id: string
  content: string
  createdAt: string
}

// 聊天会话
export interface ChatSession {
  sessionId: string
  title?: string
  createdAt: string
}

// 聊天消息
export interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  createdAt: string
}

// 获取用户兴趣标签
export async function getUserShades(accessToken: string): Promise<Shade[]> {
  const response = await fetch(`${API_BASE_URL}/api/secondme/user/shades`, {
    headers: {
      'Authorization': `Bearer ${accessToken}`,
    },
  })

  const result: ApiResponse<{ shades: Shade[] }> = await response.json()
  
  if (result.code !== 0) {
    throw new Error(`Get shades failed: ${result.message || 'Unknown error'}`)
  }

  return result.data.shades
}

// 获取用户软记忆
export async function getUserSoftMemory(accessToken: string): Promise<SoftMemory[]> {
  const response = await fetch(`${API_BASE_URL}/api/secondme/user/softmemory`, {
    headers: {
      'Authorization': `Bearer ${accessToken}`,
    },
  })

  const result: ApiResponse<{ list: SoftMemory[] }> = await response.json()
  
  if (result.code !== 0) {
    throw new Error(`Get soft memory failed: ${result.message || 'Unknown error'}`)
  }

  return result.data.list
}

// 获取聊天会话列表
export async function getChatSessions(accessToken: string): Promise<ChatSession[]> {
  const response = await fetch(`${API_BASE_URL}/api/secondme/chat/session/list`, {
    headers: {
      'Authorization': `Bearer ${accessToken}`,
    },
  })

  const result: ApiResponse<{ sessions: ChatSession[] }> = await response.json()
  
  if (result.code !== 0) {
    throw new Error(`Get sessions failed: ${result.message || 'Unknown error'}`)
  }

  return result.data.sessions
}

// 添加笔记
export async function addNote(accessToken: string, content: string): Promise<number> {
  const response = await fetch(`${API_BASE_URL}/api/secondme/note/add`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ content }),
  })

  const result: ApiResponse<{ noteId: number }> = await response.json()
  
  if (result.code !== 0) {
    throw new Error(`Add note failed: ${result.message || 'Unknown error'}`)
  }

  return result.data.noteId
}

// 创建聊天流
export function createChatStream(accessToken: string, message: string, sessionId?: string): Promise<Response> {
  return fetch(`${API_BASE_URL}/api/secondme/chat/stream`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      message,
      sessionId,
    }),
  })
}
