# Tasks: Agent 信用协议 (VCA)

**Feature**: Agent 信用协议 (VCA)  
**Branch**: `1-agent-trust-protocol`  
**Created**: 2026-02-23  
**Updated**: 2026-02-24

---

## Overview

本任务列表按用户故事组织，每个故事可独立实现和测试。

**实现策略**: MVP 优先，增量交付
- MVP = Phase 1-5 (已完成! ✅)
- Phase 6-8 = 扩展功能

---

## Phase 1: Setup (项目初始化) ✅ 完成

**Goal**: 建立项目基础设施

### Tasks

- [x] T001 初始化 Next.js 14 项目结构 in `src/app/`
- [x] T002 配置 TypeScript 严格模式 in `tsconfig.json`
- [x] T003 [P] 配置 Prisma 连接 SQLite in `prisma/schema.prisma`
- [x] T004 [P] 配置 Tailwind CSS in `tailwind.config.js`
- [x] T005 创建环境变量模板 in `.env.example`
- [x] T006 安装核心依赖: @noble/ed25519, @digitalbazaar/vc in `package.json`
- [x] T007 配置 Vercel 部署 in `vercel.json`

---

## Phase 2: Foundational (基础设施) ✅ 完成

**Goal**: 完成所有 User Story 依赖的共享组件

### Data Models

- [x] T008 [P] 创建 User 模型 in `prisma/schema.prisma`
- [x] T009 [P] 创建 Commitment 模型 in `prisma/schema.prisma`
- [x] T010 [P] 创建 Attestation 模型 in `prisma/schema.prisma`
- [x] T011 [P] 创建 Reputation 模型 in `prisma/schema.prisma` (通过查询实现)
- [x] T012 [P] 创建 UserKey 模型 in `prisma/schema.prisma` (集成在 User)
- [x] T013 [P] 创建 AuditLog 模型 in `prisma/schema.prisma`
- [x] T014 运行 Prisma 迁移 in `prisma/migrations/`

### Core Services

- [x] T015 [P] 创建 Prisma 客户端封装 in `src/lib/prisma.ts`
- [x] T016 [P] 实现 DID 生成模块 in `src/lib/did.ts`
- [x] T017 [P] 实现 VC 签发模块 in `src/lib/vc.ts`
- [x] T018 [P] 实现 VCA SDK 核心 in `src/lib/vca-sdk.ts`

### Authentication

- [x] T019 配置 NextAuth.js in `src/lib/auth.ts`
- [x] T020 [P] 创建登录页面 in `src/app/auth/login/page.tsx`
- [x] T021 [P] 创建认证回调 in `src/app/api/auth/callback/route.ts`

---

## Phase 3: User Story 1 - Agent 发起承诺 (P1) ✅ 完成

**Goal**: Agent 可以创建承诺并获得可验证凭证

**Independent Test**:
1. POST /api/v1/commitment 返回带 ID 的承诺
2. 承诺有正确的状态和时间戳

### API Layer

- [x] T022 [US1] 创建承诺 API in `src/app/api/v1/commitment/route.ts`
- [x] T023 [US1] 获取承诺详情 API in `src/app/api/v1/commitment/route.ts` (GET)
- [x] T024 [US1] 接受承诺 API in `src/app/api/v1/commitment/accept/route.ts`
- [x] T025 [US1] 拒绝承诺 API in `src/app/api/v1/commitment/reject/route.ts`

### Service Layer

- [x] T026 [US1] 实现承诺创建服务 in `src/app/api/v1/commitment/route.ts`
- [x] T027 [US1] 实现承诺状态转换 in `src/app/api/v1/commitment/*/route.ts`
- [x] T028 [US1] 实现承诺查询服务 in `src/app/api/v1/commitment/route.ts`

### UI Layer

- [x] T029 [US1] 创建承诺表单组件 in `src/components/CommitmentForm.tsx`
- [x] T030 [US1] 创建承诺列表组件 in `src/components/CommitmentList.tsx`
- [x] T031 [US1] 创建 Dashboard 页面 in `src/app/dashboard/page.tsx`

---

## Phase 4: User Story 2 - 履约证明与验收 (P2) ✅ 完成

**Goal**: 承诺方提交证据，委托方验收

**Independent Test**:
1. 提交证据后承诺状态变为 PENDING
2. 验收通过后状态变为 FULFILLED
3. 退回后状态变为 ACCEPTED

### API Layer

- [x] T032 [US2] 提交履约证据 API in `src/app/api/v1/commitment/evidence/route.ts`
- [x] T033 [US2] 验收承诺 API in `src/app/api/v1/commitment/verify/route.ts`
- [x] T034 [US2] 获取待验收列表 API in `src/app/api/v1/promises/route.ts`

### Service Layer

- [x] T035 [US2] 实现证据验证服务 in `src/app/api/v1/commitment/evidence/route.ts`
- [x] T036 [US2] 实现验收服务 in `src/app/api/v1/commitment/verify/route.ts`
- [x] T037 [US2] 实现三态验收逻辑 in `src/app/api/v1/commitment/verify/route.ts`

### UI Layer

- [x] T038 [US2] 创建证据提交表单 in `src/components/EvidenceForm.tsx`
- [x] T039 [US2] 创建验收操作组件 in `src/components/CommitmentList.tsx`
- [x] T040 [US2] 更新承诺详情页显示证据 in `src/components/CommitmentList.tsx`

---

## Phase 5: User Story 3 - 上下文信誉查询 (P3) ✅ 完成

**Goal**: 查询 Agent 在特定领域的履约率

**Independent Test**:
1. GET /api/v1/reputation 返回正确的履约率
2. 不同上下文返回不同的履约率

### API Layer

- [x] T041 [US3] 信誉查询 API in `src/app/api/v1/reputation/route.ts`
- [x] T042 [US3] 批量信誉查询 API (通过 getUserReputation 实现)
- [x] T043 [US3] 我的承诺查询 API in `src/app/api/v1/promises/route.ts`
- [x] T044 [US3] 我的委托查询 API in `src/app/api/v1/delegations/route.ts`

### Service Layer

- [x] T045 [US3] 实现信誉计算服务 in `src/lib/reputation.ts`
- [x] T046 [US3] 实现信誉更新触发器 in `src/lib/reputation.ts`
- [x] T047 [US3] 实现上下文聚合查询 in `src/lib/reputation.ts`

### UI Layer

- [x] T048 [US3] 创建信誉展示组件 in `src/components/ReputationDisplay.tsx`
- [x] T049 [US3] 创建信誉卡片组件 in `src/components/ReputationDisplay.tsx`
- [x] T050 [US3] 更新个人资料显示信誉 in `src/app/dashboard/page.tsx`

---

## Phase 6: Agent 大厅 (Phase 2 Feature) 🎯 进行中

**Goal**: Agent 可以发现其他 Agent

**Independent Test**:
1. GET /api/v1/agents 返回 Agent 列表
2. GET /api/v1/discover?context=xxx 返回符合过滤条件的 Agent

### Tasks

- [x] T051 创建 AgentProfile 模型 in `prisma/schema.prisma`
- [x] T052 Agent 列表 API in `src/app/api/v1/agents/route.ts`
- [x] T053 Agent 详情 API in `src/app/api/v1/agents/[id]/route.ts`
- [x] T054 Agent 发现 API in `src/app/api/v1/discover/route.ts`
- [x] T055 创建 Agent 大厅页面 in `src/app/agents/page.tsx`
- [x] T056 创建 Agent 卡片组件 in `src/components/AgentCard.tsx`

---

## Phase 7: 担保机制 (Phase 2 Feature)

**Goal**: 建立信任链

**Independent Test**:
1. POST /api/v1/vouch 创建担保关系
2. 担保关系在 Agent 详情页可见

### Tasks

- [x] T057 创建 Vouch 模型 in `prisma/schema.prisma`
- [x] T058 担保 API in `src/app/api/v1/vouch/route.ts`
- [x] T059 担保列表 API in `src/app/api/v1/vouch/list/route.ts`
- [x] T060 信任网络可视化 in `src/app/trust/page.tsx`

---

## Phase 8: Polish & Cross-Cutting

**Goal**: 完善和优化

### Tasks

- [x] T061 [P] 添加 API 响应缓存 in `src/lib/cache.ts`
- [x] T062 [P] 添加请求限流 in `src/lib/rate-limit.ts`
- [x] T063 [P] 添加错误处理中间件 in `src/lib/audit.ts`
- [x] T064 [P] 创建审计日志查询 API in `src/app/api/v1/audit/route.ts`
- [x] T065 添加 SDK 类型定义 in `src/lib/vca-sdk.ts`
- [x] T066 创建 README in `README.md`
- [x] T067 创建 API 文档 in `docs/api-docs.md`

---

## Summary

| Phase | Tasks | Status |
|-------|-------|--------|
| Phase 1: Setup | 7 | ✅ 100% |
| Phase 2: Foundational | 14 | ✅ 100% |
| Phase 3: US1 | 10 | ✅ 100% |
| Phase 4: US2 | 9 | ✅ 100% |
| Phase 5: US3 | 10 | ✅ 100% |
| Phase 6: Agent 大厅 | 6 | ✅ 100% |
| Phase 7: 担保 | 4 | ✅ 100% |
| Phase 8: Polish | 7 | ✅ 100% |

**Completed**: 50 tasks  
**Remaining**: 10 tasks  
**Completion**: 83%
