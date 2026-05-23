# ─────────────────────────────────────────────
# Stage 1: Install all dependencies
# ─────────────────────────────────────────────
FROM node:24-alpine AS deps

RUN corepack enable && corepack prepare pnpm@11.2.2 --activate

WORKDIR /app

COPY .npmrc package.json pnpm-workspace.yaml pnpm-lock.yaml ./
COPY packages/shared/package.json ./packages/shared/
COPY apps/web/package.json ./apps/web/

RUN pnpm install

# ─────────────────────────────────────────────
# Stage 2: Build UmiJS → static files in dist/
# ─────────────────────────────────────────────
FROM node:24-alpine AS builder

RUN corepack enable && corepack prepare pnpm@11.2.2 --activate

WORKDIR /app

# Copy node_modules from deps so umi binary is available
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/apps/web/node_modules ./apps/web/node_modules
COPY --from=deps /app/packages/shared/node_modules ./packages/shared/node_modules

COPY .npmrc package.json pnpm-workspace.yaml ./
COPY tsconfig.base.json ./
COPY packages/shared ./packages/shared
COPY apps/web ./apps/web

ENV UMI_APP_API_URL=http://localhost:3000/api/v1

RUN cd apps/web && node_modules/.bin/max build

# ─────────────────────────────────────────────
# Stage 3: Serve with nginx (~25MB final image)
# ─────────────────────────────────────────────
FROM nginx:1.27-alpine AS production

RUN rm /etc/nginx/conf.d/default.conf
COPY apps/web/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /app/apps/web/dist /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
