# syntax=docker/dockerfile:1

# ---------------------------------------------------------------- залежності
FROM node:22-alpine AS deps
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

# ------------------------------------------------------------------- збірка
FROM node:22-alpine AS builder
WORKDIR /app

# адреса сайту потрапляє в збірку: змінні NEXT_PUBLIC_* підставляються
# на етапі білда, а не в рантаймі
ARG NEXT_PUBLIC_SITE_URL="http://localhost:3000"
ENV NEXT_PUBLIC_SITE_URL=$NEXT_PUBLIC_SITE_URL
ENV NEXT_TELEMETRY_DISABLED=1

COPY --from=deps /app/node_modules ./node_modules
COPY . .

RUN npm run build

# ------------------------------------------------------------------- запуск
FROM node:22-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

RUN addgroup -g 1001 -S nodejs && adduser -S nextjs -u 1001

# standalone тягне лише те, що справді імпортується
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/public ./public

USER nextjs
EXPOSE 3000

CMD ["node", "server.js"]
