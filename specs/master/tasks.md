# Tasks: Landing Page Implementation

**Feature**: landing-page  
**Spec**: spec.md  
**Plan**: plan.md  
**Branch**: master  

---

## Phase 1: Setup

No setup tasks needed - project already initialized with Next.js, dependencies installed.

---

## Phase 2: Foundational (Blocking Prerequisites)

These must be completed before user stories can be implemented.

- [ ] T001 Review existing `src/app/page.tsx` to understand current structure
- [ ] T002 Create backup of original file (copy to `src/app/page.tsx.bak`)
- [ ] T003 Verify TypeScript configuration (`tsconfig.json`) allows JSX and strict mode
- [ ] T004 Confirm framer-motion version >= 12 in package.json
- [ ] T005 Test dev server runs without errors: `npm run dev`

---

## Phase 3: User Story US1 - "As a new visitor, I quickly understand Xenos core value"

**Priority**: P0  
**Test Criteria**: Hero section displays clear value proposition; both CTAs visible and link correctly.

### Tasks:

- [ ] T010 [US1] Update Hero section title to match brand: "Xenos" with gradient text
- [ ] T011 [US1] Update Hero subtitle: "Agent 信用协议"
- [ ] T012 [US1] Rewrite Hero description to: "面向 AI Agent 的轻量级信任协议，让 Agent 之间建立可验证的信任"
- [ ] T013 [US1] Ensure primary CTA "立即体验" links to `/api/auth/login`
- [ ] T014 [US1] Ensure secondary CTA "查看信任网络" links to `/trust`
- [ ] T015 [US1] Add animated scroll indicator at bottom of Hero (optional but nice)

---

## Phase 4: User Story US2 - "As a developer, I view technical features"

**Priority**: P0  
**Test Criteria**: CoreConcepts section displays 3 pillars with correct Chinese titles and descriptions matching Constitution.

### Tasks:

- [ ] T020 [US2] Verify CoreConcepts icons: 🔐, 📊, ⚡
- [ ] T021 [US2] Update CoreConcept 1 title: "可验证承诺" (unchanged if already correct)
- [ ] T022 [US2] Update CoreConcept 1 description to emphasize Ed25519 + W3C VC
- [ ] T023 [US2] Update CoreConcept 2 title: "上下文信誉" (unchanged)
- [ ] T024 [US2] Update CoreConcept 2 description to include "按领域独立计算履约率"
- [ ] T025 [US2] Update CoreConcept 3 title: "零依赖链" (unchanged)
- [ ] T026 [US2] Update CoreConcept 3 description to emphasize "纯链下，零 Gas 费"
- [ ] T027 [US2] Ensure gradient classes for each card match research: from-blue-400 to-cyan-500, from-purple-400 to-pink-500, from-orange-400 to-red-500

---

## Phase 5: User Story US3 - "As a partner (ToWow), I understand integration positioning"

**Priority**: P1  
**Test Criteria**: UseCases section shows ToWow as primary scenario; other scenarios align with Constitution.

### Tasks:

- [ ] T030 [US3] Replace UseCases cards content with:
  - Card 1: ToWow Agent 匹配 (icon 🌐, tags ["ToWow","Agent 匹配","信誉查询"])
  - Card 2: 动态定价 (icon 💰, tags ["信誉经济","激励机制"])
  - Card 3: 第三方验证 (icon 🔍, tags ["可验证性","透明度"])
- [ ] T031 [US3] Update descriptions to match Constitution examples (Section 110-130)
- [ ] T032 [US3] Verify hover effects still work with new content

---

## Phase 6: User Story US4 - "As a mobile user, I can navigate the site"

**Priority**: P0 (Critical - current mobile nav is broken)  
**Test Criteria**: Mobile device (< 768px) shows hamburger button; menu opens/closes; all links accessible.

### Tasks:

- [ ] T040 [US4] Add `useState` import for mobile menu state
- [ ] T041 [US4] Add `mobileMenuOpen` state in Navbar component with setter
- [ ] T042 [US4] Add hamburger button (☰) visible only on mobile (`md:hidden`)
- [ ] T043 [US4] Implement mobile menu panel with `motion.div` animate on toggle
- [ ] T044 [US4] Populate mobile menu with same links as desktop: 核心特性, 工作流, 应用场景, 信任网络, Agent 大厅 (arranged vertically)
- [ ] T045 [US4] Close mobile menu when clicking a link (setMobileMenuOpen(false))
- [ ] T046 [US4] Close mobile menu when clicking outside area (optional, but good UX)
- [ ] T047 [US4] Test mobile menu on viewport widths: 375px, 768px, 1024px

---

## Phase 7: User Story US5 - "I see real data, not fake statistics"

**Priority**: P0  
**Test Criteria**: Stats section no longer displays arbitrary numbers; replaced with factual feature list.

### Tasks:

- [ ] T050 [US5] Remove `Stats` component entirely from `HomePage` return
- [ ] T051 [US5] Rename `Stats` to `FeaturesList` (or create new component)
- [ ] T052 [US5] Define `features` array with 6 feature items (see research.md for exact list)
- [ ] T053 [US5] Implement grid layout (2 cols mobile, 3 cols md, 3 cols lg)
- [ ] T054 [US5] Add fade-in-up animation with `staggerContainer`
- [ ] T055 [US5] Style each feature item: flex row, icon + text, rounded-xl, bg-gray-900/50
- [ ] T056 [US5] Replace old Stats section call with new `<FeaturesList />` component

---

## Phase 8: User Story US6 - "I see dynamic trust network visualization"

**Priority**: P1  
**Test Criteria**: TrustNetworkPreview canvas shows animated network; pulse from center; connections have variable opacity.

### Tasks:

- [ ] T060 [US6] Refactor `TrustNetworkPreview` to extract `getMockNetwork()` function
- [ ] T061 [US6] Return `{ nodes: Node[], connections: Connection[] }` with typed interfaces
- [ ] T062 [US6] Add `reputation` field to Node (0-1 float) for future coloring
- [ ] T063 [US6] Add `strength` field to Connection (0-1 float) for line thickness
- [ ] T064 [US6] Implement pulse animation from Xenos node outward (expanding circle)
- [ ] T065 [US6] Update line drawing: opacity based on `strength` + sine wave time modulation
- [ ] T066 [US6] Update node drawing: color based on `reputation` (green/yellow/red) with glow
- [ ] T067 [US6] Add comment in code: "TODO: replace getMockNetwork with fetch('/api/trust/network')"
- [ ] T068 [US6] Verify canvas resizes correctly on window resize

---

## Phase 9: Cross-Cutting Concerns

Tasks that touch multiple user stories or are quality-oriented.

- [ ] T100 TypeScript check: `npx tsc --noEmit` should pass with 0 errors
- [ ] T101 Lint: `npm run lint` (fix any warnings)
- [ ] T102 Accessibility audit: check color contrast >= 4.5:1 for text
- [ ] T103 Add `prefers-reduced-motion` media query to disable non-essential animations
- [ ] T104 Verify all external links have `rel="noopener noreferrer"` (Footer GitHub link)
- [ ] T105 Test responsive breakpoints: 375px, 768px, 1024px, 1280px
- [ ] T106 Lighthouse audit: Performance > 90, Accessibility > 90, Best Practices > 90
- [ ] T107 Verify all Chinese text is in Simplified Chinese (no English mix except technical terms)
- [ ] T108 Check all CTA buttons have correct href attributes (no broken links)
- [ ] T109 Ensure no console errors/warnings in browser

---

## Phase 10: Deployment

- [ ] T120 Build production bundle: `npm run build`
- [ ] T121 Start production server: `npm start` and test locally
- [ ] T122 Commit changes with proper commit message:
```bash
git add src/app/page.tsx
git commit -m "feat: update landing page based on real project info

- Add mobile navigation menu (hamburger)
- Replace fake Stats with FeaturesList (6 real features)
- Update UseCases: ToWow integration, dynamic pricing, third-party verification
- Refactor TrustNetworkPreview with mock data + pulse animation
- Ensure all content in Chinese (per design principles)
- Remove exaggerated statistics"
```
- [ ] T123 Push to remote: `git push origin master`
- [ ] T124 Verify Vercel deployment succeeds (check Vercel dashboard)
- [ ] T125 Test production URL: functionality and performance
- [ ] T126 Update AGENTS.md if any new tech added (should already be done)

---

## Dependencies

| Story | Depends On |
|-------|------------|
| US1 (Hero) | Phase 2 (T001-T005) |
