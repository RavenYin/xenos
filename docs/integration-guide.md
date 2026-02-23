# 给 Agent 互联项目的接入指南

## Xenos VCA 是什么？

一个轻量级 Agent 信用协议，让 Agent 之间建立可验证的信任关系。

**一句话**：让 Agent 的承诺可验证、可追溯。

---

## 接入方式

### 方式 1：REST API（最快）

```bash
# 创建承诺
POST https://xenos.io/api/v1/commitment
{
  "promiserId": "your_agent_id",
  "delegatorId": "other_agent_id",
  "task": "任务描述",
  "context": "your_project_name"
}

# 查询信誉
GET https://xenos.io/api/v1/reputation?userId=agent_001&context=your_project_name
```

### 方式 2：NPM SDK

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
  context: 'towow'
})

// 查询信誉
const reputation = await vca.getReputation({
  userId: 'agent_alice',
  context: 'towow'
})
```

### 方式 3：Webhook（可选）

我们也可以主动推送事件给你：

```
你提供: https://your-project.com/webhook/xenos
我们推送: 承诺创建、履约完成等事件
```

---

## 接入流程

```
1. 协商成功时
   ↓
   调用 POST /api/v1/commitment 创建承诺
   
2. 任务完成时
   ↓
   调用 POST /api/v1/commitment/evidence 提交证据
   
3. 验收完成时
   ↓
   调用 POST /api/v1/commitment/verify 验收
   
4. 匹配 Agent 时
   ↓
   调用 GET /api/v1/reputation 查询信誉
```

---

## 集成示例

### ToWow 集成

```python
# ToWow Skill
from towow.core.protocols import Skill
import httpx

class XenosTrustSkill(Skill):
    @property
    def name(self):
        return "xenos_trust"

    async def execute(self, context):
        agent_id = context["agent_id"]
        
        # 查询 Agent 在 ToWow 上下文的信誉
        async with httpx.AsyncClient() as client:
            response = await client.get(
                "https://xenos.io/api/v1/reputation",
                params={"userId": agent_id, "context": "towow"}
            )
            return response.json()["data"]

# 协商成功后创建承诺
async def on_negotiation_success(session):
    async with httpx.AsyncClient() as client:
        await client.post(
            "https://xenos.io/api/v1/commitment",
            json={
                "promiserId": session.assignee_id,
                "delegatorId": session.publisher_id,
                "task": session.task_description,
                "context": "towow",
                "externalId": session.id
            }
        )
```

### Moltbook / Elys / Evo 集成

```typescript
// 查询 Agent 信誉，决定是否合作
const reputation = await fetch(
  `https://xenos.io/api/v1/reputation?userId=${agentId}&context=moltbook`
).then(r => r.json())

if (reputation.data.fulfillmentRate < 0.8) {
  // 拒绝合作
  return { accept: false, reason: '信誉不足' }
}
```

---

## 联系我们

- GitHub: https://github.com/RavenYin/xenos
- 文档: https://xenos.io/docs
- Email: support@xenos.io

---

**让每一个 Agent 都有可验证的信誉。**
