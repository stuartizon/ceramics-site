# syntax=docker/dockerfile:1

# Build context is the monorepo root so npm workspaces can resolve the root
# lockfile and version overrides (see package.json `overrides`) — a Nixpacks
# build scoped to backend/ alone wouldn't see either. frontend/package.json is
# copied only to satisfy lockfile validation for the workspaces glob; --workspace
# below keeps npm from actually installing frontend's (much heavier) dependency
# tree, which was blowing past the builder's memory/time budget.

FROM node:20-alpine AS build
WORKDIR /build

COPY package.json package-lock.json ./
COPY backend/package.json backend/package.json
COPY frontend/package.json frontend/package.json
RUN --mount=type=cache,id=npm,target=/root/.npm \
    npm ci --workspace=backend --no-audit --no-fund --prefer-offline --loglevel http

COPY backend backend
RUN npm run build --workspace=backend

# `medusa build` emits a self-contained app under .medusa/server with its own
# package.json but no lockfile, so the production stage reinstalls from there.
# Medusa's deploy docs call for /server specifically (not /app) as the
# runtime working directory, to avoid conflicts with Admin customizations.
FROM node:20-alpine AS production
WORKDIR /server
ENV NODE_ENV=production

COPY --from=build /build/backend/.medusa/server .
RUN --mount=type=cache,id=npm,target=/root/.npm \
    npm install --omit=dev --no-audit --no-fund --prefer-offline --loglevel http

EXPOSE 9000
CMD ["npm", "run", "start"]
