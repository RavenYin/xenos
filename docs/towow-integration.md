# ToWow 集成设计文档

## 概述

ToWow 是 SecondMe 生态中的零工匹配平台，AI Agent 之间进行任务协商和交易撮合。

## 集成架构

```
┌─────────────────────────────────────────────────────────────┐
│                      ToWow 平台                              │
│   [任务发布] → [AI协商] → [匹配成交] → [任务执行] → [验收]    │
└─────────────────────────────────────────────────────────────┘
        │                    │                    │
        │ Webhook            │ API 调用           │ Webhook
        ▼                    ▼                    ▼
┌─────────────────────────────────────────────────────────────┐
│                      Xenos VCA 系统                          │
│                                                              │
│  /api/towow/webhook     - 接收 ToWow 事件                    │
│  /api/towow/tasks       - 同步任务列表                       │
│                                                              │
│  承诺生命周期：                                               │
│  [接单] → 自动创建 PENDING 承诺                              │
│  [提交] → 等待验收                                          │
│  [验收通过] → 自动添加履约证明 → FULFILLED                   │
│  [验收失败] → 自动添加履约证明 → FAILED                      │
└─────────────────────────────────────────────────────────────┘
```

## 数据模型扩展

```prisma
model Commitment {
  // ... 现有字段 ...
  
  // ToWow 集成字段
  towowTaskId      String?   @map("towow_task_id")    // ToWow 任务 ID
  towowOrderId     String?   @map("towow_order_id")   // 订单 ID
  source           String    @default("manual")       // 来源: manual / towow
  rewardAmount     Decimal?  @map("reward_amount")    // 报酬金额
  rewardCurrency   String?   @map("reward_currency")  // 货币类型
  
  @@index([towowTaskId])
}
```

## Webhook 事件

### 1. 任务接单 (task.accepted)
```json
{
  "event": "task.accepted",
  "timestamp": "2026-02-20T08:00:00Z",
  "data": {
    "taskId": "towow_task_123",
    "orderId": "order_456",
    "task": {
      "title": "开发登录页面",
      "description": "...",
      "deadline": "2026-02-25T18:00:00Z",
      "reward": {
        "amount": 500,
        "currency": "CNY"
      }
    },
    "assignee": {
      "userId": "user_789",
      "secondmeId": "secondme_xxx"
    },
    "publisher": {
      "userId": "user_111",
      "secondmeId": "secondme_yyy"
    }
  }
}
```

**处理逻辑：**
1. 查找或创建接单用户的 Xenos 账户
2. 查找任务发布者的 Xenos 账户
3. 自动创建承诺：
   - promiserId = 接单用户
   - receiverId = 任务发布者
   - towowTaskId = taskId
   - task = 任务描述
   - deadline = 任务截止时间
   - status = PENDING

### 2. 任务验收 (task.verified)
```json
{
  "event": "task.verified",
  "timestamp": "2026-02-20T10:00:00Z",
  "data": {
    "taskId": "towow_task_123",
    "orderId": "order_456",
    "result": "approved",  // 或 "rejected"
    "verifier": {
      "userId": "user_111"
    },
    "comment": "完成得很好"
  }
}
```

**处理逻辑：**
1. 根据 towowTaskId 查找对应承诺
2. 创建履约证明：
   - attesterId = 任务发布者
   - fulfilled = (result === "approved")
   - comment = 验收备注
3. 更新承诺状态：
   - approved → FULFILLED
   - rejected → FAILED

## API 端点

### POST /api/towow/webhook
接收 ToWow 平台的 Webhook 事件

### GET /api/towow/tasks
同步当前用户的 ToWow 任务列表

### POST /api/towow/sync
手动同步任务状态

## 前端展示

### 承诺列表增强
- 显示任务来源标签（手动创建 / ToWow任务）
- 显示关联的 ToWow 任务详情
- 报酬金额展示

### Dashboard 新增
- ToWow 任务概览卡片
- 收入统计
- 进行中的任务数量
