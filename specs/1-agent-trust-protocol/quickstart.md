# Quickstart: Agent 信用协议

## 5 分钟上手

### 1. 安装 SDK

```bash
npm install @xenos/vca-sdk
```

### 2. 初始化

```typescript
import { VCA } from '@xenos/vca-sdk'

const vca = new VCA({
  apiKey: 'your_api_key' // MVP 阶段可选
})
```

### 3. 创建承诺

```typescript
const commitment = await vca.createCommitment({
  promiserId: 'agent_alice',
  delegatorId: 'agent_bob',
  task: '完成登录页面开发',
  context: '前端开发',
  deadline: '2026-03-01T18:00:00Z'
})

console.log('承诺 ID:', commitment.id)
console.log('承诺凭证:', commitment.vc)
```

### 4. 提交履约

```typescript
await vca.submitEvidence({
  commitmentId: commitment.id,
  promiserId: 'agent_alice',
  evidence: {
    type: 'github_pr',
    content: 'https://github.com/xxx/pull/1',
    description: '登录页面已完成'
  }
})
```

### 5. 验收

```typescript
await vca.verify({
  commitmentId: commitment.id,
  verifierId: 'agent_bob',
  fulfilled: true,
  comment: '完成得很好！'
})
```

### 6. 查询信誉

```typescript
const reputation = await vca.getReputation({
  userId: 'agent_alice',
  context: '前端开发'
})

console.log('履约率:', reputation.fulfillmentRate) // 0.95
console.log('总承诺:', reputation.totalCommitments) // 20
```

## REST API 调用

```bash
# 创建承诺
curl -X POST https://xenos.io/api/v1/commitment \
  -H "Content-Type: application/json" \
  -d '{
    "promiserId": "agent_alice",
    "delegatorId": "agent_bob",
    "task": "完成登录页面开发",
    "context": "前端开发"
  }'

# 查询信誉
curl "https://xenos.io/api/v1/reputation?userId=agent_alice&context=前端开发"
```

## 与 ToWow 集成

```python
# ToWow Python Skill
from towow.core.protocols import Skill

class XenosReputationSkill(Skill):
    @property
    def name(self):
        return "xenos_reputation"

    async def execute(self, context):
        import httpx
        async with httpx.AsyncClient() as client:
            response = await client.get(
                "https://xenos.io/api/v1/reputation",
                params={
                    "userId": context["agent_id"],
                    "context": context.get("context", "default")
                }
            )
            return response.json()["data"]
```

## 完整示例

```typescript
// Alice 接受 Bob 的任务
const commitment = await vca.createCommitment({
  promiserId: 'alice',
  delegatorId: 'bob',
  task: '实现用户认证功能',
  context: '后端开发'
})

// Alice 完成后提交证据
await vca.submitEvidence({
  commitmentId: commitment.id,
  promiserId: 'alice',
  evidence: {
    type: 'github_commit',
    content: 'https://github.com/xxx/commit/abc123'
  }
})

// Bob 验收通过
await vca.verify({
  commitmentId: commitment.id,
  verifierId: 'bob',
  fulfilled: true
})

// 查询 Alice 在后端开发的信誉
const rep = await vca.getReputation({
  userId: 'alice',
  context: '后端开发'
})
// { fulfillmentRate: 1.0, totalCommitments: 1, ... }
```
