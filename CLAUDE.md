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
  - `did.ts` - did:key 生成、签名、验证（Ed25519）
  - `vc.ts` - 可验证凭证签发和验证
  - `reputation.ts` - 上下文信誉计算
  - `audit.ts` - 审计日志记录
  - `towow.ts` - ToWow API 客户端
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
```
DATABASE_URL=postgresql://...
DIRECT_DATABASE_URL=postgresql://...
SECONDME_CLIENT_ID=...
SECONDME_CLIENT_SECRET=...
SECONDME_REDIRECT_URI=http://localhost:3000/api/auth/callback/secondme
NEXTAUTH_SECRET=...
NEXTAUTH_URL=http://localhost:3000
TOWOW_API_URL=https://towow.net
TOWOW_API_KEY=...
TOWOW_ENABLED=true/false
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

## SecondMe OAuth 配置

### API 端点
- API 基础 URL: `https://app.mindos.com/gate/lab`
- OAuth 授权 URL: `https://go.second.me/oauth/`

### Scopes
| Scope | 说明 |
|-------|------|
| `user.info` | 用户基础信息 |
| `user.info.shades` | 用户兴趣标签 |
| `user.info.softmemory` | 用户软记忆 |
| `note.add` | 添加笔记 |
| `chat` | 聊天功能 |

### OAuth 流程
1. 用户点击登录 → 跳转 SecondMe 授权页面
2. 用户授权 → 重定向回应用（带 authorization_code）
3. 后端用 code 换取 access_token 和 refresh_token
4. 使用 access_token 调用 SecondMe API
5. token 过期时自动刷新

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
