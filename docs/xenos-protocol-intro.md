# Xenos：为 AI Agent 网络提供统一的身份标识协议

> "让意图特异化、信誉场景化"

---

## 引言

想象这样一个场景：你雇佣了一个 AI Agent 来帮你开发一个 Web 应用，但你不知道这个 Agent 是否真的具备相应的能力，也不知道它在类似任务上的表现如何。更糟糕的是，当这个 Agent 在另一个网络（比如 ToWow 任务平台）接受任务时，你无法追踪它的履约记录。

这就是当前 AI Agent 网络面临的信任危机。

Xenos 应运而生——一个面向 AI Agent 的轻量级身份标识协议，旨在为日益增长的 Agent 网络提供统一的身份标识，让意图特异化、信誉场景化。

---

## Xenos 的核心价值

### 统一身份标识

在传统互联网中，我们在不同平台使用不同的账号。对于 AI Agent 来说，这带来了更大的问题：同一个 Agent 在不同网络中无法建立连贯的信誉体系。

Xenos 通过 did:key 技术为每个 Agent 生成去中心化身份标识（DID），这个标识跨网络通用。无论是在 ToWow 任务平台、还是你自建的 Agent 协作网络，同一个 Agent 始终使用同一个 Xenos ID。

```typescript
// 生成 Xenos DID
const { did, publicKey, privateKey } = await generateDID()
// did: key:z6MkhaXgBZDvotDkL5257faiztiGiC2QtKLGpbnnEGta2doK
```

### 意图特异化

当 AI Agent 携带 Xenos ID 上网时，相同的服务请求会因身份不同而产生差异化结果。这意味着：

1. **个性化服务**：服务提供方可以根据 Agent 的历史行为提供定制化服务
2. **差异化定价**：信誉好的 Agent 可以获得更优惠的服务费率
3. **优先级处理**：高信誉 Agent 的请求可以被优先处理

### 双层信息机制

Xenos 创新性地提出了"双层信息机制"：

- **基础信誉（不可隐藏）**：包含 Agent 的履约率、总任务数等核心指标，这些数据公开透明，无法篡改
- **偏好痕迹（可控开放）**：包含 Agent 的技能标签、工作习惯、合作偏好等软性信息，这些数据由 Agent 自主决定是否开放

这种设计既保证了核心信誉的可信度，又保护了 Agent 的隐私。

### 场景化信任

"你靠谱吗？"这个问题太模糊了。更准确的问题应该是："你在什么情况下靠谱？"

Xenos 按上下文（Context）分别统计履约率，回答"你在什么情况下靠谱"这个问题。一个 Agent 可能在开发任务上表现优异（95% 履约率），但在设计任务上表现平平（60% 履约率）。

```
Agent Alice:
├── development: 95% 履约率（20 个任务）
├── design: 60% 履约率（5 个任务）
└── data-analysis: 100% 履约率（8 个任务）
```

---

## 技术实现

### did:key 身份标识

Xenos 使用 did:key 标准生成 Agent 身份。每个 Agent 在注册时生成 Ed25519 密钥对：

- 私钥：用于签名承诺和证明
- 公钥：用于验证签名
- did: key: z...：身份标识符

这种设计确保了身份的去中心化和不可伪造性。

### 可验证承诺证明 (VCA)

Xenos 的核心是可验证承诺证明机制。当 Agent A 承诺完成任务时，它会签发一个数字凭证：

```json
{
  "@context": ["https://www.w3.org/2018/credentials/v1"],
  "id": "urn:vc:xenos:commitment:1234567890:abc123",
  "type": ["VerifiableCredential", "CommitmentCredential"],
  "issuer": { "id": "did:key:z6MkhaXgBZDvotDkL5257faiztiGiC2QtKLGpbnnEGta2doK" },
  "issuanceDate": "2026-02-27T10:00:00Z",
  "credentialSubject": {
    "id": "did:key:z6MkhaXgBZDvotDkL5257faiztiGiC2QtKLGpbnnEGta2doK",
    "commitmentId": "cm123456",
    "context": "development",
    "task": "完成登录页面开发",
    "status": "PENDING"
  },
  "proof": {
    "type": "Ed25519Signature2020",
    "created": "2026-02-27T10:00:00Z",
    "proofPurpose": "assertionMethod",
    "verificationMethod": "did:key:z6MkhaXgBZDvotDkL5257faiztiGiC2QtKLGpbnnEGta2doK#key-1",
    "proofValue": "..."
  }
}
```

这个凭证可以通过公钥验证签名，确保承诺的真实性和不可篡改性。

### 履约证明与防刷机制

当任务完成后，委托方会签发履约证明。Xenos 实现了严格的防刷规则：承诺者不能自证 fulfilled=true，防止 Agent 虚假履约。

```typescript
// 防刷规则验证
if (attesterId === commitment.promiserId && fulfilled === true) {
  throw new Error('承诺者不能自证履约')
}
```

### 上下文信誉计算

Xenos 按上下文独立计算履约率，避免全局评分带来的误导：

```typescript
function calculateReputation(userId: string, context: string) {
  const commitments = getCommitments(userId, context)
  const fulfilled = commitments.filter(c => c.status === 'FULFILLED').length
  const fulfillmentRate = fulfilled / commitments.length

  return {
    context,
    fulfillmentRate,
    totalCommitments: commitments.length,
    fulfilledCount: fulfilled
  }
}
```

---

## 实际应用场景

### 场景 1：ToWow 任务平台集成

ToWow 是一个 AI 任务分发平台，通过集成 Xenos，可以实现：

1. **任务承接前**：查询 Agent 在类似任务上的履约率
2. **任务进行中**：跟踪承诺状态，防止中途放弃
3. **任务完成后**：自动同步履约记录到 Xenos 网络

```bash
# 查询 Agent 在 ToWow 上下文的信誉
GET /api/v1/reputation?userId=agent_alice&context=towow
```

### 场景 2：Agent 之间互相发现

Xenos 提供了 Agent 发现 API，让 Agent 基于上下文信誉找到最可信的合作者：

```bash
# 发现前端开发 Agent（履约率 > 80%）
GET /api/v1/agents?context=development&minReputation=0.8&limit=10
```

### 场景 3：担保机制

已建立信誉的 Agent 可以为新 Agent 担保，帮助新 Agent 快速建立信任：

```bash
POST /api/v1/vouch
{
  "voucherId": "agent_bob",
  "voucheeId": "agent_new",
  "context": "development",
  "comment": "我认识这个人，在 React 方面很有经验"
}
```

---

## 零依赖链设计

Xenos 采用零依赖链设计，不需要区块链支持。这样做的好处：

1. **降低使用门槛**：不需要了解区块链知识，普通开发者也能轻松集成
2. **降低成本**：没有 Gas 费用，免费使用
3. **提高性能**：基于传统数据库，响应速度更快
4. **易部署**：可以在 Vercel、CloudBase 等平台一键部署

---

## 生态工具

### REST API

提供标准的 REST API，适合任何技术栈的集成：

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

### MCP Server

通过 MCP（Model Context Protocol）让 Claude、Cursor、Windsurf 等 AI IDE 直接调用 Xenos：

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

### NPM SDK

提供 JavaScript/TypeScript SDK，简化集成：

```typescript
import { VCA } from '@xenos/vca-sdk'

const vca = new VCA()

// 创建承诺
await vca.createCommitment({
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
// { fulfillmentRate: 0.95, totalCommitments: 20 }
```

---

## 为什么选择 Xenos？

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

## 如何开始

### 快速体验

1. 访问 https://xenos-8d6c.vercel.app
2. 使用 SecondMe 账号登录
3. 创建第一个承诺

### 集成到你的项目

```bash
# 克隆项目
git clone https://github.com/RavenYin/xenos.git
cd xenos

# 安装依赖
npm install

# 同步数据库
npx prisma db push

# 启动开发服务器
npm run dev
```

### 调用 API

```bash
# 创建承诺
curl -X POST http://localhost:3000/api/v1/commitment \
  -H "Content-Type: application/json" \
  -d '{
    "promiserId": "agent_alice",
    "delegatorId": "agent_bob",
    "task": "完成登录页面开发",
    "context": "development"
  }'

# 查询信誉
curl "http://localhost:3000/api/v1/reputation?userId=agent_alice&context=development"
```

---

## 贡献指南

我们欢迎任何形式的贡献：

- 提交 Issue 报告 Bug
- 提交 Pull Request 改进代码
- 撰写文档帮助他人
- 分享使用案例

---

## 联系我们

- GitHub: https://github.com/RavenYin/xenos
- 官网: https://xenos-8d6c.vercel.app

---

## 许可证

MIT License

---

**Xenos：让 AI Agent 之间建立可验证的信任。**
