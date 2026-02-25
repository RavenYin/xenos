# Quickstart: Landing Page Development

## Prerequisites

- Node.js 18+ installed
- PostgreSQL running (for full app, not needed for landing page static build)
- `npm install` completed in project root

---

## Setup Steps

### 1. Environment Configuration

Landing page does **not** require special environment variables. It's purely client-side.

If you want to test full app with OAuth:

```bash
cp .env.local.example .env.local
# Edit .env.local with your SecondMe credentials
```

For landing page only, you can skip `.env.local`.

---

### 2. Install Dependencies

```bash
npm install
# framer-motion should be in dependencies already
```

---

### 3. Run Development Server

```bash
npm run dev
# → http://localhost:3000
```

Landing page is at `/` (root route).

---

### 4. Making Changes

**File to edit**: `src/app/page.tsx`

The file contains:
- `StatNumber` (or `FeatureItem` after modification) component
- `Navbar` (fixed top navigation)
- `Hero` (full-screen intro with animated background)
- `ConceptCard` + `CoreConcepts` (3 pillars)
- `Workflow` (4-step timeline)
- `UseCases` (3 scenario cards)
- `TrustNetworkPreview` (canvas animation)
- `FeaturesList` (replaces fake Stats)
- `Footer`

**Modification workflow**:

1. Edit `src/app/page.tsx` in your editor
2. Save → dev server hot-reloads automatically
3. Check browser console for errors
4. Test responsive (resize window or Chrome DevTools device mode)

---

### 5. Type Checking

```bash
npx tsc --noEmit
```

Should exit with code 0 (no errors).

---

### 6. Build & Test Production

```bash
npm run build
npm start
```

Test the production build locally before pushing.

---

## Key Implementation Notes

### Animation Performance

- All animations use Framer Motion's `motion` components
- `useInView` triggers animations only when scrolled into view
- Canvas uses `requestAnimationFrame` for 60fps
- Avoid heavy calculations in render loops

### Responsive Breakpoints

- `md`: 768px (tablet)
- `lg`: 1024px (desktop)
- Mobile: < 768px

Test at:
- 375px (iPhone SE)
- 768px (iPad)
- 1280px (desktop)

### Colors & Theme

Current theme:
```
Primary: #a855f7 (purple-500)
Secondary: #ec4899 (pink-500)
Accent: #ef4444 (red-500)
Background: #030712 (gray-950) → #111827 (gray-900)
Text: #ffffff, #d1d5db, #9ca3af (gray-100/300/400)
```

Tailwind classes handle dark mode automatically.

---

## Common Tasks

### Update Hero Text

Edit the `Hero` component (around line 140-200). Change:
- Title inside `bg-clip-text` span
- Subtitle `<motion.p>` with `text-2xl`
- Description paragraph
- CTA button text/href

### Add/Remove Core Concepts

Modify the `concepts` array in `CoreConcepts()` function. Each entry needs:
- `icon`: emoji string
- `title`: Chinese title
- `description`: Chinese text
- `gradient`: Tailwind gradient class

### Modify TrustNetworkPreview Mock Data

Inside `TrustNetworkPreview` component, find the `nodes` and `connections` arrays in the `useEffect`. Adjust:
- Node positions (`x`, `y` normalized 0-1)
- Node `radius` (pixel size)
- Labels
- Connection pairs (`from`, `to` indices)

Animation parameters are in the `animate()` function:
- Pulse speed: `time * 0.002`
- Line opacity: `0.3 + Math.sin(...) * 0.2`

---

## Deployment to Vercel

```bash
git add src/app/page.tsx
git commit -m "feat: update landing page"
git push origin master
```

Vercel will auto-deploy. Production URL: `https://xenos-<your-branch>.vercel.app`

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| TypeScript errors | Run `npx tsc --noEmit` to see details |
| Animation jank | Check DevTools Performance, reduce re-renders |
| Canvas blank | Ensure canvas has explicit width/height (via `ref`) |
| Mobile menu not working | Check `mobileMenuOpen` state logic |
| Tailwind classes not applied | Verify `tailwind.config.ts` includes content paths |

---

## Next Steps After Landing Page

Once landing page is stable:
1. Add `/api/auth/login` integration test with Playwright
2. Connect TrustNetworkPreview to real API (`/api/trust/network`)
3. Add analytics (Google Analytics, Vercel Analytics)
4. Implement A/B testing for CTA buttons
5. Add Chinese font (Noto Sans SC) for better typography

---

**Last updated**: 2025-02-25  
**Spec**: `specs/master/spec.md`  
**Research**: `specs/master/research.md`
