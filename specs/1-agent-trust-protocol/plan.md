# Implementation Plan: Agent 信用协议 (VCA)

**Branch**: `1-agent-trust-protocol` | **Date**: 2026-02-23 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/1-agent-trust-protocol/spec.md`

## Summary

为 Agent 互联项目提供可验证的信任基础：将口头承诺转化为带密码学签名的数字凭证，按上下文独立计算履约率，提供 REST API 和 NPM SDK 供任何 Agent 调用。

## Technical Context

**Language/Version**: TypeScript 5.x / Node.js 18+
**Primary Dependencies**: Next.js 14, Prisma, @noble/ed25519, @digitalbazaar/vc
**Storage**: SQLite (开发) / PostgreSQL (生产)
**Testing**: Playwright (E2E), Jest (单元)
**Target Platform**: Web Service (REST API)
**Project Type**: web-service + npm-library
**Performance Goals**: <500ms API 响应, <100ms 签名验证
**Constraints**: 无区块链依赖, 零 Gas 费
**Scale/Scope**: 支持 10k+ Agent, 100k+ 承诺记录

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| 原则 | 状态 | 说明 |
|------|------|------|
| 信任不应预设，而应可证 | ✅ 通过 | 所有承诺带密码学签名，可验证 |
| 声誉是上下文绑定的履约记录 | ✅ 通过 | 按上下文独立计算履约率，无全局评分 |
| 每个承诺是可验证的数字契约 | ✅ 通过 | 承诺生命周期完整记录 |
| 轻量原则 | ✅ 通过 | HTTP + JSON，无区块链依赖 |
| 开放原则 | ✅ 通过 | REST API + NPM SDK |

## Project Structure

### Documentation (this feature)

```text
specs/1-agent-trust-protocol/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # API contracts
│   └── rest-api.yaml
└── tasks.md             # Phase 2 output
```

### Source Code (repository root)

```text
src/
├── app/
│   ├── api/
│   │   ├── v1/                    # 公开 REST API
│   │   │   ├── commitment/         # 承诺 CRUD
│   │   │   ├── reputation/         # 信誉查询
│   │   │   └── evidence/           # 证据提交
│   │   ├── commitment/             # 内部 API
│   │   ├── attestations/           # 验收 API
│   │   └── towow/                  # ToWow 集成
│   ├── dashboard/                  # 前端页面
│   └── towow/                      # ToWow 任务市场
├── components/
│   ├── CommitmentList.tsx          # 承诺列表
│   ├── EvidenceForm.tsx            # 证据表单
│   └── ReputationDisplay.tsx       # 信誉展示
├── lib/
│   ├── vca-sdk.ts                  # SDK 核心
│   ├── did.ts                      # DID 生成
│   ├── vc.ts                       # VC 签发/验证
│   └── towow.ts                    # ToWow 客户端
└── prisma/
    └── schema.prisma               # 数据模型

tests/
├── api.spec.ts                     # API 测试
└── e2e.spec.ts                     # E2E 测试
```

**Structure Decision**: Web Service 架构，Next.js App Router，前后端同仓库。

## Complexity Tracking

无 Constitution 违规，无需复杂度说明。
