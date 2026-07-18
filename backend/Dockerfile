# Build context is the monorepo root so npm workspaces can resolve the root
# lockfile and version overrides (see package.json `overrides`) — a Nixpacks
# build scoped to backend/ alone wouldn't see either.

FROM node:20-alpine AS build
WORKDIR /build

COPY package.json package-lock.json ./
COPY backend/package.json backend/package.json
COPY frontend/package.json frontend/package.json
RUN npm ci

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
RUN npm install --omit=dev

EXPOSE 9000
CMD ["npm", "run", "start"]
