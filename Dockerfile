# syntax=docker.io/docker/dockerfile:1

FROM node:22-alpine AS base

# ────────────────────────────────────────────────
# Stage: deps – install dependencies
# ────────────────────────────────────────────────
FROM base AS deps

RUN apk add --no-cache libc6-compat
WORKDIR /app

COPY package.json yarn.lock* package-lock.json* pnpm-lock.yaml* .npmrc* ./
# Ensure Prisma schema is available for postinstall / prisma generate
COPY prisma ./prisma/

RUN \
  if [ -f yarn.lock ]; then yarn --frozen-lockfile; \
  elif [ -f package-lock.json ]; then npm ci; \
  elif [ -f pnpm-lock.yaml ]; then corepack enable pnpm && pnpm i --frozen-lockfile; \
  else echo "Lockfile not found." && exit 1; \
  fi

# ────────────────────────────────────────────────
# Stage: builder – compile the Next.js app
# ────────────────────────────────────────────────
FROM base AS builder

WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Optional: disable Next.js telemetry
# ENV NEXT_TELEMETRY_DISABLED=1

# Add dummy DATABASE_URL for build (Prisma validation requires it)
ENV DATABASE_URL="postgresql://dummy:dummy@localhost:5432/dummy"

RUN \
  if [ -f yarn.lock ]; then yarn run build; \
  elif [ -f package-lock.json ]; then npm run build; \
  elif [ -f pnpm-lock.yaml ]; then corepack enable pnpm && pnpm run build; \
  else echo "Lockfile not found." && exit 1; \
  fi

# ────────────────────────────────────────────────
# Stage: runner – minimal production image
# ────────────────────────────────────────────────
FROM base AS runner

WORKDIR /app

ENV NODE_ENV=production
# Optional: disable telemetry at runtime
# ENV NEXT_TELEMETRY_DISABLED=1

# Install minimal runtime dependencies (openssl for Prisma compatibility)
# Alpine uses apk, not apt-get
RUN apk add --no-cache openssl

# Create non-root user with a home directory
RUN addgroup --system --gid 1001 nodejs && \
  adduser --system --uid 1001 --ingroup nodejs nextjs

# Copy built artifacts from builder
COPY --from=builder /app/public ./public

# Standalone output + static files (Next.js output tracing)
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Copy Prisma schema & generated client (important if you run migrations at startup)
COPY --from=builder --chown=nextjs:nodejs /app/prisma ./prisma
COPY --from=builder --chown=nextjs:nodejs /app/prisma.config.ts ./prisma.config.ts

USER nextjs

ENV HOME=/home/nextjs

EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["node", "server.js"]
