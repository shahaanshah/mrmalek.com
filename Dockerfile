# Multi-stage Dockerfile for TanStack Start / Nitro on Node 22
FROM node:22-bookworm-slim AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

FROM node:22-bookworm-slim AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000
ENV HOST=0.0.0.0

COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/.output ./.output
COPY --from=builder /app/public ./public

# Ensure directory structure for SQLite db and media uploads exists
RUN mkdir -p /app/.data /app/public/uploads

EXPOSE 3000

CMD ["node", ".output/server/index.mjs"]
