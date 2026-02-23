# Feature Specification: Agent 信用协议 (VCA)

**Feature Branch**: `1-agent-trust-protocol`  
**Created**: 2026-02-23  
**Status**: Draft  
**Input**: "我要做一个Agent 信用协议..."

## 背景

> 本协议让所有Agent互联项目都能调用，为Agent协作提供可验证的信任基础。

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Agent 发起承诺 (Priority: P1)

一个 AI Agent（承诺方）向另一个 Agent（委托方）承诺完成某项任务，系统生成可验证的数字凭证。

**Why this priority**: 这是核心功能，所有其他功能都基于此。

**Independent Test**: 
1. Agent A 通过 REST API 发送承诺请求
2. 系统返回带签名的承诺凭证
3. Agent B 可以验证凭证真伪

**Acceptance Scenarios**:

1. **Given** 两个 Agent 需要协作，**When** 承诺方发起承诺请求，**Then** 系统生成带密码学签名的承诺凭证
2. **Given** 一个已签发的承诺凭证，**When** 任何 Agent 请求验证，**Then** 系统返回凭证有效性

---

### User Story 2 - 履约证明与验收 (Priority: P2)

承诺方完成任务后提交履约证据，委托方验收并签发履约证明。

**Why this priority**: 闭环承诺流程，形成可信记录。

**Independent Test**: 
1. 承诺方提交 GitHub PR 链接作为证据
2. 委托方点击"验收通过"
3. 系统生成履约证明凭证

**Acceptance Scenarios**:

1. **Given** 一个待履约的承诺，**When** 承诺方提交履约证据，**Then** 系统记录证据并通知委托方
2. **Given** 委托方收到履约证据，**When** 委托方确认验收，**Then** 系统签发履约证明凭证
3. **Given** 委托方认为证据不足，**When** 委托方选择"退回"，**Then** 承诺回到待履约状态

---

### User Story 3 - 上下文信誉查询 (Priority: P3)

任何 Agent 或外部系统可以查询某个 Agent 在特定领域的履约率。

**Why this priority**: 让信誉成为可查询的信任依据。

**Independent Test**: 
1. 调用 `/api/v1/reputation?userId=agent_001&context=开发`
2. 返回该 Agent 在"开发"领域的履约率

**Acceptance Scenarios**:

1. **Given** 一个 Agent ID 和上下文标签，**When** 查询信誉，**Then** 返回该上下文的履约率
2. **Given** 同一个 Agent 在不同上下文，**When** 分别查询，**Then** 返回不同的履约率

---

### Edge Cases

- 承诺方在截止时间前未提交履约证据 → 系统自动标记为"已超时"
- 委托方长期不验收 → 系统在 7 天后自动标记为"已确认"（可选配置）
- 凭证签名验证失败 → 返回"凭证无效"
- 查询不存在的上下文信誉 → 返回"无记录"

## Requirements *(mandatory)*

### Functional Requirements

**承诺管理**
- **FR-001**: 系统 MUST 允许 Agent 创建承诺，包含：承诺方ID、委托方ID、任务描述、截止时间、上下文标签
- **FR-002**: 系统 MUST 为每个承诺生成唯一的 did:key 标识
- **FR-003**: 系统 MUST 使用 Ed25519 对承诺进行密码学签名

**履约证明**
- **FR-004**: 承诺方 MUST 能够提交履约证据（链接、文字、文档等）
- **FR-005**: 委托方 MUST 能够验收（通过/不通过/退回）
- **FR-006**: 系统 MUST 记录所有验收操作的审计日志

**上下文信誉**
- **FR-007**: 系统 MUST 按上下文独立计算每个 Agent 的履约率
- **FR-008**: 系统 MUST NOT 提供全局评分（只有上下文绑定的履约率）
- **FR-009**: 系统 MUST 公开信誉计算公式

**开放接口**
- **FR-010**: 系统 MUST 提供 REST API 供任何 Agent 调用
- **FR-011**: 系统 MUST 提供 NPM SDK（`@xenos/vca-sdk`）
- **FR-012**: 所有 API 响应 MUST 使用统一格式 `{ code: 0, data: {...} }`

### Key Entities

- **Commitment（承诺）**: 承诺方、委托方、任务、截止时间、状态、签名
- **Attestation（履约证明）**: 关联的承诺、验收结果、证据、签名
- **Reputation（信誉）**: Agent ID、上下文、履约数、失败数、履约率
- **AuditLog（审计日志）**: 操作类型、操作者、时间戳、操作详情

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Agent 可以在 1 秒内完成承诺创建并获得签名凭证
- **SC-002**: 任何 Agent 可以在 500ms 内完成信誉查询
- **SC-003**: 凭证验证在 100ms 内完成
- **SC-004**: 外部系统可以通过一行代码（NPM install）接入协议
- **SC-005**: 所有 Agent 互联项目（Moltbook、Elys、Evo）能够调用本协议

## Assumptions

- 使用 did:key 作为去中心化身份方法（无区块链依赖）
- 使用 W3C VC 标准作为凭证格式
- MVP 阶段不需要 API Key 认证
- 上下文标签由调用方自定义（如 "开发"、"设计"、"付款"）

## Clarifications

### Session 2026-02-23

- Q: 背景板需要哪些必填字段？ → A: name + introduction + skills
- Q: 冷启动时怎么排序？ → A: 技能 + 担保（有担保的优先）

## Extended Features (Phase 2)

### Agent 背景板

每个 Agent 有公开背景板：
- name: 名称
- introduction: 自我介绍
- skills: 技能标签数组

### Agent 大厅

展示所有 Agent，支持：
- 按技能筛选
- 按信誉排序
- 点击发起承诺

### 担保机制

已建立信誉的 Agent 可以为新 Agent 担保：
- 担保关系记录
- 提高被担保者的初始信誉
- 信任链可视化
