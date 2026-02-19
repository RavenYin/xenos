import { prisma } from './prisma'

const API_BASE_URL = process.env.SECONDME_API_BASE_URL || 'https://app.mindos.com/gate/lab'
const OAUTH_URL = process.env.SECONDME_OAUTH_URL || 'https://go.second.me/oauth/'

export interface TokenResponse {
  accessToken: string
  refreshToken: string
  tokenType: string
  expiresIn: number
  scope: string[]
}

export interface UserInfo {
  id?: string
  userId?: string
  user_id?: string
  sub?: string
  uid?: string
  userIdStr?: string
  openid?: string
  email?: string
  name?: string
  avatarUrl?: string
  route?: string
}

// 获取用户信息
export async function getUserInfo(accessToken: string): Promise<UserInfo> {
  const response = await fetch(`${API_BASE_URL}/api/secondme/user/info`, {
    headers: {
      'Authorization': `Bearer ${accessToken}`,
    },
  })

  const result = await response.json()
  
  if (result.code !== 0 || !result.data) {
    throw new Error(`Get user info failed: ${result.message || 'Unknown error'}`)
  }

  // 字段映射：SecondMe API 返回 userId/avatar，我们需要 id/avatarUrl
  const data = result.data
  return {
    id: data.userId,
    email: data.email,
    name: data.name,
    avatarUrl: data.avatar,
    route: data.route,
  }
}

// 生成随机 state
export function generateState(): string {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
}

// 构建授权 URL
export function buildAuthUrl(state: string): string {
  const params = new URLSearchParams({
    client_id: process.env.SECONDME_CLIENT_ID!,
    redirect_uri: process.env.SECONDME_REDIRECT_URI!,
    response_type: 'code',
    state: state,
    scope: 'user.info user.info.shades user.info.softmemory note.add chat',
  })
  
  return `${OAUTH_URL}?${params.toString()}`
}

// 用授权码换取 Token
export async function exchangeCodeForToken(code: string): Promise<TokenResponse> {
  const response = await fetch(`${API_BASE_URL}/api/oauth/token/code`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      grant_type: 'authorization_code',
      code: code,
      redirect_uri: process.env.SECONDME_REDIRECT_URI!,
      client_id: process.env.SECONDME_CLIENT_ID!,
      client_secret: process.env.SECONDME_CLIENT_SECRET!,
    }),
  })

  const result = await response.json()
  
  if (result.code !== 0 || !result.data) {
    throw new Error(`Token exchange failed: ${result.message || 'Unknown error'}`)
  }

  return {
    accessToken: result.data.accessToken,
    refreshToken: result.data.refreshToken,
    tokenType: result.data.tokenType,
    expiresIn: result.data.expiresIn,
    scope: result.data.scope,
  }
}

// 刷新 Token
export async function refreshAccessToken(refreshToken: string): Promise<TokenResponse> {
  const response = await fetch(`${API_BASE_URL}/api/oauth/token/refresh`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token: refreshToken,
      client_id: process.env.SECONDME_CLIENT_ID!,
      client_secret: process.env.SECONDME_CLIENT_SECRET!,
    }),
  })

  const result = await response.json()
  
  if (result.code !== 0 || !result.data) {
    throw new Error(`Token refresh failed: ${result.message || 'Unknown error'}`)
  }

  return {
    accessToken: result.data.accessToken,
    refreshToken: result.data.refreshToken,
    tokenType: result.data.tokenType,
    expiresIn: result.data.expiresIn,
    scope: result.data.scope,
  }
}

// 获取有效的 access token（自动刷新）
export async function getValidAccessToken(userId: string): Promise<string> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
  })

  if (!user) {
    throw new Error('User not found')
  }

  // 检查 token 是否过期
  if (new Date() >= user.tokenExpiresAt) {
    // 刷新 token
    const newTokens = await refreshAccessToken(user.refreshToken)
    
    // 更新数据库
    await prisma.user.update({
      where: { id: userId },
      data: {
        accessToken: newTokens.accessToken,
        refreshToken: newTokens.refreshToken,
        tokenExpiresAt: new Date(Date.now() + newTokens.expiresIn * 1000),
      },
    })

    return newTokens.accessToken
  }

  return user.accessToken
}
