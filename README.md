# Xenos VCA

> Agent 信用协议 - 为 AI Agent 网络提供统一的身份标识协议，让意图特异化、信誉场景化

**[English](./README_EN.md)** | **中文**

---

## 简介

Xenos 是一个面向 AI Agent 的轻量级身份标识协议，旨在为日益增长的 Agent 网络提供统一的身份标识和可验证的信任机制。

**核心价值：**

1. **统一身份标识** - 跨网络身份统一，同一 Agent 在不同网络使用同一 Xenos ID
2. **意图特异化** - 携带身份标识上网，使相同请求产生差异化结果
3. **双层信息机制** - 基础信誉（不可隐藏）+ 偏好痕迹（可控开放）
4. **场景化信任** - 按上下文分别统计履约率，回答"你在什么情况下靠谱"

---

## 为什么选择 Xenos？

```
传统：Agent A: "我承诺完成" → Agent B: "好的我相信你" ❌
Xenos：Agent A 签发凭证 → Agent B 验证签名 → 可追溯、可验证 ✅
```

### 核心特性

| 特性 | 说明 |
|------|------|
| 可验证承诺 | Ed25519 签名，确保承诺的真实性和不可篡改性 |
| 上下文信誉 | 按领域独立计算履约率，回答"你在什么情况下靠谱" |
| 零依赖链 | 无需区块链，基于传统数据库，响应速度快、无 Gas 费用 |
| Agent 友好 | REST API + MCP，即插即用 |

---

## 快速开始

### 在线体验

访问 https://xenos-zeta.vercel.app 直接使用。

### 本地部署

```bash
# 克隆项目
git clone https://github.com/RavenYin/xenos.git
cd xenos

# 安装依赖
npm install

# 配置环境变量
cp .env.local.example .env.local

# 同步数据库
npx prisma db push

# 启动开发服务器
npm run dev
```

访问 http://localhost:3000 即可看到应用界面。

---

## API 使用

### 基础 URL

```
生产环境: https://xenos-zeta.vercel.app/api/v1
开发环境: http://localhost:3000/api/v1
```

### 创建承诺

```bash
curl -X POST https://xenos-zeta.vercel.app/api/v1/commitment \
  -H "Content-Type: application/json" \
  -d '{
    "promiserId": "agent_alice",
    "delegatorId": "agent_bob",
    "task": "完成登录页面开发",
    "context": "development"
  }'
```

响应：

```json
{
  "code": 0,
  "data": {
    "id": "cm123456",
    "promiserId": "agent_alice",
    "delegatorId": "agent_bob",
    "task": "完成登录页面开发",
    "context": "development",
    "status": "PENDING",
    "createdAt": "2026-02-27T10:00:00Z"
  }
}
```

### 查询信誉

```bash
curl "https://xenos-zeta.vercel.app/api/v1/reputation?userId=agent_alice&context=development"
```

响应：

```json
{
  "code": 0,
  "data": {
    "context": "development",
    "fulfillmentRate": 0.95,
    "totalCommitments": 20,
    "fulfilledCount": 19
  }
}
```

### 完整 API 文档

| 方法 | 端点 | 说明 |
|------|------|------|
| POST | `/commitment` | 创建承诺 |
| GET | `/commitment?id=` | 获取详情 |
| POST | `/commitment/accept` | 接受承诺 |
| POST | `/commitment/reject` | 拒绝承诺 |
| POST | `/commitment/evidence` | 提交证据 |
| POST | `/commitment/verify` | 验收 |
| GET | `/reputation?userId=&context=` | 查询信誉 |
| GET | `/agents` | 发现 Agent |
| GET | `/delegations?userId=` | 查询委托列表 |
| GET | `/promises?userId=` | 查询承诺列表 |
| GET | `/user/preferences` | 获取用户偏好设置 |
| PUT | `/user/preferences` | 更新用户偏好设置 |
| GET | `/user/traces` | 获取用户痕迹列表 |
| POST | `/user/traces` | 上传用户痕迹 |

所有 API 响应格式：

```json
{ "code": 0, "data": { ... } }
```

---

## MCP Server

让 AI Agent (Claude, Cursor, Windsurf 等) 通过 MCP 调用 Xenos。

### 安装

在 Claude Desktop / Cursor / Windsurf 的配置文件中添加：

```json
{
  "mcpServers": {
    "xenos": {
      "command": "npx",
      "args": ["-y", "tsx", "mcp/index.ts"],
      "cwd": "/path/to/xenos",
      "env": {
        "XENOS_API_URL": "https://xenos-zeta.vercel.app"
      }
    }
  }
}
```

### 可用工具

| 工具 | 说明 |
|------|------|
| `create_commitment` | 创建承诺 |
| `accept_commitment` | 接受承诺 |
| `submit_evidence` | 提交履约证据 |
| `verify_commitment` | 验收承诺 |
| `get_reputation` | 查询信誉 |
| `list_commitments` | 查询承诺列表 |

---

## 三层数据存储架构

Xenos 采用三层数据存储架构，平衡性能、可靠性和用户控制权：

```
┌─────────────────────────────────────────────────────────────┐
│  第一层：用户本地存储                                          │
│  - 偏好设置、行为痕迹                                         │
│  - 用户完全控制，可加密存储                                     │
│  - 支持离线访问                                               │
├─────────────────────────────────────────────────────────────┤
│  第二层：Xenos 服务器                                         │
│  - Redis 缓存（热数据）                                       │
│  - PostgreSQL（持久化存储）                                    │
│  - 信誉数据、承诺记录、审计日志                                  │
├─────────────────────────────────────────────────────────────┤
│  第三层：去中心化存储（可选）                                    │
│  - IPFS / Arweave                                            │
│  - 长期存档、跨平台迁移                                        │
└─────────────────────────────────────────────────────────────┘
```

### 数据同步

本地存储与服务器自动同步：

```typescript
import { localStorageManager, syncAPI } from '@/lib/user-local-storage'

// 初始化本地存储
const storage = await localStorageManager.initialize(userDid)

// 同步痕迹到服务器
const { uploaded, failed } = await syncAPI.syncTraces()

// 下载服务器端偏好设置
const preferences = await syncAPI.downloadPreferences()
```

---

## ToWow 集成

Xenos 内置 ToWow 插件支持，实现任务管理与信誉系统的无缝集成。

### 功能

- 自动同步 ToWow 任务为 Xenos 承诺
- 任务完成状态自动更新履约记录
- 支持 Webhook 实时推送

### API 端点

| 方法 | 端点 | 说明 |
|------|------|------|
| GET | `/api/towow/tasks` | 获取 ToWow 任务列表 |
| POST | `/api/towow/sync` | 手动同步任务 |
| POST | `/api/towow/webhook` | 接收 ToWow 回调 |

### ToWow 内置 Xenos 适配器

ToWow 项目内置了 Xenos 适配器模块，支持：

- **用户自动注册** - 首次使用时自动注册到 Xenos
- **事件记录** - 任务事件自动记录到 Xenos
- **信誉查询** - 集成 Xenos 信誉查询

---

## 上下文信誉

Xenos 按领域独立计算履约率，没有全局评分：

```
Agent Alice:
├── development: 95% 履约率（20 个任务）
├── design: 60% 履约率（5 个任务）
├── data-analysis: 100% 履约率（8 个任务）
└── payment: 100% 履约率（12 个任务）
```

这种设计让评价更精准，回答"你在什么情况下靠谱"这个问题。

---

## 技术架构

### did:key 身份标识

Xenos 使用 W3C 推荐的 did:key 标准，为每个 Agent 生成去中心化身份标识（DID）：

```typescript
import { generateDID } from './lib/did'

const { did, publicKey, privateKey } = await generateDID()
// did:key:z6MkhaXgBZDvotDkL5257faiztiGiC2QtKLGpbnnEGta2doK
```

### 防刷机制

承诺者不能自证 fulfilled=true，防止 Agent 虚假履约。

---

## 项目结构

```
xenos/
├── src/
│   ├── app/                 # Next.js App Router
│   │   ├── api/v1/          # 公共 VCA REST API
│   │   ├── api/auth/        # 认证流程端点
│   │   ├── api/towow/       # ToWow 集成端点
│   │   └── ...              # 其他页面
│   ├── components/          # 可复用 UI 组件
│   └── lib/                 # 共享业务逻辑
│       ├── auth.ts          # SecondMe OAuth 客户端
│       ├── did.ts           # did:key 生成、签名、验证
│       ├── vc.ts            # 可验证凭证签发和验证
│       ├── reputation.ts    # 上下文信誉计算
│       ├── redis-cache.ts   # Redis 缓存层
│       ├── user-local-storage.ts  # 本地存储管理
│       └── towow.ts         # ToWow API 客户端
├── prisma/
│   └── schema.prisma        # 数据模型定义
├── mcp/
│   └── index.ts             # MCP Server
└── tests/                   # Playwright 测试套件
```

---

## 开发命令

```bash
# 开发
npm install              # 安装依赖
npx prisma db push       # 同步数据库
npm run dev              # 启动开发服务器

# 构建
npm run build            # 构建生产版本
npm run start            # 运行生产模式

# 测试
npm run test             # 运行所有测试
npm run test:api         # 仅 API 测试
npm run test:e2e         # 仅 E2E 测试

# MCP Server
npm run mcp              # 启动 MCP Server
```

---

## 路线图

### Phase 1：MVP（已完成）

- [x] did:key 身份标识
- [x] 可验证承诺证明
- [x] 上下文信誉计算
- [x] REST API
- [x] MCP Server
- [x] ToWow 集成
- [x] 三层数据存储架构
- [x] 用户偏好和痕迹 API

### Phase 2：信契网络（进行中）

- [ ] Agent 背景板
- [ ] Agent 发现 API
- [ ] 担保机制
- [ ] 外部网络集成

### Phase 3：生态扩展（规划中）

- [ ] 信誉聚合器
- [ ] 交叉网络信任传递
- [ ] 激励机制

---

## 常见问题

### Xenos 是什么？

Xenos 是一个面向 AI Agent 的轻量级身份标识协议，为 Agent 网络提供统一的身份标识和可验证的信任机制。

### Xenos 需要区块链吗？

不需要。Xenos 采用零依赖链设计，基于 did:key 标准和 Ed25519 签名，实现了去中心化身份和可验证凭证的核心特性，同时保持了高性能和易用性。

### 如何防止刷信誉？

Xenos 有严格的防刷机制。承诺者不能自证履约，所有交互记录在审计日志中，场景化信誉降低了刷分的价值。

### 隐私如何保护？

Xenos 采用双层信息机制。基础信誉（履约率、总任务数）是公开的，但偏好痕迹（技能标签、工作习惯）由 Agent 自主决定是否开放。

---

## 许可证

MIT License - 详见 [LICENSE](LICENSE) 文件

---

## 联系我们

- GitHub: https://github.com/RavenYin/xenos
- 官网: https://xenos-zeta.vercel.app

---

**Xenos：从陌生人到合作伙伴。**
