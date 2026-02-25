# Feature: Xenos Landing Page

## Overview

创建一个展示 Xenos 信任协议核心理念和功能的官方网站首页，作为用户了解项目和登录的入口。

**Primary Goal**: 向潜在用户（Agent开发者、生态合作伙伴）清晰传达 Xenos 的价值主张，引导他们登录体验。

---

## User Stories

- 作为**新访客**，我想快速了解 Xenos 是什么、有什么核心价值，以便决定是否使用
- 作为**开发者**，我想查看技术栈和特性，评估是否适合我的项目
- 作为**合作伙伴**（如 ToWow），我想了解 Xenos 在生态中的定位
- 作为**已注册用户**，我想通过显著入口登录系统

---

## Functional Requirements

### FR-1: 页面结构

页面必须包含以下 sections（按顺序）：

1. **Navbar** - 固定在顶部，包含：
   - Logo + 项目名称 "Xenos"
   - 导航链接：核心特性、工作流、应用场景（可选）、信任网络、Agent 大厅
   - 显眼的 CTA 按钮："进入 Xenos" 链接到 `/api/auth/login`

2. **Hero** - 首屏视觉焦点：
   - 大标题 "Xenos"（渐变文字）
   - 副标题 "Agent 信用协议"
   - 价值主张描述（1-2句）
   - 主 CTA："立即体验" → `/api/auth/login`
   - 次 CTA："查看信任网络" → `/trust`
   - 动态背景效果（光波/粒子动画）

3. **CoreConcepts** - 三大核心特性展示：
   - 可验证承诺（VCA）
   - 上下文信誉（Contextual Reputation）
   - 零依赖链（Pure Off-chain）
   每项包含图标、标题、简要描述

4. **Workflow** - 承诺生命周期可视化：
   - 4个步骤：创建承诺 → 上下文分析 → 信誉评分 → 依赖解析
   - 带编号圆圈 + 连接线
   - 悬停交互效果

5. **UseCases** - 应用场景（可选，需基于真实案例）：
   - 目前已知：ToWow 生态集成
   - 未来可能：跨链验证（如果实现）
   - 每个场景配图标、描述、标签

6. **TrustNetworkPreview** - 信任网络动态可视化：
   - Canvas 绘制 Agent 节点和承诺连接
   - 实时动画展示连线的建立/消失
   - 节点颜色/大小表示信誉状态

7. **Stats** - 项目数据（需真实数据）：
   - 活跃用户数
   - 承诺总数
   - 系统可用性
   - 支持的协议数
   - **如果无数据，改为功能特性清单**

8. **Footer** - 页脚：
   - Logo + 简介
   - 产品链接（信任网络、Agent 大厅、登录）
   - 资源链接（GitHub、文档、API 参考）
   - 版权信息

### FR-2: 动画与交互

- **Framer Motion** 实现所有动画
- **滚动触发**：大部分 section 使用 `useInView` 滚动触发动画
- **悬停效果**：卡片、按钮的缩放、颜色变化
- **Hero 背景**：光波扩散效果（模拟信任传播）
- **Workflow 连线**：光点流动动画（承诺流转）
- **TrustNetworkPreview**：Canvas 实时渲染（节点脉冲、连线闪烁）
- **数字动画**：Stats 部分的计数器增长（如果有数据）

### FR-3: 响应式设计

- 移动端优先（Mobile First）
- Tablet 和 Desktop 适配
- Navbar 在移动端隐藏导航链接，保留 Logo 和 CTA
- Grid 布局自动调整（1列 → 2列 → 3/4列）

### FR-4: 样式规范

- **主题**: 暗色模式（Dark Theme）- 符合技术产品调性
- **主色调**: Purple (#a855f7) → Pink (#ec4899) → Red (#ef4444) 渐变
- **背景**: Gray-950 (#030712) → Gray-900 (#111827)
- **字体**: Inter (Google Fonts)
- **中文界面**: 所有用户可见文字使用简体中文
- **圆角**: 标准 8px (rounded-xl, rounded-2xl)
- **阴影**: 柔和阴影，紫色光晕

---

## Non-Functional Requirements

### NFR-1: Performance

- 页面首屏加载时间 < 2s（Lighthouse Performance > 90）
- Framer Motion 动画保持 60fps
- Canvas 动画渲染优化（requestAnimationFrame）
- 图片/资源懒加载（如果需要）

### NFR-2: Accessibility

- 所有交互元素支持键盘导航
- 颜色对比度满足 WCAG AA 标准（文本≥4.5:1）
- 动画提供 `prefers-reduced-motion` 降级方案
- 语义化 HTML 标签

### NFR-3: SEO

- 合理的 `<title>` 和 `<meta description>`
- 结构化数据（Schema.org）标记
- Open Graph tags 用于社交分享
- 服务器端渲染（Next.js 自动优化）

### NFR-4: Browser Support

- 现代浏览器：Chrome 90+, Firefox 88+, Safari 14+, Edge 90+
- 降级方案：Canvas 动画不支持时显示静态图/备用内容

---

## Technical Context

**Language**: TypeScript (strict mode)  
**Framework**: Next.js 14 (App Router)  
**UI Library**: React 18  
**Styling**: Tailwind CSS 3.3+  
**Animation**: Framer Motion 12+  
**Authentication**: NextAuth.js (SecondMe Provider configured)  
**Deployment**: Vercel (automatic from Git push)  
**Database**: PostgreSQL (via Prisma) - 用于存储用户、承诺、信誉数据  
**ORM**: Prisma 6.4+  

**Known Dependencies**: (来自 package.json)
- @noble/ed25519 (签名)
- @digitalcredentials/vc (可验证凭证)
- next-auth (认证)
- framer-motion (动画)

---

## Design References

- **Brand Slogan**: "从陌生人到盟友，凭可验证之契" (From strangers to allies, by verified pact)
- **Core Values**:
  - 信任不应预设，而应可证
  - 声誉是上下文绑定的履约记录
  - 每个承诺都是一份可验证的"数字契约"
- **Color Palette**:
  - Primary: `#a855f7` (purple-500)
  - Secondary: `#ec4899` (pink-500)
  - Accent: `#ef4444` (red-500)
  - Background: `#030712` (gray-950) → `#111827` (gray-900)

---

## Acceptance Criteria

### AC-1: Visual Fidelity
- Design matches specification (sections, layout, colors)
- Animations smooth and performant
- No console errors or warnings

### AC-2: Functionality
- All CTA buttons link to correct destinations
- Navbar固定在顶部，滚动时保持
- Hero CTA "立即体验" → `/api/auth/login`
- TrustNetworkPreview Canvas 渲染无报错

### AC-3: Responsive
- 在 mobile (375px), tablet (768px), desktop (1280px) 显示正常
- 导航在移动端正确折叠（当前实现隐藏部分链接）
- 图片和文字在小屏幕可读

### AC-4: Content Accuracy
- 所有文字描述基于真实项目信息（不夸大、不编造）
- 如果缺少数据（如用户统计），使用"即将推出"或删除该section
- 核心特性描述与 README 和 constitution 一致

### AC-5: Accessibility
- 颜色对比度检查通过
- 动画可被 `prefers-reduced-motion` 禁用

---

## Open Questions

1. **UseCases Section Content**: 是否展示 ToWow 集成？还是只展示通用场景？
2. **Stats Numbers**: 如果暂无真实数据，是删除该 section 还是展示"即将推出"？
3. **TrustNetworkPreview Data Source**: 动态数据从哪里获取？Mock 数据还是真实 API？
4. **Mobile Navbar**: 移动端导航是否添加汉堡菜单展开功能？
5. **Language**: 是否全部使用中文？还是中英混合？

---

## Constraints

- **No Fake Data**: 统计数据、应用案例必须真实或标注"计划中"
- **No Unnecessary Animations**: 动画必须有明确目的，不滥用
- **Lightweight**: 总 JS bundle 大小 < 500KB (gzipped)
- **Fast Development**: 基于现有布局文件修改，不重写 CSS

---

## Out of Scope

- 用户注册/登录页面本身（由 NextAuth 提供）
- 承诺创建/管理的前端页面（在 `/agents` 和 `/dashboard`）
- 信任网络详情页（链接到 `/trust` 现有页面）
- API 开发（后端路由已存在或另开 feature）
- 多语言支持（i18n）

---

## Success Metrics

- 页面加载时间 < 2s
- 用户点击 CTA 率 > 10%
- 无 TypeScript 编译错误
- Lighthouse Accessibility > 90
- 代码覆盖率 > 80% (unit tests for components)

---

## References

- Project README: `README.md`
- Constitution: `.specify/memory/constitution.md`
- Existing Pages: `src/app/agents/page.tsx`, `src/app/trust/page.tsx`
- Design System: Tailwind CSS + Framer Motion
- Authentication: `src/app/api/auth/[...nextauth]/route.ts`

---

**Feature ID**: landing-page  
**Priority**: P0 (Must Have)  
**Status**: In Progress  
**Owner**: Frontend Team  
**Due Date**: TBD
