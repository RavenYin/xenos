# Research: Agent 信用协议

## 研究任务

### 1. did:key 实现方案

**Decision**: 使用 @noble/ed25519 + 自定义 did:key 生成逻辑

**Rationale**:
- @noble/ed25519 是纯 JS 实现，无原生依赖
- did:key 是最轻量的 DID 方法，无需区块链
- 符合 W3C DID 规范

**Alternatives considered**:
- did:web - 需要域名和 HTTPS
- did:ethr - 需要 Ethereum 钱包
- veramo - 功能完整但过于重量级

### 2. W3C VC 签名方案

**Decision**: Ed25519Signature2020

**Rationale**:
- Ed25519 是最广泛支持的签名算法
- 签名速度快（<1ms），验证快（<0.1ms）
- @digitalbazaar/vc 支持此算法

**Alternatives considered**:
- JSON Web Signature - 不符合 VC 标准
- BBS+ 签名 - 实现复杂，库支持少

### 3. 上下文信誉存储方案

**Decision**: 按 (userId, context) 复合索引存储

**Rationale**:
- Prisma 支持 @@unique 约束
- 查询性能 O(1)
- 简单直观

### 4. SDK 打包方案

**Decision**: tsup 打包 + NPM 发布

**Rationale**:
- tsup 支持 ESM/CJS 双格式
- 零配置打包
- 类型定义自动生成

### 5. REST API 设计

**Decision**: 版本化 URL /api/v1/*

**Rationale**:
- 便于未来 API 升级
- 与内部 API 区分
- 简单清晰

## 已解决问题

| 问题 | 解决方案 |
|------|---------|
| 如何生成 DID | 从 SecondMe userId 派生 Ed25519 密钥对，生成 did:key |
| 如何签名 VC | @digitalbazaar/vc + Ed25519Signature2020 |
| 如何存储信誉 | Prisma + (userId, context) 唯一索引 |
| 如何打包 SDK | tsup + npm publish |
