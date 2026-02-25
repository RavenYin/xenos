# Research: Landing Page Design Decisions

## Summary

This document resolves all open questions from the landing page spec by aligning with Xenos' real information (from README, Constitution, and Obsidian notes).

---

## Decision 1: Use Cases Section Content

**Question**: Should we showcase ToWow integration or generic scenarios?

**Research Findings**:
- Constitution mentions "ToWow 匹配 Agent" as primary use case for reputation queries (Section 110-117)
- README MOC lists "ToWow集成方案" as completed (`✅ 已完成`)
- MVP plan states Phase 6 is "ToWow 生态集成"

**Decision**: **Showcase ToWow integration as the primary use case**.

**Rationale**: ToWow is the only concrete, implemented/planned integration. Highlighting it demonstrates real-world traction and provides clear context for visitors from the Agent ecosystem.

**Implementation**:
- UseCases section will have 3 cards:
  1. **ToWow Agent 匹配** (primary)
     - Description: "ToWow 查询候选 Agent 的领域信誉，按履约率排序推荐"
     - Tags: ["ToWow", "Agent 匹配", "信誉查询"]
  2. **动态定价** (based on Constitution Section 126-130)
     - Description: "高信誉 Agent 可获得更高报酬，低信誉需降价接单"
     - Tags: ["信誉经济", "激励机制"]
  3. **第三方验证** (generalized from VC verification concept)
     - Description: "任何第三方可验证承诺真实性，无需信任中心"
     - Tags: ["可验证性", "透明度"]

**Alternative Considered**: Only showing ToWow (rejected because it would leave section with only 1 card, which looks sparse).

---

## Decision 2: Stats Numbers - Use Feature List Instead

**Question**: If no real data, delete section or show "coming soon"?

**Research Findings**:
- Constitution constraint: "No Fake Data"
- Current project status: Phase 1 (DID) completed, Phase 2 (VCA) in progress
- No production deployment yet, so no user statistics
- README shows no metrics like GitHub stars, etc.

**Decision**: **Replace Stats section with "Feature Highlights" checklist**.

**Rationale**: 
- Avoids fake numbers entirely
- Still provides valuable information about what the system offers
- Can animate feature items appearing (maintains dynamic展示)
- Aligns with "no fake data" principle

**Implementation**:
```tsx
const features = [
  { icon: '🔐', text: 'Ed25519 数字签名' },
  { icon: '📝', text: 'W3C VC 标准凭证' },
  { icon: '⚡', text: '零 Gas 费，纯链下' },
  { icon: '🔗', text: 'SecondMe OAuth 集成' },
  { icon: '📊', text: '上下文信誉计算' },
  { icon: '🔍', text: '可审计日志' }
]
```
Animate with `staggerContainer` and `fadeInUp`.

---

## Decision 3: TrustNetworkPreview Data Source

**Question**: Where does the dynamic data come from - mock or real API?

**Research Findings**:
- Prisma schema has `Commitment`, `Attestation`, `User` models
- No API route found for trust network graph data (assumed not implemented yet)
- Phase 2 (VCA) is in progress → commitment data will be available
- Canvas demo in current code uses mock nodes/connections

**Decision**: **Use mock data for now, but structure it to easily switch to real API later**.

**Rationale**:
- Landing page must work without backend being ready
- Mock data should reflect realistic topology (from ToWow scenario)
- Code should be modular: `fetchNetworkData()` can be stubbed now, replaced with real `fetch('/api/trust/network')` later

**Implementation**:
- Create `getMockNetwork()` function returning:
  ```typescript
  {
    nodes: [
      { id: 'xenos', label: 'Xenos', x: 0.5, y: 0.5, type: 'core' },
      { id: 'alice', label: 'Alice', x: 0.2, y: 0.3, type: 'agent', reputation: 0.95 },
      { id: 'bob', label: 'Bob', x: 0.8, y: 0.3, type: 'agent', reputation: 0.87 },
      // ... more agents
    ],
    connections: [
      { from: 'xenos', to: 'alice', strength: 0.95 },
      { from: 'xenos', to: 'bob', strength: 0.87 },
      { from: 'alice', to: 'bob', strength: 0.72 }
    ]
  }
  ```
- Animation: pulse from Xenos node outward (core trust)
- Connection line thickness/opacity based on `strength`
- Node color based on `reputation` (green >0.8, yellow 0.5-0.8, red <0.5)

**Future Integration**: When `/api/trust/network` exists, replace `getMockNetwork()` with:
```typescript
const res = await fetch('/api/trust/network')
const data = await res.json()
```

---

## Decision 4: Mobile Navbar Behavior

**Question**: Add hamburger menu for mobile?

**Research Findings**:
- Current code: Navbar has `hidden md:flex` for nav links → on mobile, links are completely hidden
- This is **broken UX**: mobile users can't navigate!
- No mobile menu component exists
- There is no "hamburger" button in current code

**Decision**: **Implement hamburger menu for mobile navbar**.

**Rationale**:
- Mobile traffic is significant; hiding navigation is unacceptable
- Must follow responsive design best practices
- Consistent with modern web patterns

**Implementation**:
1. Add state: `const [mobileMenuOpen, setMobileMenuOpen] = useState(false)`
2. Add hamburger button (3 bars icon) visible only on mobile (`md:hidden`)
3. On click, toggle `mobileMenuOpen`
4. Render nav links in a dropdown panel when open
5. Close menu when clicking a link or outside

**Structure**:
```tsx
<nav>
  <div className="flex justify-between items-center h-20">
    <Logo />
    {/* Desktop Nav - hidden on mobile */}
    <div className="hidden md:flex items-center space-x-8">...</div>
    
    {/* Right side: CTA + Mobile menu button */}
    <div className="flex items-center space-x-4">
      <CTAButton />
      <button className="md:hidden" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
        ☰ (hamburger)
      </button>
    </div>
  </div>
  
  {/* Mobile Menu Dropdown */}
  {mobileMenuOpen && (
    <motion.div
      initial={{ height: 0, opacity: 0 }}
      animate={{ height: 'auto', opacity: 1 }}
      className="md:hidden bg-gray-900 border-b border-gray-800"
    >
      <div className="px-4 py-4 space-y-3">
        <Link href="#features" onClick={() => setMobileMenuOpen(false)}>核心特性</Link>
        <Link href="#workflow" ...>工作流</Link>
        <Link href="/trust" ...>信任网络</Link>
        <Link href="/agents" ...>Agent 大厅</Link>
      </div>
    </motion.div>
  )}
</nav>
```

---

## Decision 5: Language - All Chinese

**Question**: Use all Chinese or Chinese + English mix?

**Research Findings**:
- CLAUDE.md design principle: "中文界面: 所有用户可见文字使用中文"
- Target audience: Chinese users (domestic)
- Project documentation (README, Constit) uses Chinese
- Slogans are bilingual but UI text should be Chinese

**Decision**: **All user-facing text in Simplified Chinese**.

**Rationale**: Consistent with project design principles and target audience.

**Exceptions**:
- Code snippets, technical terms (API, REST, VC, Ed25519) remain English
- Slogan can be bilingual (English tagline under logo optional)
- Attribution/copyright "Built with ❤️ by the Xenos Team" (English okay)

**Implementation checklist**:
- ✅ Hero: "Agent 信用协议" (not "Agent Credit Protocol")
- ✅ Nav links: "核心特性", "工作流", "信任网络", "Agent 大厅"
- ✅ CTA: "立即体验", "查看信任网络"
- ✅ CoreConcepts: Chinese titles (as spec'd)
- ✅ Workflow: Chinese step descriptions
- ✅ UseCases: Chinese descriptions
- ✅ Footer: "信任网络 / Agent 大厅 / 登录 / 文档 / API 参考"

---

## Additional Recommendations

### Animation Philosophy Alignment

Based on Constitution's "Trust should be verifiable, not预设" concept:

1. **Hero floating elements**: 
   - Instead of abstract blobs, use "承诺书" and "验证" icons that move toward each other and connect
   - Animation tells story: commitment → verification

2. **Workflow connecting line**:
   - Add a moving dot along the line to show progress flow
   - Simulates "promise moving through lifecycle"

3. **TrustNetworkPreview**:
   - Pulse animation from Xenos node represents "trust emission"
   - Connection lines fade in when agents establish commitments
   - Node size = total commitments, color = fulfillment rate (Contextual Reputation!)

---

## Implementation Order (Recommended)

1. **Fix Mobile Navbar** (critical UX issue)
2. **Replace Stats with FeatureList** (removes fake data)
3. **Refine UseCases** to show ToWow + 2 generic
4. **Update TrustNetworkPreview** with mock data + pulse animation
5. **Hero animation** tweak (optional but nice)
6. **TypeScript check** and test respon
