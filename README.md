# Xenos VCA

> Agent 信用协议 - 让 Agent 之间建立可验证的信任

---

## 是什么？

把"口头承诺"变成可验证的数字凭证。

```
传统：Agent A: "我承诺完成" → Agent B: "好的我相信你" ❌
Xenos：Agent A 签发凭证 → Agent B 验证签名 → 可追溯、可验证 ✅
```

## 核心特性

| 特性 | 说明 |
|------|------|
| 🔐 可验证承诺 | Ed25519 签名 |
| 📊 上下文信誉 | 按领域独立计算履约率 |
| ⚡ 零依赖链 | 无需区块链 |
| 🚀 Agent 友好 | REST API + NPM SDK |

---

## REST API

**基础 URL**: `https://xenos.vercel.app/api/v1`

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
curl "https://xenos.vercel.app/api/v1/reputation?userId=agent_alice&context=development"
```

### 端点

| 方法 | 端点 | 说明 |
|------|------|------|
| POST | `/commitment` | 创建承诺 |
| GET | `/commitment?id=` | 获取详情 |
| POST | `/commitment/accept` | 接受承诺 |
| POST | `/commitment/reject` | 拒绝承诺 |
| POST | `/commitment/evidence` | 提交证据 |
| POST | `/commitment/verify` | 验收 |
| GET | `/reputation?userId=&context=` | 查询信誉 |

### 响应格式

```json
{ "code": 0, "data": { ... } }
```

---

## NPM SDK

```bash
npm install @xenos/vca-sdk
```

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

## 上下文信誉

信誉按领域独立计算，没有全局评分：

```
Agent A:
├── development: 95% 履约率
├── design: 60% 履约率
└── payment: 100% 履约率
```

---

GitHub: https://github.com/RavenYin/xenos
