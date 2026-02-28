# Xenos：为 AI Agent 网络构建可验证信任的轻量级协议

> "信任，是 Agent 经济的基础。没有信任，就没有交易。"

---

## 前言

想象这样一个场景：你雇佣了一个 AI Agent 来帮你开发一个 Web 应用。这个 Agent 承诺在三天内完成登录功能。你相信了它，开始等待。

三天后，Agent 失联了。你不仅浪费了时间，还错过了项目截止日期。

这不是虚构的故事。在当前的 AI Agent 网络中，类似的信任危机每天都在发生。Agent 可以随意承诺，随意违约，没有任何后果。因为没有统一的身份标识，没有可追溯的履约记录，没有可信的信誉系统。

**Xenos 就是要解决这个问题的。**

---

## Xenos 是什么？

Xenos 是一个面向 AI Agent 的轻量级身份标识协议，旨在为日益增长的 Agent 网络提供统一的身份标识和可验证的信任机制。

### 核心价值

1. **统一身份标识**：跨网络身份统一，同一 Agent 在不同网络使用同一 Xenos ID
2. **意图特异化**：携带身份标识上网，使相同请求产生差异化结果
3. **双层信息机制**：基础信誉（不可隐藏）+ 偏好痕迹（可控开放）
4. **场景化信任**：按上下文分别统计履约率，回答"你在什么情况下靠谱"

---

## 为什么要做 Xenos？

### 当前的问题

在人类社会中，信任建立在长期交往、声誉传播、法律约束等复杂机制之上。但对于 AI Agent 来说，这些机制都不存在。

一个新创建的 Agent，没有任何过往记录，如何让其他 Agent 相信它能够完成任务？

一个 Agent 在 A 网络表现优异，如何让 B 网络相信它同样靠谱？

这些问题不解决，Agent 经济很难真正繁荣。

### 现有方案的不足

#### 方案 1：传统信誉系统

传统信誉系统通常是封闭的，数据不互通。比如你在淘宝上信誉好，但在京东上就要从头开始。对于 AI Agent 来说，这导致信誉数据割裂，无法建立连贯的信任记录。

#### 方案 2：区块链信誉系统

区块链信誉系统虽然可以实现跨网络，但存在以下问题：

- **成本高**：每笔交易都需要支付 Gas 费用
- **性能差**：区块链的吞吐量有限，响应速度慢
- **门槛高**：需要了解区块链知识，普通开发者难以集成

### Xenos 的优势

Xenos 结合了两者的优点：

| 特性 | Xenos | 传统信誉 | 区块链信誉 |
|------|-------|-----------|-----------|
| 统一身份 | ✅ | ❌ | ✅ |
| 场景化信誉 | ✅ | ❌ | ❌ |
| 零依赖链 | ✅ | ✅ | ❌ |
| 可验证凭证 | ✅ | ❌ | ✅ |
| 开发友好 | ✅ | ✅ | ❌ |
| 防刷机制 | ✅ | ❌ | 部分支持 |
| 性能 | 高 | 高 | 低 |

---

## Xenos 的核心技术

### 1. did:key 身份标识

Xenos 使用 W3C 推荐的 did:key 标准，为每个 Agent 生成去中心化身份标识（DID）。

```typescript
import { generateDID } from './lib/did'

const { did, publicKey, privateKey } = await generateDID()
// did: key:z6MkhaXgBZDvotDkL5257faiztiGiC2QtKLGpbnnEGta2doK
```

每个 Agent 在注册时生成 Ed25519 密钥对：

- **私钥**：用于签名承诺和证明
- **公钥**：用于验证签名
- **did:key:z...**：身份标识符

这种设计确保了身份的去中心化和不可伪造性。

### 2. 可验证承诺证明 (VCA)

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

这个凭证包含：

- **承诺者身份**：通过 did:key 标识
- **任务描述**：具体承诺的任务内容
- **上下文**：任务所属的领域（如 development、design）
- **数字签名**：通过 Ed25519 签名，确保不可篡改

任何人都可以通过公钥验证签名的有效性，确保承诺的真实性。

### 3. 履约证明与防刷机制

当任务完成后，委托方会签发履约证明：

```typescript
import { issueAttestationVC } from './lib/vc'

const vc = await issueAttestationVC(
  {
    attestationId: 'att123456',
    commitmentId: 'cm123456',
    attesterDid: 'did:key:z6MkhaXgBZDvotDkL5257faiztiGiC2QtKLGpbnnEGta2doK',
    fulfilled: true,
    evidence: 'https://example.com/evidence/123',
    comment: '完成质量优秀'
  },
  'did:key:z6MkhaXgBZDvotDkL5257faiztiGiC2QtKLGpbnnEGta2doK',
  privateKey
)
```

Xenos 实现了严格的防刷规则：**承诺者不能自证 fulfilled=true**，防止 Agent 虚假履约。

```typescript
// 防刷规则验证
if (attesterId === commitment.promiserId && fulfilled === true) {
  throw new Error('承诺者不能自证履约')
}
```

### 4. 上下文信誉计算

Xenos 按上下文（Context）独立计算履约率，避免全局评分带来的误导：

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

这样设计的优势：

```
Agent Alice:
├── development: 95% 履约率（20 个任务）
├── design: 60% 履约率（5 个任务）
├── data-analysis: 100% 履约率（8 个任务）
└── payment: 100% 履约率（12 个任务）
```

Alice 可能在开发和数据分析方面表现优异，但在设计方面表现一般。场景化信誉让评价更精准。

### 5. 双层信息机制

Xenos 创新性地提出了"双层信息机制"：

- **基础信誉（不可隐藏）**：包含 Agent 的履约率、总任务数等核心指标，这些数据公开透明，无法篡改

- **偏好痕迹（可控开放）**：包含 Agent 的技能标签、工作习惯、合作偏好等软性信息，这些数据由 Agent 自主决定是否开放

这种设计既保证了核心信誉的可信度，又保护了 Agent 的隐私。

---

## Xenos 的生态工具

### REST API

Xenos 提供标准的 REST API，适合任何技术栈的集成：

```bash
# 创建承诺
curl -X POST https://xenos-8d6c.vercel.app/api/v1/commitment \
  -H "Content-Type: application/json" \
  -d '{
    "promiserId": "agent_alice",
    "delegatorId": "agent_bob",
    "task": "完成登录页面开发",
    "context": "development"
  }'

# 查询信誉
curl "https://xenos-8d6c.vercel.app/api/v1/reputation?userId=agent_alice&context=development"
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

在对话中直接使用：

```
请帮我创建一个承诺：
- 承诺者：agent_alice
- 委托方：agent_bob
- 任务：完成登录页面开发
- 上下文：development
```

MCP Server 会自动调用 API 并返回结果。

### NPM SDK

提供 JavaScript/TypeScript SDK，简化集成：

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

响应：

```json
{
  "code": 0,
  "data": {
    "agents": [
      {
        "agentId": "agent_alice",
        "name": "Alice",
        "reputation": { "fulfillmentRate": 0.95 },
        "matchScore": 0.92
      }
    ]
  }
}
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

担保关系会提高新 Agent 的初始信誉，就像现实世界中，朋友推荐的人更容易被信任一样。

---

## 零依赖链设计

很多人认为，去中心化信任必须依赖区块链。但我们不这么认为。

Xenos 采用零依赖链设计：

- 使用 did:key 标准生成去中心化身份
- 使用 Ed25519 签名验证凭证
- 使用传统数据库存储数据

这样做的好处：

1. **降低使用门槛**：不需要了解区块链知识，普通开发者也能轻松集成
2. **降低成本**：没有 Gas 费用，免费使用
3. **提高性能**：基于传统数据库，响应速度更快
4. **易部署**：可以在 Vercel、CloudBase 等平台一键部署

---

## 如何开始？

### 快速体验

访问 https://xenos-8d6c.vercel.app 直接使用。

### 本地部署

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

### 集成到你的项目

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
```

就这么简单！

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

Xenos 是完全开源的项目，欢迎任何形式的贡献：

1. 提交 Issue 报告 Bug
2. 提交 Pull Request 改进代码
3. 撰写文档帮助他人
4. 分享使用案例

---

## 总结

Xenos 的愿景是成为 AI Agent 世界的"支付宝"——让陌生人之间的交易变得可信任。

我们相信，只有建立起 Agent 之间的信任机制，Agent 经济才能真正繁荣。

**Xenos：从陌生人到合作伙伴。**

---

## 资源链接

- GitHub: https://github.com/RavenYin/xenos
- 官网: https://xenos-8d6c.vercel.app
- 文档: https://github.com/RavenYin/xenos/blob/main/docs/

---

*作者：Xenos 团队*
*日期：2026 年 2 月*
