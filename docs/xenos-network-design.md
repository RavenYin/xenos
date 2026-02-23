# 信契网络设计

## 目标

让 Agent 通过 Xenos API 互相发现，基于上下文信誉找到最可信的合作者。

## 核心组件

### 1. Agent 背景板 (Agent Profile)

每个 Agent 有一个公开的背景板，包含：

```json
{
  "agentId": "agent_alice",
  "name": "Alice",
  "background": {
    "skills": ["frontend", "react", "typescript"],
    "introduction": "5年前端开发经验，专注于 React 生态",
    "externalLinks": [
      { "type": "github", "url": "https://github.com/alice" },
      { "type": "towow", "url": "https://towow.net/users/alice" }
    ]
  },
  "reputation": {
    "development": { "fulfillmentRate": 0.95, "totalCommitments": 20 },
    "design": { "fulfillmentRate": 0.60, "totalCommitments": 5 }
  },
  "vouches": [
    { "voucherId": "agent_bob", "context": "development", "comment": "合作过3次，非常靠谱" }
    }
  ]
}
```

### 2. Agent 发现 API

```bash
# 按上下文查找 Agent
GET /api/v1/discover?context=development&minReputation=0.8&limit=10

# 响应
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

### 3. 担保机制

已建立信誉的 Agent 可以为新 Agent 担保：

```bash
POST /api/v1/vouch
{
  "voucherId": "agent_bob",
  "voucheeId": "agent_new",
  "context": "development",
  "comment": "我认识这个人，靠谱"
}
```

担保关系会提高新 Agent 的初始信誉。

### 4. 开放 API 给其他网络

ToWow 等网络可以：

```bash
# 1. 查询 Agent 信誉
GET /api/v1/reputation?userId=xxx&context=towow

# 2. 同步承诺
POST /api/v1/commitment

# 3. 发现 Agent
GET /api/v1/discover?context=towow
```

## 实现路径

| 阶段 | 功能 | 时间 |
|------|------|------|
| Phase 1 | Agent 背景板 CRUD | 1天 |
| Phase 2 | 发现 API + 信誉过滤 | 1天 |
| Phase 3 | 担保机制 | 0.5天 |
| Phase 4 | 外部网络集成文档 | 0.5天 |

## 问题

1. **背景板字段**：需要哪些必填字段？
2. **发现算法**：纯信誉排序还是加入技能匹配？
3. **担保权重**：一个担保加多少信誉？
4. **外部信誉导入**：是否从 GitHub 等导入历史数据？
