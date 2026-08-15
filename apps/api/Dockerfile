# Multi-stage build for the API inside an npm-workspaces monorepo.
#
# The build context is the REPO ROOT, not apps/api — a workspace build needs
# the root package.json, the lockfile and packages/shared. On Railway: leave
# Root Directory as "/" and set Dockerfile Path to "apps/api/Dockerfile".
#
# npm workspaces hoist dependencies into a single root node_modules and only
# create apps/*/node_modules when a version conflict forces it. Nothing here
# should ever reference a per-workspace node_modules directory.

# ---- deps: full install, used to compile ------------------------------------
FROM node:20-alpine AS deps
WORKDIR /app

# Manifests only, so this layer stays cached until a dependency changes.
# Every workspace package.json must be present or npm ci will report the
# lockfile as out of sync.
COPY package.json package-lock.json ./
COPY packages/shared/package.json ./packages/shared/
COPY apps/api/package.json ./apps/api/
COPY apps/web/package.json ./apps/web/

# --ignore-scripts skips the root postinstall (it builds @tms/shared, whose
# source has not been copied yet). The build stage compiles it explicitly.
RUN npm ci --ignore-scripts

# ---- prod-deps: the runtime dependency tree ---------------------------------
FROM node:20-alpine AS prod-deps
WORKDIR /app

COPY package.json package-lock.json ./
COPY packages/shared/package.json ./packages/shared/
COPY apps/api/package.json ./apps/api/
COPY apps/web/package.json ./apps/web/

# A clean production install rather than pruning the dev tree. `npm prune`
# behaves inconsistently across hoisted workspaces; a fresh --omit=dev install
# is deterministic and produces exactly the tree the runtime stage needs.
RUN npm ci --omit=dev --ignore-scripts

# ---- build ------------------------------------------------------------------
FROM node:20-alpine AS build
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY package.json package-lock.json ./
COPY packages ./packages
COPY apps/api ./apps/api

RUN npm run build --workspace @tms/shared \
 && npm run build --workspace @tms/api

# ---- runtime ----------------------------------------------------------------
FROM node:20-alpine AS runtime
WORKDIR /app

ENV NODE_ENV=production

# node:20-alpine already ships a non-root `node` user.
COPY --from=prod-deps --chown=node:node /app/node_modules ./node_modules
COPY --from=prod-deps --chown=node:node /app/package.json ./package.json

# node_modules/@tms/shared is a symlink into packages/shared, so that directory
# has to exist at the same relative path for the import to resolve.
COPY --from=build --chown=node:node /app/packages/shared/dist ./packages/shared/dist
COPY --from=build --chown=node:node /app/packages/shared/package.json ./packages/shared/package.json

COPY --from=build --chown=node:node /app/apps/api/dist ./apps/api/dist
COPY --from=build --chown=node:node /app/apps/api/package.json ./apps/api/package.json

USER node

# Railway injects PORT; main.ts reads it and binds 0.0.0.0.
EXPOSE 4000

CMD ["node", "apps/api/dist/main.js"]
