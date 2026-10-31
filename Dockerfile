# Production image: the Next.js standalone server on Node 24 LTS. Portable; no platform assumptions.

FROM node:24.22.2-alpine AS base
ENV NEXT_TELEMETRY_DISABLED=1 \
    COREPACK_ENABLE_DOWNLOAD_PROMPT=0
RUN corepack enable pnpm

FROM base AS deps
WORKDIR /app
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN pnpm install --frozen-lockfile

FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN pnpm build

FROM node:24.22.2-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1 \
    HOSTNAME=0.0.0.0 \
    PORT=3000 \
    MEDIA_DIR=/app/media
# The standalone folder already holds .next/static and public/ (scripts/prepare-standalone.mjs).
COPY --from=builder --chown=node:node /app/.next/standalone ./
# Uploaded media: mount a volume here. On start, Payload applies pending migrations and seeds an
# empty database.
RUN mkdir -p /app/media && chown node:node /app/media
VOLUME ["/app/media"]
USER node
EXPOSE 3000
CMD ["node", "server.js"]
