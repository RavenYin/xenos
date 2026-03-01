# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

请始终使用简体中文与我对话，并在回答时保持专业、简洁。

---

# Xenos - Agent 信用协议 (VCA) 平台

Xenos 是一个基于可验证承诺证明 (VCA) 的 Agent 信任协议平台，将"口头承诺"转化为可验证的数字凭证。

## 项目架构

### 目录结构
- `src/app/` - Next.js App Router
  - `api/v1/*` - 公共 VCA REST API
  - `api/auth/*` - 认证流程端点（含 SecondMe OAuth）
  - `page.tsx` - 首页
  - `dashboard/`, `agents/`, `trust/` - 各功能页面
- `src/components/` - 可复用 UI 组件（PascalCase 命名）
- `src/lib/` - 共享业务逻辑
  - `auth.ts` - SecondMe OAuth 客户端（token 管理、自动刷新）
  - `secondme.ts` - SecondMe API 客户端（用户数据、笔记、聊天）
  - `did.ts` - did:key 生成、签名、验证（Ed25519）
  - `vc.ts` - 可验证凭证签发和验证
  - `reputation.ts` - 上下文信誉计算
  - `audit.ts` - 审计日志记录
  - `towow.ts` - ToWow API 客户端
  - `cache.ts` - Redis 缓存封装
  - `prisma.ts` - 数据库单例
- `prisma/schema.prisma` - 数据模型定义（修改后需 `npx prisma generate`）
- `mcp/` - MCP Server，让 AI Agent 通过协议调用 Xenos
- `tests/*.spec.ts` - Playwright 测试套件

### 核心数据模型
- `User` - 用户，关联 SecondMe ID 和 did:key 身份
- `Commitment` - 承诺记录，含 ToWow 任务集成字段
- `Attestation` - 履约证明，防刷规则：承诺者不能自证 fulfilled=true
- `AuditLog` - 审计日志，记录所有关键操作
- `AgentProfile` - Agent 背景板（技能、外链）
- `Vouch` - 担保关系

### DID/VC 流程
1. 用户登录时生成或恢复 `did:key`（Ed25519 密钥对）
2. 创建承诺时签发 `CommitmentCredential` VC
3. 履约时签发 `AttestationCredential` VC
4. 所有 VC 可通过公钥验证签名

### SecondMe API 响应格式
```json
{ "code": 0, "data": { ... } }
```
前端必须正确提取 `data` 字段内的数据。

### 环境变量
在 `.env.local` 中配置：
```bash
# 数据库
DATABASE_URL=postgresql://...
DIRECT_DATABASE_URL=postgresql://...

# SecondMe OAuth
SECONDME_API_BASE_URL=https://app.mindos.com/gate/lab
SECONDME_OAUTH_URL=https://go.second.me/oauth/
SECONDME_CLIENT_ID=your_client_id
SECONDME_CLIENT_SECRET=your_client_secret
SECONDME_REDIRECT_URI=http://localhost:3000/api/auth/callback

# Next.js
NEXTAUTH_SECRET=your_secret_here
NEXTAUTH_URL=http://localhost:3000

# ToWow 集成
TOWOW_API_URL=https://towow.net
TOWOW_API_KEY=your_api_key
TOWOW_ENABLED=true
```

---

## 常用命令

### 开发
```bash
npm install              # 安装依赖
npx prisma db push      # 同步数据库（首次启动必须）
npm run dev             # 启动开发服务器（端口 3000）
```

### 构建
```bash
npm run build           # 构建（包含 prisma generate）
npm run start           # 运行生产模式
```

### 测试
```bash
npm run test            # 运行所有 Playwright 测试
npm run test:api        # 仅 API 测试
npm run test:e2e        # 仅 E2E 测试
npm run test:ui         # 打开 Playwright UI
```

### 其他
```bash
npm run lint            # ESLint 检查
npm run mcp             # 启动 MCP Server（ts 模式）
npx tsx mcp/index.ts   # 直接启动 MCP Server
```

---

## 编码规范

- TypeScript strict 模式启用
- 2 空格缩进，单引号，无分号
- 组件：PascalCase（如 `AgentCard.tsx`）
- 工具文件：小写或 kebab-case（如 `rate-limit.ts`）
- 路由目录：小写，匹配 URL 路径
- 优先使用路径别名 `@/lib/xxx`

---

## 设计原则

- **亮色主题**：仅使用浅色主题
- **简约优雅**：极简设计，减少视觉噪音
- **中文界面**：所有用户可见文字使用中文
- **稳定优先**：避免复杂动画，仅用简单过渡效果

---

## SecondMe 集成

SecondMe 是 Xenos 的 OAuth 认证提供商，同时提供用户数据 API 集成。

### 架构概览

```
┌─────────────────────────────────────────────────────────────┐
│  SecondMe OAuth 流程                                        │
├─────────────────────────────────────────────────────────────┤
│  用户登录 → /api/auth/login → SecondMe 授权页面            │
│                      ↓                                   │
│  用户授权 → /api/auth/callback?code=xxx → 换取 Token       │
│                      ↓                                   │
│  获取用户信息 → 创建/更新 User 记录 → 生成 Session Cookie  │
│                      ↓                                   │
│  Dashboard 访问 → 验证 session_user_id                   │
└─────────────────────────────────────────────────────────────┘
```

### 目录结构

```
src/
├── lib/
│   ├── auth.ts           # SecondMe OAuth 客户端（token 交换、自动刷新）
│   └── secondme.ts      # SecondMe API 客户端（用户数据、笔记、聊天）
└── app/api/auth/
    ├── login/route.ts    # 登录入口，重定向到授权页面
    ├── callback/route.ts # OAuth 回调处理
    └── logout/route.ts  # 登出，清除 session cookie
```

### 环境变量

| 变量名 | 说明 | 示例 |
|--------|------|------|
| `SECONDME_API_BASE_URL` | API 基础 URL | `https://app.mindos.com/gate/lab` |
| `SECONDME_OAUTH_URL` | OAuth 授权 URL | `https://go.second.me/oauth/` |
| `SECONDME_CLIENT_ID` | 客户端 ID | - |
| `SECONDME_CLIENT_SECRET` | 客户端密钥 | - |
| `SECONDME_REDIRECT_URI` | 回调 URI | `http://localhost:3000/api/auth/callback` |

### OAuth Scopes

| Scope | 说明 | 用途 |
|-------|------|------|
| `user.info` | 用户基础信息 | 登录认证 |
| `user.info.shades` | 用户兴趣标签 | 用户画像 |
| `user.info.softmemory` | 用户软记忆 | 用户画像 |
| `note.add` | 添加笔记 | 持久化功能 |
| `chat` | 聊天功能 | 对话集成 |

### 数据模型（User 表）

```prisma
model User {
  id                String    @id @default(cuid())
  did               String?   @unique  // did:key 去中心化身份
  secondmeUserId    String    @unique  // SecondMe 用户 ID
  email             String?
  name              String?
  avatarUrl         String?
  accessToken       String
  refreshToken      String
  tokenExpiresAt    DateTime
  createdAt         DateTime  @default(now())
  updatedAt         DateTime  @updatedAt
}
```

### API 端点

| 端点 | 方法 | 说明 |
|------|------|------|
| `/api/auth/login` | GET | 重定向到 SecondMe 授权页面 |
| `/api/auth/callback` | GET | OAuth 回调，处理 code 换 token |
| `/api/auth/logout` | POST | 登出，清除 session cookie |

### Session 管理

- 使用 `session_user_id` cookie 存储用户 ID
- Cookie 配置：`httpOnly=true`，`sameSite=lax`，有效期 7 天
- 登出时删除 cookie

### SecondMe API 客户端 (`secondme.ts`)

| 函数 | 说明 |
|------|------|
| `getUserShades()` | 获取用户兴趣标签 |
| `getUserSoftMemory()` | 获取用户软记忆 |
| `addNote()` | 添加笔记 |
| `createChatStream()` | 创建聊天流 |
| `getChatSessions()` | 获取聊天会话列表 |

### 安全注意事项

**当前实现存在的限制（待改进）：**

1. **state 参数未验证** - 存在 CSRF 攻击风险，建议在生产环境添加 state 验证
2. **session cookie 无签名** - 建议使用加密签名机制
3. **token 刷新未实际调用** - `getValidAccessToken()` 函数已实现但未被调用
4. **无统一的认证中间件** - 需要在各路由中手动检查 cookie

---

## REST API

**基础 URL**: `/api/v1`

| 方法 | 端点 | 说明 |
|------|------|------|
| POST | `/commitment` | 创建承诺 |
| GET | `/commitment?id=` | 获取详情 |
| POST | `/commitment/accept` | 接受承诺 |
| POST | `/commitment/reject` | 拒绝承诺 |
| POST | `/commitment/evidence` | 提交证据 |
| POST | `/commitment/verify` | 验收 |
| GET | `/reputation?userId=&context=` | 查询信誉 |
| POST | `/vouch` | 创建担保 |
| GET | `/agents` | 发现 Agent |
| GET | `/delegations?userId=` | 查询委托列表 |
| GET | `/promises?userId=` | 查询承诺列表 |

所有 API 响应格式：
```json
{ "code": 0, "data": { ... } }
```
