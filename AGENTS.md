# Repository Guidelines

## Project Structure & Module Organization
- `src/app` contains Next.js App Router pages and API handlers. Use `src/app/api/v1/*` for public VCA APIs and `src/app/api/auth/*` for auth flow endpoints.
- `src/components` stores reusable UI components (`PascalCase` filenames).
- `src/lib` holds shared business logic (auth, Prisma access, DID/VC, reputation, rate limiting).
- `prisma/schema.prisma` is the source of truth for data models.
- `tests/*.spec.ts` contains Playwright suites (API and E2E). Static assets live in `public/`; integration docs in `docs/`; MCP server code in `mcp/`.

## Build, Test, and Development Commands
- `npm install`: install dependencies.
- `npm run dev`: start local development server on port `3000`.
- `npm run build`: run `prisma generate` and create the production build.
- `npm run start`: run the built app in production mode.
- `npm run lint`: run Next.js ESLint checks.
- `npm test`: run all Playwright tests.
- `npm run test:api` / `npm run test:e2e`: run scoped test suites.

## Coding Style & Naming Conventions
- Use TypeScript with strict typing (`tsconfig.json` has `"strict": true`).
- Follow existing style: 2-space indentation, single quotes, and no semicolons.
- Components use `PascalCase` (example: `AgentCard.tsx`); utility files use lowercase or kebab-case (example: `rate-limit.ts`).
- Keep route directories lowercase to match URL paths.
- Prefer path alias imports like `@/lib/prisma` over deep relative paths.

## Testing Guidelines
- Test framework: Playwright (`@playwright/test`) with files named `*.spec.ts`.
- Add or update tests for API behavior and major UI flows when changing routes/components.
- Before opening a PR, run `npm run lint` and the relevant test command(s).

## Commit & Pull Request Guidelines
- Follow Conventional Commit style already used in history: `feat:`, `fix:`, `docs:`, `chore:`; optional scope is encouraged (e.g., `feat(landing): ...`).
- Keep each commit focused on one concern.
- PRs should include: summary, impacted paths (for example `src/app/api/v1/commitment`), test evidence, and screenshots for UI changes.

## Security & Configuration Tips
- Keep secrets in `.env.local` only; do not commit credentials.
- Database changes require updating `prisma/schema.prisma` and regenerating Prisma client (`npx prisma generate`).
