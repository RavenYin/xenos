# Data Model: Landing Page

## Overview

The landing page is primarily a static showcase with minimal dynamic data. All content is hardcoded in the component except for the TrustNetworkPreview mock data.

---

## Entities

### 1. LandingPage (Component State)

**Description**: Main page component that composes all sections.

**Structure**:
```typescript
// No external data fetch - all content is static
export default function HomePage() {
  return (
    <div className="bg-gray-950">
      <Navbar />
      <main>
        <Hero />
        <CoreConcepts />
        <Workflow />
        <UseCases />
        <TrustNetworkPreview />
        <FeaturesList />  // replaces Stats
      </main>
      <Footer />
    </div>
  )
}
```

---

### 2. CoreConcept

**Description**: One of the three pillars of Xenos.

**Fields**:
```typescript
interface Concept {
  icon: string          // Emoji: '🔐', '📊', '⚡'
  title: string         // '可验证承诺', '上下文信誉', '零依赖链'
  description: string   // Detailed explanation (Chinese)
  gradient: string     // Tailwind gradient class: 'from-blue-400 to-cyan-500'
}
```

**Source**: Hardcoded array in `CoreConcepts` component.

**Static Values**:
```typescript
[
  {
    icon: '🔐',
    title: '可验证承诺',
    description: '基于 Ed25519 数字签名的承诺机制，确保每一步操作都可追溯、不可篡改。承诺创建、接受、验证全流程上链存证。',
    gradient: 'from-blue-400 to-cyan-500'
  },
  {
    icon: '📊',
    title: '上下文信誉',
    description: '信誉不是全局评分，而是按领域独立计算。Agent 在开发、设计、支付等不同领域拥有独立的履约率，实现精细化信任评估。',
    gradient: 'from-purple-400 to-pink-500'
  },
  {
    icon: '⚡',
    title: '零依赖链',
    description: '无需依赖任何区块链即可运行。纯 cryptographic 保证的信任协议，轻量、快速、零 Gas 费用，适合大规模 Agent 网络。',
    gradient: 'from-orange-400 to-red-500'
  }
]
```

---

### 3. WorkflowStep

**Description**: Step in the VCA lifecycle.

**Fields**:
```typescript
interface WorkflowStep {
  number: string       // '01', '02', '03', '04'
  title: string        // '创建承诺', '上下文分析', '信誉评分', '依赖解析'
  description: string  // Detailed explanation
}
```

**Source**: Hardcoded array in `Workflow` component.

---

### 4. UseCase

**Description**: Application scenario for Xenos.

**Fields**:
```typescript
interface UseCase {
  icon: string         // Emoji: '🌐', '🏛️', '📦'
  title: string        // 'ToWow Agent 匹配', '动态定价', '第三方验证'
  description: string  // Chinese description
  tags: string[]      // ['ToWow', 'Agent 匹配', '信誉查询']
}
```

**Source**: Hardcoded array in `UseCases` component (post-research values).

---

### 5. FeatureItem

**Description**: Replaces fake Stats with real features.

**Fields**:
```typescript
interface FeatureItem {
  icon: string         // Emoji
  text: string         // Feature description (e.g., 'Ed25519 数字签名')
}
```

**Source**: Hardcoded array in `FeaturesList` component:
```typescript
const features = [
  { icon: '🔐', text: 'Ed25519 数字签名' },
  { icon: '📝', text: 'W3C VC 标准凭证' },
  { icon: '⚡', text: '零 Gas 费，纯链下' },
  { icon: '🔗', text: 'SecondMe OAuth 集成' },
  { icon: '📊', text: '上下文信誉计算' },
  { icon: '🔍', text: '可审计日志' }
]
```

---

### 6. TrustNetworkData (Mock)

**Description**: Graph data for the canvas visualization.

**Structure**:
```typescript
interface Node {
  id: string           // Unique identifier
  label: string        // Display name (e.g., 'Alice')
  x: number           // Normalized 0-1 coordinate
  y: number           // Normalized 0-1 coordinate
  radius: number      // Pixel size
  type: 'core' | 'agent'
  reputation?: number // 0-1 fulfillment rate
}

interface Connection {
  from: string        // Node id
  to: string          // Node id
  strength: number    // 0-1 trust level
}

interface TrustNetworkData {
  nodes: Node[]
  connections: Connection[]
}
```

**Source**: `getMockNetwork()` function inside `TrustNetworkPreview` component.

**Current Mock**:
- 1 core node (Xenos) at center (0.5, 0.5)
- 6 agent nodes (Alice, Bob, Carol, Dave, Eve, Frank)
- 8 connections forming a small-world network
- Pulse animation from core to agents

---

## Data Flow

```
User visits /
  ↓
Server renders HomePage component (SSR)
  ↓
Client hydrates
  ↓
Framer Motion animations trigger on scroll
  ↓
TrustNetworkPreview canvas initializes and starts animation loop
```

**No external API calls** from landing page (pure static).

---

## Validation Rules

| Entity | Constraint |
|--------|------------|
| CoreConcept.title | Must match Constitution terms exactly: '可验证承诺', '上下文信誉', '零依赖链' |
| WorkflowStep.title | Must follow lifecycle: '创建承诺' → '上下文分析' → '信誉评分' → '依赖解析' |
| FeatureItem.text | Must reflect actual implemented features (no speculation) |
| TrustNetworkData | Mock only until `/api/trust/network` exists |

---

## Change History

| Date | Change |
|------|--------|
| 2025-02-25 | Initial data model based on spec v1.0 |
