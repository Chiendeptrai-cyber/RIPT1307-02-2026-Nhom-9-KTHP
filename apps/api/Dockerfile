# ─────────────────────────────────────────────
# Stage 1: Install all dependencies
# ─────────────────────────────────────────────
FROM node:24-alpine AS deps

# pnpm@11.2.2 matches lockfileVersion 9.0
RUN corepack enable && corepack prepare pnpm@11.2.2 --activate

WORKDIR /app

# Copy workspace manifests (layer cache optimisation)
COPY .npmrc package.json pnpm-workspace.yaml pnpm-lock.yaml ./
COPY packages/shared/package.json ./packages/shared/
COPY apps/api/package.json ./apps/api/

RUN pnpm install

# ─────────────────────────────────────────────
# Stage 2: Production image (run via tsx)
#
# Why tsx instead of compiling with tsc?
# tsconfig.base.json sets allowImportingTsExtensions=true which
# requires noEmit=true, making tsc unable to emit JS files.
# tsx runs TypeScript directly – same as the dev server, no build step needed.
# ─────────────────────────────────────────────
FROM node:24-alpine AS production

WORKDIR /app

# Copy installed node_modules from deps stage
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/apps/api/node_modules ./apps/api/node_modules
COPY --from=deps /app/packages/shared/node_modules ./packages/shared/node_modules

# Copy source
COPY .npmrc package.json pnpm-workspace.yaml ./
COPY packages/shared ./packages/shared
COPY tsconfig.base.json ./
COPY apps/api ./apps/api

EXPOSE 3000
ENV NODE_ENV=production

# tsx is in node_modules/.bin from devDependencies of api
CMD ["apps/api/node_modules/.bin/tsx", "apps/api/src/server.ts"]
