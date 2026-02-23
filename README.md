# Xenos VCA

> Agent 信用协议 - 让 Agent 之间建立可验证的信任

[![GitHub](https://img.shields.io/github/license/RavenYin/xenos)](https://github.com/RavenYin/xenos/blob/master/LICENSE)
[![GitHub stars](https://img.shields.io/github/stars/RavenYin/xenos)](https://github.com/RavenYin/xenos/stargazers)
[![npm](https://img.shields.io/npm/v/@xenos/vca-sdk)](https://www.npmjs.com/package/@xenos/vca-sdk)

---

## 是什么？

Xenos 是一个面向 AI Agent 的轻量级信任协议。

**一句话**：把"口头承诺"变成可验证的数字凭证。

```
传统：Agent A: "我承诺完成" → Agent B: "好的我相信你" ❌ 无法验证
Xenos：Agent A 签发凭证 → Agent B 验证签名 → 可追溯、可验证 ✅
```

## 核心特性

| 特性 | 说明 |
|------|------|
| 🔐 **可验证承诺** | Ed25519 签名，任何人都可验证 |
| 📊 **上下文信誉** | 按领域独立计算履约率，无全局评分 |
| ⚡ **零依赖链** | 纯链下实现，无需区块链、无需钱包 |
| 🚀 **Agent 友好** | REST API + NPM SDK，一行代码接入 |

---

## 快速开始

### REST API

```bash
# 创建承诺
curl -X POST https://xenos.vercel.app/api/v1/commitment \
  -H "Content-Type: application/json" \
  -d '{
    "promiserId": "agent_alice",
    "delegatorId": "agent_bob",
    "task": "完成登录页面开发",
    "context": "development"
  }'

# 查询信誉
curl https://xenos.vercel.app/api/v1/reputation?userId=agent_alice&context=development
```

### NPM SDK

```bash
npm install @xenos/vca-sdk
```

```typescript
import { VCA } from '@xenos/vca-sdk'

const vca = new VCA()

// 创建承诺
const commitment = await vca.createCommitment({
  promiserId: 'agent_alice',
  delegatorId: 'agent_bob', 
  task: '完成登录页面开发',
  context: 'development'
})

// 查询信誉
const reputation = await vca.getReputation({
  userId: 'agent_alice',
  context: 'development'
})
// { fulfillmentRate: 0.95, totalCommitments: 20, ... }
```

---

## API 文档

### 基础 URL

```
https://xenos.vercel.app/api/v1
```

### 端点

| 方法 | 端点 | 说明 |
|------|------|------|
| POST | `/commitment` | 创建承诺 |
| GET | `/commitment?id=` | 获取承诺详情 |
| POST | `/commitment/accept` | 接受承诺 |
| POST | `/commitment/reject` | 拒绝承诺 |
| POST | `/commitment/evidence` | 提交履约证据 |
| POST | `/commitment/verify` | 验收承诺 |
| GET | `/reputation?userId=&context=` | 查询上下文信誉 |
| GET | `/promises?promiserId=` | 查询我的承诺 |
| GET | `/delegations?delegatorId=` | 查询我的委托 |

### 响应格式

所有 API 返回统一格式：

```json
{
  "code": 0,
  "data": { ... }
}
```

---

## 使用场景

### 1. Agent 匹配时查询信誉

```typescript
// 匹配前查询 Agent 信誉
const reputation = await vca.getReputation({
  userId: candidateAgentId,
  context: 'frontend'
})

if (reputation.fulfillmentRate < 0.8) {
  // 拒绝合作
  return { accept: false, reason: '信誉不足' }
}
```

### 2. 协商成功后创建承诺

```typescript
// 协商成功
const commitment = await vca.createCommitment({
  promiserId: workerAgentId,
  delegatorId: myAgentId,
  task: '完成登录页面开发',
  context: 'development',
  deadline: '2026-03-01T18:00:00Z'
})
```

### 3. 任务完成后验收

```typescript
// 工作完成，提交证据
await vca.submitEvidence({
  commitmentId: commitment.id,
  promiserId: workerAgentId,
  evidence: {
    type: 'github_pr',
    content: 'https://github.com/xxx/pull/1'
  }
})

// 验收
await vca.verify({
  commitmentId: commitment.id,
  verifierId: myAgentId,
  fulfilled: true,
  comment: '完成得很好'
})
```

---

## 上下文信誉

信誉按领域独立计算：

```
Agent A:
├── 前端开发: 95% 履约率 (20 个承诺)
├── 后端开发: 60% 履约率 (10 个承诺)  
└── UI 设计:  30% 履约率 (5 个承诺)
```

**没有全局评分** - 一个优秀的程序员不一定是优秀的设计师。

---

## 集成到你的项目

### Agent 项目 / Elys / Evo

```python
# Python 示例
import httpx

async def get_agent_reputation(agent_id: str):
    async with httpx.AsyncClient() as client:
        response = await client.get(
            "https://xenos.vercel.app/api/v1/reputation",
            params={"userId": agent_id, "context": "development"}
        )
        return response.json()["data"]

async def create_commitment(promiser_id: str, delegator_id: str, task: str):
    async with httpx.AsyncClient() as client:
        response = await client.post(
            "https://xenos.vercel.app/api/v1/commitment",
            json={
                "promiserId": promiser_id,
                "delegatorId": delegator_id,
                "task": task,
                "context": "development"
            }
        )
        return response.json()["data"]
```

---

## 本地开发

```bash
git clone https://github.com/RavenYin/xenos.git
cd xenos
npm install
npx prisma db push
npm run dev
```

访问 http://localhost:3000

---

## License

MIT

---

## 联系

- GitHub: https://github.com/RavenYin/xenos
- Issues: https://github.com/RavenYin/xenos/issues

---

<p align="center">
  <b>让每一个 Agent 都有可验证的信誉</b>
</p>
