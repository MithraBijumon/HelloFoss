# Built for Coolify's Dockerfile buildpack. Keeps devDependencies in the
# final image (notably the `prisma` CLI) so the container can run
# `prisma migrate deploy` on startup without a separate deploy step.
FROM node:24-bookworm-slim AS base
# Prisma's CLI detects libssl at runtime; the slim image doesn't ship it.
RUN apt-get update -y && apt-get install -y --no-install-recommends openssl \
  && rm -rf /var/lib/apt/lists/*
WORKDIR /app

FROM base AS deps
COPY package.json package-lock.json ./
COPY prisma ./prisma
RUN npm ci

FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ENV NEXT_TELEMETRY_DISABLED=1
# `next build` evaluates API route modules to collect their config, which
# eagerly constructs the Prisma client (lib/db.ts) — it never connects at
# build time, but it does require DATABASE_URL to be a non-empty string.
# The real value is injected by Coolify at runtime, not at build time.
ENV DATABASE_URL="postgresql://build:build@localhost:5432/build"
# The Prisma client is generated into ./generated (not node_modules), which
# neither the deps stage's node_modules nor the build context carries over.
RUN npx prisma generate
RUN npm run build

FROM base AS runner
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/prisma7.config.ts ./
COPY --from=builder /app/next.config.ts ./
COPY --from=builder /app/package.json ./

EXPOSE 3000
CMD ["sh", "-c", "npx prisma migrate deploy && npm run start"]
