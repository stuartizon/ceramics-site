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
RUN npm ci --workspace=backend

COPY backend backend
# Skips bundling the admin dashboard (Vite) entirely — that step was
# memory-hungry enough to stall Railway's builder silently for ~20 min.
# The dashboard is built and hosted separately instead; see admin.disable
# in medusa-config.ts.
ENV ADMIN_DISABLED=true
RUN npm run build --workspace=backend

# `medusa build` emits a self-contained app under .medusa/server with its own
# package.json but no lockfile, so the production stage reinstalls from there.
# Medusa's deploy docs call for /server specifically (not /app) as the
# runtime working directory, to avoid conflicts with Admin customizations.
FROM node:20-alpine AS production
WORKDIR /server
ENV NODE_ENV=production
# Also needed at runtime — the server loader checks this same flag before
# trying to serve the (now nonexistent) bundled dashboard.
ENV ADMIN_DISABLED=true

COPY --from=build /build/backend/.medusa/server .
RUN npm install --omit=dev --no-audit --no-fund --prefer-offline

EXPOSE 9000
CMD ["npm", "run", "start"]
