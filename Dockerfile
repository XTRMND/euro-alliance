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

# The staging seed (docs/seeding.md): the source and every dependency, to run
# `pnpm seed:staging` against the staging database and media volume. Built only with
# `--target seed`; the default build stops at `runner`, the last stage.
FROM base AS seed
WORKDIR /app
ENV COREPACK_HOME=/opt/corepack \
    MEDIA_DIR=/app/media
# The pnpm version package.json names is fetched while building, so the seed runs offline.
COPY package.json ./
RUN mkdir -p /opt/corepack /app/media && pnpm --version && chown -R node:node /opt/corepack /app/media
COPY --from=deps /app/node_modules ./node_modules
COPY --chown=node:node . .
USER node
CMD ["pnpm", "seed:staging", "--dry-run"]

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
