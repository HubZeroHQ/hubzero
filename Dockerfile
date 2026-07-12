# syntax=docker/dockerfile:1
FROM node:24-alpine AS base

FROM base AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

# Standalone output (next.config.ts) keeps the runtime image to just the
# built server + traced dependencies — no full node_modules copy needed.
FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production

RUN addgroup --system --gid 1001 nodejs \
  && adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs
EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Uploaded media (`lib/cms/storage/local-adapter.ts`) is written to
# /app/storage/media on the container's own filesystem — nothing in this
# image persists it. Without a host bind mount or named volume at this path,
# every redeploy silently orphans previously-uploaded files: their `Media`
# documents remain in MongoDB (a separate, durable service), but the bytes
# are gone, which is exactly the "Media record exists, file 404s" failure
# mode this app already degrades gracefully for
# (`components/admin/media/media-thumbnail.tsx`). Declaring the mount point
# here doesn't create persistence by itself — the deployment's `docker run
# -v`/compose/orchestrator config still has to actually mount something
# durable here — but it documents the requirement in the image itself
# instead of only in a doc someone might not read before their first deploy.
VOLUME ["/app/storage"]

CMD ["node", "server.js"]
