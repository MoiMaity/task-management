# Multi-stage build for the API inside an npm-workspaces monorepo.
#
# The build context is the REPO ROOT, not apps/api — the workspace layout means
# a build needs the root package.json, the lockfile and packages/shared. Set
# your platform's build context to "." and the Dockerfile path to
# "apps/api/Dockerfile".

# ---- deps -------------------------------------------------------------------
FROM node:20-alpine AS deps
WORKDIR /app

# Copy only manifests first so this layer caches until dependencies change.
COPY package.json package-lock.json ./
COPY packages/shared/package.json ./packages/shared/
COPY apps/api/package.json ./apps/api/
COPY apps/web/package.json ./apps/web/

# --ignore-scripts skips the root postinstall (which builds @tms/shared); the
# source is not copied yet, so it would fail here. The build stage runs it.
RUN npm ci --ignore-scripts

# ---- build ------------------------------------------------------------------
FROM node:20-alpine AS build
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/apps/api/node_modules ./apps/api/node_modules
COPY package.json package-lock.json ./
COPY packages ./packages
COPY apps/api ./apps/api

RUN npm run build --workspace @tms/shared \
 && npm run build --workspace @tms/api

# Drop dev dependencies from the tree we are about to ship.
RUN npm prune --omit=dev --workspace @tms/api --workspace @tms/shared

# ---- runtime ----------------------------------------------------------------
FROM node:20-alpine AS runtime
WORKDIR /app

ENV NODE_ENV=production

# Run as a non-root user. node:20-alpine ships a `node` user already.
COPY --from=build --chown=node:node /app/node_modules ./node_modules
COPY --from=build --chown=node:node /app/package.json ./package.json
COPY --from=build --chown=node:node /app/packages/shared/dist ./packages/shared/dist
COPY --from=build --chown=node:node /app/packages/shared/package.json ./packages/shared/package.json
COPY --from=build --chown=node:node /app/apps/api/dist ./apps/api/dist
COPY --from=build --chown=node:node /app/apps/api/package.json ./apps/api/package.json

USER node

# Most platforms inject PORT; main.ts reads it and binds 0.0.0.0.
EXPOSE 4000

CMD ["node", "apps/api/dist/main.js"]
