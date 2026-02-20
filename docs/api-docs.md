# Xenos VCA SDK API 文档

## 概述

Xenos VCA (Verifiable Commitment Attestation) SDK 提供可验证承诺证明服务。

### 核心概念

| 术语 | 英文 | 说明 |
|------|------|------|
| 承诺方 | Promiser | 承诺完成任务的人（接任务） |
| 委托方 | Delegator | 发布任务、等待完成的人（发任务） |
| 承诺 | Commitment | 一方对另一方的履约承诺 |
| 证明 | Attestation | 委托方对承诺履约的验收证明 |

### 承诺状态流转

```
PENDING_ACCEPT ──[承诺方接受]──► ACCEPTED ──[承诺方提交]──► PENDING
      │                              │
      └──[承诺方拒绝]──► REJECTED    │
                                     │
                    ┌────────────────┴────────────────┐
                    │                                 │
          [委托方验收通过]                    [委托方验收失败]
                    ▼                                 ▼
               FULFILLED                          FAILED
```

## API 端点

### 基础 URL

```
https://xenos.io/api/v1
```

### 认证

MVP 阶段暂不需要 API Key，生产环境需要：

```http
Authorization: Bearer YOUR_API_KEY
```

或

```http
X-API-Key: YOUR_API_KEY
```

---

## 承诺管理

### 1. 创建承诺

**POST** `/commitment`

委托方向承诺方发起承诺请求。

**请求体：**

```json
{
  "promiserId": "user_123",           // 必填：承诺方 ID
  "delegatorId": "user_456",          // 必填：委托方 ID
  "task": "完成登录页面开发",          // 必填：任务描述
  "deadline": "2026-02-25T18:00:00Z", // 可选：截止时间
  "context": "towow",                 // 可选：来源上下文
  "externalId": "task_789"            // 可选：外部系统 ID
}
```

**响应：**

```json
{
  "code": 0,
  "data": {
    "id": "cm_abc123",
    "promiserId": "user_123",
    "delegatorId": "user_456",
    "task": "完成登录页面开发",
    "status": "PENDING_ACCEPT",
    "deadline": "2026-02-25T18:00:00Z",
    "context": "towow",
    "createdAt": "2026-02-20T10:00:00Z"
  }
}
```

---

### 2. 获取承诺详情

**GET** `/commitment?id={commitmentId}`

**参数：**

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| id | string | 是 | 承诺 ID |

---

### 3. 承诺方接受承诺

**POST** `/commitment/accept`

**请求体：**

```json
{
  "commitmentId": "cm_abc123",
  "promiserId": "user_123"
}
```

**响应状态：** 状态变更为 `ACCEPTED`

---

### 4. 承诺方拒绝承诺

**POST** `/commitment/reject`

**请求体：**

```json
{
  "commitmentId": "cm_abc123",
  "promiserId": "user_123",
  "reason": "时间冲突"  // 可选
}
```

**响应状态：** 状态变更为 `REJECTED`

---

### 5. 承诺方提交履约

**POST** `/commitment/submit`

承诺方完成任务后提交，等待委托方验收。

**请求体：**

```json
{
  "commitmentId": "cm_abc123",
  "promiserId": "user_123",
  "evidence": "https://github.com/xxx/pr/1"  // 可选：证据链接
}
```

**响应状态：** 状态变更为 `PENDING`（待验收）

---

### 6. 委托方验收承诺

**POST** `/commitment/verify`

**请求体：**

```json
{
  "commitmentId": "cm_abc123",
  "verifierId": "user_456",  // 委托方 ID
  "fulfilled": true,         // true=通过, false=不通过
  "evidence": "...",         // 可选
  "comment": "完成得很好"     // 可选
}
```

**响应状态：** 
- `fulfilled: true` → `FULFILLED`
- `fulfilled: false` → `FAILED`

---

## 查询接口

### 7. 查询我的承诺

**GET** `/promises?promiserId={userId}&status={status}`

承诺方视角，查询我承诺的任务。

**参数：**

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| promiserId | string | 是 | 承诺方 ID |
| status | string | 否 | 状态筛选 |
| limit | number | 否 | 每页数量，默认 20 |
| offset | number | 否 | 偏移量，默认 0 |

---

### 8. 查询我的委托

**GET** `/delegations?delegatorId={userId}&status={status}`

委托方视角，查询我委托给他人的任务。

---

## 信誉系统

### 9. 查询用户信誉

**GET** `/reputation?userId={userId}`

**响应：**

```json
{
  "code": 0,
  "data": {
    "userId": "user_123",
    "score": 750,
    "level": "大师",
    "totalCommitments": 50,
    "fulfilledCount": 45,
    "failedCount": 3,
    "pendingCount": 2,
    "fulfillmentRate": 0.94
  }
}
```

**信誉等级：**

| 分数范围 | 等级 |
|----------|------|
| 900-1000 | 传奇 |
| 750-899 | 大师 |
| 600-749 | 专家 |
| 400-599 | 熟练 |
| 200-399 | 入门 |
| 0-199 | 新人 |

---

## 错误码

| code | 说明 |
|------|------|
| 0 | 成功 |
| 400 | 参数错误 |
| 401 | 认证失败 |
| 403 | 无权限 |
| 404 | 资源不存在 |
| 500 | 服务器错误 |

---

## 集成示例

### ToWow 集成

```typescript
// 1. 协商成功后，创建承诺
const commitment = await fetch('https://xenos.io/api/v1/commitment', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    promiserId: 'towow_user_123',  // 接单的人
    delegatorId: 'towow_user_456', // 发布任务的人
    task: '完成登录页面开发',
    deadline: '2026-02-25T18:00:00Z',
    context: 'towow',
    externalId: 'towow_task_789'
  })
})

// 2. 用户接受承诺（前端调用）
await fetch('https://xenos.io/api/v1/commitment/accept', {
  method: 'POST',
  body: JSON.stringify({
    commitmentId: commitment.id,
    promiserId: 'towow_user_123'
  })
})

// 3. 任务完成后，用户提交履约
await fetch('https://xenos.io/api/v1/commitment/submit', {
  method: 'POST',
  body: JSON.stringify({
    commitmentId: commitment.id,
    promiserId: 'towow_user_123',
    evidence: 'https://github.com/xxx/pr/1'
  })
})

// 4. 委托方验收
await fetch('https://xenos.io/api/v1/commitment/verify', {
  method: 'POST',
  body: JSON.stringify({
    commitmentId: commitment.id,
    verifierId: 'towow_user_456',
    fulfilled: true,
    comment: '完成得很好'
  })
})
```

### 查询用户信誉

```typescript
const reputation = await fetch(
  'https://xenos.io/api/v1/reputation?userId=towow_user_123'
)

if (reputation.score >= 600) {
  // 信誉良好的用户，可以信任
}
```
