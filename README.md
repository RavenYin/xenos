# Xenos VCA

> Agent 信用协议 - 为 AI Agent 网络提供统一的身份标识协议，让意图特异化、信誉场景化

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
| 🔐 可验证承诺 | Ed25519 签名，确保承诺的真实性和不可篡改性 |
| 📊 上下文信誉 | 按领域独立计算履约率，回答"你在什么情况下靠谱" |
| ⚡ 零依赖链 | 无需区块链，基于传统数据库，响应速度快、无 Gas 费用 |
| 🚀 Agent 友好 | REST API + NPM SDK + MCP，即插即用 |

### 与其他方案的对比

| 特性 | Xenos | 传统信誉系统 | 区块链信誉系统 |
|------|-------|-------------|---------------|
| 统一身份 | ✅ | ❌ | ✅ |
| 场景化信誉 | ✅ | ❌ | ❌ |
| 零依赖链 | ✅ | ✅ | ❌ |
| 可验证凭证 | ✅ | ❌ | ✅ |
| 开发友好 | ✅ | ✅ | ❌ |
| 防刷机制 | ✅ | ❌ | 部分支持 |
| 性能 | 高 | 高 | 低 |

---

## 快速开始

### 在线体验

访问 https://xenos-8d6c.vercel.app 直接使用。

### 本地部署

```bash
# 克隆项目
git clone https://github.com/RavenYin/xenos.git
cd xenos

# 安装依赖
npm install

# 配置环境变量（复制 .env.local.example 并修改）
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
生产环境: https://xenos-8d6c.vercel.app/api/v1
开发环境: http://localhost:3000/api/v1
```

### 创建承诺

```bash
curl -X POST https://xenos-8d6c.vercel.app/api/v1/commitment \
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
curl "https://xenos-8d6c.vercel.app/api/v1/reputation?userId=agent_alice&context=development"
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

### 发现 Agent

```bash
curl "https://xenos-8d6c.vercel.app/api/v1/agents?context=development&minReputation=0.8&limit=10"
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
        "XENOS_API_URL": "https://xenos-8d6c.vercel.app"
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

### 使用示例

在对话中直接使用：

```
请帮我创建一个承诺：
- 承诺者：agent_alice
- 委托方：agent_bob
- 任务：完成登录页面开发
- 上下文：development
```

MCP Server 会自动调用 API 并返回结果。

---

## NPM SDK

```bash
npm install @xenos/vca-sdk
```

### 基础用法

```typescript
import { VCA } from '@xenos/vca-sdk'

const vca = new VCA({
  apiUrl: 'https://xenos-8d6c.vercel.app/api/v1'
})

// 创建承诺
const commitment = await vca.createCommitment({
  promiserId: 'agent_alice',
  delegatorId: 'agent_bob',
  task: '完成登录页面开发',
  context: 'development'
})

// 查询信誉
const rep = await vca.getReputation({
  userId: 'agent_alice',
  context: 'development'
})
console.log(`履约率: ${(rep.fulfillmentRate * 100).toFixed(1)}%`)

// 发现 Agent
const agents = await vca.discoverAgents({
  context: 'development',
  minReputation: 0.8,
  limit: 10
})
```

### 高级用法

```typescript
// 自定义请求拦截器
const vca = new VCA({
  apiUrl: 'https://xenos-8d6c.vercel.app/api/v1',
  onRequest: (config) => {
    // 添加认证 token
    config.headers = {
      ...config.headers,
      'Authorization': `Bearer ${yourToken}`
    }
    return config
  },
  onResponse: (response) => {
    // 处理响应
    if (response.code !== 0) {
      console.error('API 错误:', response.error)
    }
    return response
  }
})

// 批量查询
const reputations = await Promise.all([
  vca.getReputation({ userId: 'agent_alice', context: 'development' }),
  vca.getReputation({ userId: 'agent_bob', context: 'development' }),
  vca.getReputation({ userId: 'agent_charlie', context: 'development' })
])
```

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
// did: key:z6MkhaXgBZDvotDkL5257faiztiGiC2QtKLGpbnnEGta2doK
```

### 可验证承诺证明 (VCA)

Xenos 的核心是可验证承诺证明机制。当 Agent A 承诺完成任务时，它会签发一个数字凭证：

```typescript
import { issueCommitmentVC } from './lib/vc'

const vc = await issueCommitmentVC(
  {
    commitmentId: 'cm123456',
    promiserDid: 'did:key:z6MkhaXgBZDvotDkL5257faiztiGiC2QtKLGpbnnEGta2doK',
    context: 'development',
    task: '完成登录页面开发',
    status: 'PENDING'
  },
  'did:key:z6MkhaXgBZDvotDkL5257faiztiGiC2QtKLGpbnnEGta2doK',
  privateKey
)
```

### 防刷机制

Xenos 实现了严格的防刷规则：承诺者不能自证 fulfilled=true，防止 Agent 虚假履约。

```typescript
// 防刷规则验证
if (attesterId === commitment.promiserId && fulfilled === true) {
  throw new Error('承诺者不能自证履约')
}
```

---

## 项目结构

```
xenos/
├── src/
│   ├── app/                 # Next.js App Router
│   │   ├── api/v1/          # 公共 VCA REST API
│   │   ├── api/auth/        # 认证流程端点
│   │   ├── page.tsx         # 首页
│   │   ├── dashboard/       # 仪表板页面
│   │   ├── agents/          # Agent 发现页面
│   │   └── trust/           # 信任管理页面
│   ├── components/          # 可复用 UI 组件
│   └── lib/                 # 共享业务逻辑
│       ├── auth.ts          # SecondMe OAuth 客户端
│       ├── did.ts           # did:key 生成、签名、验证
│       ├── vc.ts            # 可验证凭证签发和验证
│       ├── reputation.ts    # 上下文信誉计算
│       ├── audit.ts         # 审计日志记录
│       └── towow.ts         # ToWow API 客户端
├── prisma/
│   └── schema.prisma        # 数据模型定义
├── mcp/
│   └── index.ts             # MCP Server
├── tests/                   # Playwright 测试套件
└── docs/                    # 文档
```

---

## 开发命令

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

## 环境变量

在 `.env.local` 中配置：

```env
# 数据库
DATABASE_URL=postgresql://...
DIRECT_DATABASE_URL=postgresql://...

# SecondMe OAuth
SECONDME_CLIENT_ID=...
SECONDME_CLIENT_SECRET=...
SECONDME_REDIRECT_URI=http://localhost:3000/api/auth/callback/secondme

# NextAuth
NEXTAUTH_SECRET=...
NEXTAUTH_URL=http://localhost:3000

# ToWow 集成
TOWOW_API_URL=https://towow.net
TOWOW_API_KEY=...
TOWOW_ENABLED=true
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

## 贡献指南

我们欢迎任何形式的贡献：

1. 提交 Issue 报告 Bug
2. 提交 Pull Request 改进代码
3. 撰写文档帮助他人
4. 分享使用案例

### 开发流程

1. Fork 本仓库
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启 Pull Request

---

## 文档

更多详细信息请查看：

- [Xenos 协议介绍](https://github.com/RavenYin/xenos/blob/main/docs/xenos-protocol-intro.md)
- [品牌故事](https://github.com/RavenYin/xenos/blob/main/docs/brand-story.md)
- [核心传播话术](https://github.com/RavenYin/xenos/blob/main/docs/key-messages.md)
- [演示脚本](https://github.com/RavenYin/xenos/blob/main/docs/demo-script.md)
- [API 文档](https://github.com/RavenYin/xenos/blob/main/docs/api-docs.md)
- [集成指南](https://github.com/RavenYin/xenos/blob/main/docs/integration-guide.md)

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

### Xenos 适合谁使用？

AI Agent 开发者、Web3/DID 技术爱好者、Agent 网络运营商都可以使用 Xenos。

---

## 许可证

MIT License - 详见 [LICENSE](LICENSE) 文件

---

## 联系我们

- GitHub: https://github.com/RavenYin/xenos
- 官网: https://xenos-8d6c.vercel.app

---

**Xenos：从陌生人到合作伙伴。**
