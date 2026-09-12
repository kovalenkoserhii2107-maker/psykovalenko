# syntax=docker/dockerfile:1

# ---------------------------------------------------------------- залежності
FROM node:22-alpine AS deps
WORKDIR /app

# postinstall викликає prisma generate, тож схема потрібна вже тут
COPY package.json package-lock.json prisma.config.ts ./
COPY prisma ./prisma
RUN npm ci

# ------------------------------------------------------ Prisma CLI для міграцій
# Окреме дерево: release_command виконується у фінальному образі, а туди
# не потрапляє ні node_modules збірки, ні devDependencies. Вибирати
# залежності вручну не можна — @prisma/config тягне effect, і далі за ланцюгом.
FROM node:22-alpine AS migrator
WORKDIR /migrator
COPY package.json /tmp/app-package.json
RUN PRISMA_VERSION=$(node -p "require('/tmp/app-package.json').devDependencies.prisma") \
 && npm init -y > /dev/null \
 && npm i --no-audit --no-fund "prisma@$PRISMA_VERSION" \
 && rm /tmp/app-package.json

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

# Обов'язково перед складанням: клієнт Prisma генерується в lib/generated,
# а та тека не їде ні з deps (копіюємо лише node_modules), ні з репозиторію
# (вона в .gitignore). Без цього рядка збірка падає на
# «Can't resolve '@/lib/generated/prisma/client'».
RUN npx prisma generate
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

# для release_command: схема, конфіг і окреме дерево з Prisma CLI
COPY --from=builder --chown=nextjs:nodejs /app/prisma ./prisma
COPY --from=builder --chown=nextjs:nodejs /app/prisma.config.ts ./prisma.config.ts
COPY --from=migrator --chown=nextjs:nodejs /migrator/node_modules /migrator/node_modules

USER nextjs
EXPOSE 3000

CMD ["node", "server.js"]
