# syntax=docker/dockerfile:1

FROM node:20-alpine AS build
WORKDIR /build

COPY package.json package-lock.json ./
# `npm ci` here rejects this lockfile as out-of-sync immediately after
# `npm install` itself generated it (reproducible, not a caching
# artifact) — an npm bug around the picomatch@2/picomatch@3 split in this
# dependency tree, not an actual inconsistency. `npm install` builds an
# identical, working node_modules without hitting it. This is weaker
# than npm ci (won't hard-fail on real lockfile drift) — tracked in
# https://github.com/stuartizon/ceramics-site/issues/3.
RUN --mount=type=cache,id=npm,target=/root/.npm \
    npm install --no-audit --no-fund --prefer-offline --loglevel http

COPY . .
RUN npm run build

# `medusa build` emits a self-contained app under .medusa/server with its own
# package.json but no lockfile, so the production stage reinstalls from there.
# Medusa's deploy docs call for /server specifically (not /app) as the
# runtime working directory, to avoid conflicts with Admin customizations.
FROM node:20-alpine AS production
WORKDIR /server
ENV NODE_ENV=production

COPY --from=build /build/.medusa/server .
# medusa build only compiles .ts/.js — it doesn't copy raw assets, so the
# product-catalog seed script's image fixtures need an explicit copy here
# to land at the same src/migration-scripts/seed-images path it expects.
COPY src/migration-scripts/seed-images src/migration-scripts/seed-images
RUN --mount=type=cache,id=npm,target=/root/.npm \
    npm install --omit=dev --no-audit --no-fund --prefer-offline --loglevel http

EXPOSE 9000
CMD ["npm", "run", "start"]
