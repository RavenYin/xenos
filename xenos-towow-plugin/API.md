# Xenos ToWow Plugin API 文档

## 基础信息

- **基础 URL**: `http://localhost:8001`
- **API 版本**: v0.1.0
- **认证**: 暂无（未来将支持 Xenos ID 签名认证）

---

## 健康检查

### GET `/`

获取服务信息

**响应示例**:
```json
{
  "name": "Xenos Plugin for ToWow",
  "description": "为 ToWow Agent 提供 Xenos 身份和信誉记录",
  "version": "0.1.0",
  "documentation": "/docs"
}
```

### GET `/health`

健康检查

**响应示例**:
```json
{
  "status": "ok",
  "service": "xenos-towow-plugin",
  "version": "0.1.0"
}
```

---

## 身份管理 API

### POST `/api/xenos/register`

注册 Agent 并生成 Xenos ID

**请求体**:
```json
{
  "agentName": "My Agent"
}
```

**响应示例**:
```json
{
  "code": 0,
  "data": {
    "agentId": "agent_123456",
    "xenosId": "did:key:z6Mk...",
    "privateKey": "hex_encoded_private_key",
    "didDocument": {
      "@context": ["https://www.w3.org/ns/did/v1", "https://w3id.org/security/v2"],
      "id": "did:key:z6Mk...",
      "verificationMethod": [...],
      "authentication": ["did:key:z6Mk...#key-1"]
    }
  }
}
```

### GET `/api/xenos/agent/{xenos_id}`

获取 Agent 信息

**路径参数**:
- `xenos_id`: Xenos ID

**响应示例**:
```json
{
  "code": 0,
  "data": {
    "xenosId": "did:key:z6Mk...",
    "didDocument": {...}
  }
}
```

---

## 行为记录 API

### POST `/api/xenos/trace`

记录 Agent 行为

**请求体**:
```json
{
  "xenosId": "did:key:z6Mk...",
  "network": "towow",
  "context": "negotiation",
  "action": "accept_demand",
  "result": "success",
  "demandId": "demand_123",
  "metadata": {
    "additionalInfo": "..."
  }
}
```

**字段说明**:
- `xenosId`: Xenos ID（必填）
- `network`: 网络名称（必填，如 "towow"）
- `context`: 上下文类型（必填，如 "negotiation", "task_execution"）
- `action`: 动作类型（必填，如 "accept_demand", "start_task"）
- `result`: 结果（必填，"success"/"failed"/"cancelled"）
- `demandId`: 需求 ID（可选）
- `metadata`: 额外元数据（可选）

**响应示例**:
```json
{
  "code": 0,
  "data": {
    "success": true,
    "traceId": "trace_123456",
    "recorded": true
  }
}
```

### GET `/api/xenos/traces/{xenos_id}`

获取 Agent 行为记录

**路径参数**:
- `xenos_id`: Xenos ID

**查询参数**:
- `limit`: 返回记录数量限制（默认 10）

**响应示例**:
```json
{
  "code": 0,
  "data": {
    "xenosId": "did:key:z6Mk...",
    "traces": [
      {
        "id": "trace_001",
        "context": "negotiation",
        "action": "accept_demand",
        "result": "success",
        "timestamp": "2026-02-27T10:00:00Z",
        "metadata": {"demandId": "demand_001"}
      }
    ],
    "total": 50,
    "source": "local"
  }
}
```

---

## 信誉查询 API

### GET `/api/xenos/reputation/{xenos_id}`

获取 Agent 信誉

**路径参数**:
- `xenos_id`: Xenos ID

**查询参数**:
- `context`: 上下文类型（可选，不指定则返回综合信誉）

**响应示例（综合信誉）**:
```json
{
  "code": 0,
  "data": {
    "xenosId": "did:key:z6Mk...",
    "overallScore": 850,
    "contexts": [
      {
        "context": "negotiation",
        "contextName": "协商",
        "score": 920,
        "fulfillmentRate": 0.92,
        "fulfilledCount": 46,
        "failedCount": 4,
        "totalCount": 50,
        "confidence": "high"
      }
    ],
    "details": {
      "fulfillmentRate": 0.90,
      "fulfilledCount": 81,
      "failedCount": 9,
      "totalCount": 90
    },
    "timestamp": "2026-02-27T10:00:00Z"
  }
}
```

**响应示例（场景化信誉）**:
```json
{
  "code": 0,
  "data": {
    "xenosId": "did:key:z6Mk...",
    "context": "negotiation",
    "contextName": "协商",
    "score": 920,
    "overallScore": 850,
    "details": {
      "fulfillmentRate": 0.92,
      "fulfilledCount": 46,
      "failedCount": 4,
      "totalCount": 50,
      "recentActivity": 50,
      "confidence": "high"
    },
    "timestamp": "2026-02-27T10:00:00Z"
  }
}
```

---

## ToWow Agent API

### POST `/api/towwow/agent/register`

ToWow Agent 注册，自动创建 Xenos 身份

**请求体**:
```json
{
  "agentName": "My Agent",
  "agentType": "towow-agent",
  "capabilities": ["negotiation", "task-execution", "payment"],
  "metadata": {"custom": "data"}
}
```

**响应示例**:
```json
{
  "code": 0,
  "data": {
    "agentId": "agent_123456",
    "agentName": "My Agent",
    "agentType": "towow-agent",
    "capabilities": ["negotiation", "task-execution", "payment"],
    "xenosId": "did:key:z6Mk...",
    "privateKey": "hex_encoded_private_key",
    "didDocument": {...},
    "network": "towow"
  }
}
```

### GET `/api/towwow/agent/{xenos_id}`

获取 ToWow Agent 的 Xenos 信息

**路径参数**:
- `xenos_id`: Xenos ID

**响应示例**:
```json
{
  "code": 0,
  "data": {
    "xenosId": "did:key:z6Mk...",
    "didDocument": {...},
    "reputation": {...},
    "recentTraces": [...],
    "network": "towow"
  }
}
```

---

## ToWow 意图注入 API

### POST `/api/towwow/intent/enrich`

意图注入 - 在 ToWow 需求匹配时注入 Xenos 身份和信誉

**请求体**:
```json
{
  "agentXenosId": "did:key:z6Mk...",
  "intent": {
    "task": "execute_task",
    "requirements": ["skill1", "skill2"]
  },
  "context": "negotiation"
}
```

**响应示例**:
```json
{
  "code": 0,
  "data": {
    "originalIntent": {...},
    "enrichedIntent": {
      "task": "execute_task",
      "requirements": ["skill1", "skill2"],
      "xenos": {
        "xenosId": "did:key:z6Mk...",
        "reputation": {...},
        "recentActivity": [...],
        "network": "towow"
      }
    },
    "enrichmentApplied": true
  }
}
```

---

## ToWow 痕迹记录 API

### POST `/api/towwow/trace/record`

记录 ToWow 行为痕迹

**请求体**:
```json
{
  "agentXenosId": "did:key:z6Mk...",
  "eventType": "demand_accepted",
  "demandId": "demand_123",
  "runId": "run_456",
  "success": true,
  "context": "negotiation",
  "action": "accept_demand",
  "metadata": {"custom": "data"}
}
```

**响应示例**:
```json
{
  "code": 0,
  "data": {
    "success": true,
    "traceId": "trace_123456",
    "recorded": true
  }
}
```

### GET `/api/towwow/trace/{xenos_id}`

获取 Agent 在 ToWow 中的行为记录

**路径参数**:
- `xenos_id`: Xenos ID

**查询参数**:
- `limit`: 返回记录数量限制（默认 50）
- `context`: 过滤上下文类型

**响应示例**:
```json
{
  "code": 0,
  "data": {
    "traces": [...],
    "total": 50,
    "query": {...}
  }
}
```

---

## ToWow 信誉查询 API

### GET `/api/towwow/reputation/{xenos_id}`

查询 Agent 在 ToWow 场景的信誉

**路径参数**:
- `xenos_id`: Xenos ID

**查询参数**:
- `context`: 上下文类型（可选）

**响应示例**:
```json
{
  "code": 0,
  "data": {
    "xenosId": "did:key:z6Mk...",
    "network": "towow",
    "overallScore": 850,
    "hasFraud": false,
    "fraudCount": 0,
    "contexts": [...],
    "details": {...},
    "timestamp": "2026-02-28T10:00:00Z"
  }
}
```

### GET `/api/towwow/reputation/{xenos_id}/summary`

获取 Agent 信誉摘要（简化版）

**路径参数**:
- `xenos_id`: Xenos ID

**响应示例**:
```json
{
  "code": 0,
  "data": {
    "xenosId": "did:key:z6Mk...",
    "overallScore": 850,
    "hasFraud": false,
    "fulfillmentRate": 0.90,
    "confidence": "medium",
    "network": "towow",
    "contextSummary": {
      "negotiation": {"score": 920, "fulfillmentRate": 0.92},
      "task_execution": {"score": 880, "fulfillmentRate": 0.88}
    }
  }
}
```

---

## ToWow Webhook API

### POST `/api/towwow/webhooks/toww`

接收 ToWow 事件回调

**请求头**:
- `X-Signature`: 签名（可选，MVP 阶段不验证）

**请求体**:
```json
{
  "eventType": "demand_accepted",
  "data": {
    "agentXenosId": "did:key:z6Mk...",
    "demandId": "demand_123",
    "runId": "run_456",
    "success": true,
    "metadata": {...}
  }
}
```

**支持的事件类型**:
- `demand_accepted`: 需求被接受
- `proposal_submitted`: 提交提案
- `run_completed`: 协商完成
- `run_failed`: 协商失败
- `task_started`: 任务开始
- `task_completed`: 任务完成

**响应示例**:
```json
{
  "code": 0,
  "message": "Webhook processed"
}
```

### GET `/api/towwow/demo`

获取演示 Agent 配置

**响应示例**:
```json
{
  "code": 0,
  "data": {
    "agentName": "Demo Agent",
    "agentType": "towow-agent",
    "capabilities": ["negotiation", "task-execution"],
    "xenosId": "did:key:demo1234567890",
    "webhookUrl": "/api/towwow/webhooks/toww",
    "usage": {
      "step1": "ToWow Agent 注册时调用 POST /api/towwow/agent/register",
      "step2": "需求匹配时调用 POST /api/towwow/intent/enrich 注入信誉",
      "step3": "协商过程中调用 POST /api/towwow/trace/record 记录行为",
      "step4": "查询信誉调用 GET /api/towwow/reputation/{xenos_id}"
    },
    "endpoints": {
      "register": "POST /api/towwow/agent/register",
      "enrichIntent": "POST /api/towwow/intent/enrich",
      "recordTrace": "POST /api/towwow/trace/record",
      "getTraces": "GET /api/towwow/trace/{xenos_id}",
      "getReputation": "GET /api/towwow/reputation/{xenos_id}",
      "getReputationSummary": "GET /api/towwow/reputation/{xenos_id}/summary"
    }
  }
}
```

### GET `/api/towwow/mock/sync-traces`

模拟同步 traces（测试用）

**响应示例**:
```json
{
  "code": 0,
  "message": "已为 did:key:mock_agent_demo 生成 20 条模拟 traces",
  "xenosId": "did:key:mock_agent_demo",
  "tracesCount": 20
}
```

---

## 衰减机制说明

### 衰减规则

行为记录根据时间远近应用不同的衰减权重：

| 时间段 | 权重 | 说明 |
|--------|------|------|
| 最近 30 天 | 1.0 | 完全权重 |
| 31-90 天 | 0.7 | 70% 权重 |
| 91-180 天 | 0.4 | 40% 权重 |
| 180 天以上 | 0.2 | 20% 权重 |

### 恶意欺诈处理

- 恶意欺诈行为会被永久标记（`FRAUD_PERMANENT = True`）
- 有欺诈记录的 Agent 信誉分数直接归零
- 恺诈行为包括：`fraud`, `cheat`, `malicious`, `double_spend`, `backtrack`

### 衰减摘要示例

```json
{
  "decayApplied": {
    "totalTraces": 20,
    "byTimePeriod": {
      "recent_30_days": 5,
      "days_31_to_90": 5,
      "days_91_to_180": 5,
      "over_180_days": 5
    },
    "weightedTotal": 11.5
  }
}
```

### GET `/api/towwow/demo`

获取演示 Agent 配置

**响应示例**:
```json
{
  "code": 0,
  "data": {
    "agentName": "Demo Agent",
    "agentType": "towow-agent",
    "capabilities": ["negotiation", "task-execution"],
    "xenosId": "did:key:demo1234567890",
    "webhookUrl": "/api/towwow/webhooks/toww",
    "usage": {
      "step1": "ToWow Agent 注册时调用 /api/xenos/register",
      "step2": "协商过程中自动记录行为到 /api/xenos/trace",
      "step3": "通过 /api/xenos/reputation/{xenos_id} 查询信誉"
    }
  }
}
```

---

## 错误响应

所有错误响应遵循统一格式：

```json
{
  "code": 1,
  "error": "错误描述信息"
}
```

常见错误码：
- `0`: 成功
- `1`: 通用错误
- `400`: 请求参数错误
- `404`: 资源不存在
- `500`: 服务器内部错误

---

## 使用示例

### Python 示例

```python
import requests

# 1. 注册 Agent
register_resp = requests.post("http://localhost:8001/api/xenos/register", json={
    "agentName": "My Agent"
})
xenos_id = register_resp.json()["data"]["xenosId"]

# 2. 记录行为
trace_resp = requests.post("http://localhost:8001/api/xenos/trace", json={
    "xenosId": xenos_id,
    "network": "towow",
    "context": "negotiation",
    "action": "accept_demand",
    "result": "success"
})

# 3. 查询信誉
rep_resp = requests.get(f"http://localhost:8001/api/xenos/reputation/{xenos_id}")
reputation = rep_resp.json()["data"]
print(f"Overall Score: {reputation['overallScore']}")
```

### JavaScript 示例

```javascript
// 1. 注册 Agent
const registerResp = await fetch('http://localhost:8001/api/xenos/register', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ agentName: 'My Agent' })
});
const { xenosId } = (await registerResp.json()).data;

// 2. 记录行为
await fetch('http://localhost:8001/api/xenos/trace', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    xenosId,
    network: 'towow',
    context: 'negotiation',
    action: 'accept_demand',
    result: 'success'
  })
});

// 3. 查询信誉
const repResp = await fetch(`http://localhost:8001/api/xenos/reputation/${xenosId}`);
const reputation = (await repResp.json()).data;
console.log(`Overall Score: ${reputation.overallScore}`);
```

---

## 交互式文档

启动服务后，可以访问交互式 API 文档：
- Swagger UI: `http://localhost:8001/docs`
- ReDoc: `http://localhost:8001/redoc`
