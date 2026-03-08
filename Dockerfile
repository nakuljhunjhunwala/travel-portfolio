# ── Stage 1: Install dependencies ──
FROM node:22-alpine AS deps
RUN corepack enable && corepack prepare pnpm@latest --activate
WORKDIR /app

COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

# ── Stage 2: Build the application ──
FROM node:22-alpine AS builder
RUN corepack enable && corepack prepare pnpm@latest --activate
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Build-time env vars (NEXT_PUBLIC_*) must be available at build time.
# Pass them via --build-arg or .env file mounted at build time.
# Server-only env vars (GEMINI_API_KEY, etc.) are only needed at runtime.
ARG NEXT_PUBLIC_FIREBASE_API_KEY
ARG NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
ARG NEXT_PUBLIC_FIREBASE_PROJECT_ID
ARG NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
ARG NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID
ARG NEXT_PUBLIC_FIREBASE_APP_ID
ARG NEXT_PUBLIC_MAPBOX_TOKEN
ARG NEXT_PUBLIC_ENABLE_LOGIN_GATE
ARG NEXT_PUBLIC_BASE_URL

ENV NEXT_TELEMETRY_DISABLED=1

RUN pnpm build

# ── Stage 3: Production runner ──
FROM node:22-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Create non-root user
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Copy standalone output + static assets + public files
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

# PORT is configurable via environment variable (default 3000)
ENV HOSTNAME="0.0.0.0"

# The standalone server reads PORT and HOSTNAME from env
CMD ["node", "server.js"]
