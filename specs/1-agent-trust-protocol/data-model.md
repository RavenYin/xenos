# Data Model: Agent 信用协议

## 实体关系图

```
User ──┬──< Commitment (promiser)     ──< Attestation
        │
        └──< Commitment (receiver)    ──< Attestation
        
User ──< Reputation (by context)
User ──< UserKey (for signing)
User ──< AuditLog
```

## 核心实体

### User

| 字段 | 类型 | 说明 |
|------|------|------|
| id | String | 主键 (cuid) |
| secondmeUserId | String? | SecondMe 用户 ID |
| did | String? | did:key 标识 |
| name | String? | 显示名称 |
| email | String? | 邮箱 |
| avatarUrl | String? | 头像 |
| createdAt | DateTime | 创建时间 |

### Commitment (承诺)

| 字段 | 类型 | 说明 |
|------|------|------|
| id | String | 主键 |
| promiserId | String | 承诺方 ID (FK → User) |
| receiverId | String? | 委托方 ID (FK → User) |
| context | String | 上下文标签 |
| task | String | 任务描述 |
| status | Enum | 状态 (见下表) |
| deadline | DateTime? | 截止时间 |
| evidence | String? | 履约证据 (JSON) |
| vcId | String? | VC 唯一标识 |
| vcJwt | String? | VC JWT 形式 |
| signedAt | DateTime? | 签名时间 |
| createdAt | DateTime | 创建时间 |

**Status 枚举**:
- `PENDING_ACCEPT` - 待确认
- `ACCEPTED` - 已接受
- `REJECTED` - 已拒绝
- `PENDING` - 待验收
- `FULFILLED` - 已完成
- `FAILED` - 失败
- `CANCELLED` - 已取消

### Attestation (履约证明)

| 字段 | 类型 | 说明 |
|------|------|------|
| id | String | 主键 |
| commitmentId | String | 关联承诺 (FK) |
| attesterId | String | 验收者 ID (FK → User) |
| fulfilled | Boolean | 是否履约 |
| evidence | String? | 证据链接 |
| comment | String? | 备注 |
| vcId | String? | VC 唯一标识 |
| createdAt | DateTime | 创建时间 |

### Reputation (上下文信誉)

| 字段 | 类型 | 说明 |
|------|------|------|
| id | String | 主键 |
| userId | String | 用户 ID (FK) |
| context | String | 上下文标签 |
| fulfilledCount | Int | 完成数 |
| failedCount | Int | 失败数 |
| lastUpdated | DateTime | 最后更新 |

**约束**: `@@unique([userId, context])`

### UserKey (用户密钥)

| 字段 | 类型 | 说明 |
|------|------|------|
| id | String | 主键 |
| userId | String | 用户 ID (FK, unique) |
| publicKey | String | 公钥 (Base58) |
| privateKeyEnc | String | 私钥 (加密存储) |
| keyType | String | 密钥类型 (Ed25519) |

### AuditLog (审计日志)

| 字段 | 类型 | 说明 |
|------|------|------|
| id | String | 主键 |
| action | String | 操作类型 |
| actorId | String | 操作者 ID |
| targetType | String | 目标类型 |
| targetId | String | 目标 ID |
| payload | JSON | 操作详情 |
| createdAt | DateTime | 时间戳 |

## 索引

- Commitment: `@@index([promiserId, context])`
- Commitment: `@@index([status])`
- Attestation: `@@index([commitmentId])`
- Attestation: `@@index([attesterId])`
- AuditLog: `@@index([actorId])`
- AuditLog: `@@index([targetType, targetId])`
