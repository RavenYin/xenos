# syntax=docker/dockerfile:1
FROM node:18-bookworm-slim AS base
WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1

FROM base AS deps
COPY package*.json prisma/schema.prisma prisma/ .
RUN npm ci

FROM deps AS build
COPY . .
RUN npm run build
RUN npm prune --production

FROM base AS runner
ENV NODE_ENV=production
ENV PORT=3000
WORKDIR /app

COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/.next/standalone ./standalone
COPY --from=build /app/.next/static ./standalone/.next/static
COPY --from=build /app/public ./public

EXPOSE 3000
CMD ["node", "standalone/server.js"]
