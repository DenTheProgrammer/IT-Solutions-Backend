FROM node:24-bookworm-slim AS base
WORKDIR /app
RUN apt-get update \
    && apt-get install -y --no-install-recommends openssl ca-certificates \
    && rm -rf /var/lib/apt/lists/*

FROM base AS deps
COPY package.json package-lock.json ./
RUN npm ci

FROM deps AS build
COPY . .
RUN npm run build

FROM base AS production-deps
COPY package.json package-lock.json ./
RUN npm ci --omit=dev && npm cache clean --force

FROM base AS runtime
ENV NODE_ENV=production
ENV PORT=3000
COPY --from=production-deps --chown=node:node /app/node_modules ./node_modules
COPY --from=build --chown=node:node /app/dist ./dist
COPY --from=build --chown=node:node /app/dist-seed ./dist-seed
COPY --chown=node:node package.json package-lock.json prisma.config.ts ./
COPY --chown=node:node prisma/schema.prisma ./prisma/schema.prisma
COPY --chown=node:node prisma/migrations ./prisma/migrations
COPY --chown=node:node --chmod=755 docker-entrypoint.sh ./docker-entrypoint.sh
RUN touch schema.gql && chown node:node schema.gql
USER node
EXPOSE 3000
HEALTHCHECK --interval=10s --timeout=5s --start-period=30s --retries=3 \
    CMD node -e "fetch('http://127.0.0.1:' + process.env.PORT + '/health', { signal: AbortSignal.timeout(4000) }).then(r => { if (!r.ok) process.exit(1); }).catch(() => process.exit(1));"
ENTRYPOINT ["/app/docker-entrypoint.sh"]
