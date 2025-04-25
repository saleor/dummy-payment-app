FROM node:20.12-alpine AS base

RUN apk update
RUN apk add --no-cache libc6-compat

WORKDIR /app

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

FROM base AS deps
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile --prefer-offline

FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

RUN SECRET_KEY='dummy' pnpm build
RUN pnpm prune --prod

FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV APL=sentinel
# ENV APP_DEBUG='debug'

RUN addgroup --system --gid 1001 nodejs \
    && adduser --system --uid 1001 nextjs


COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/public ./public
COPY --from=deps /app/node_modules ./node_modules

USER nextjs

# ENV DEBUG=*

EXPOSE 3000

CMD ["node", "server.js"]