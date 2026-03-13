# Dockerfile para el frontend Next.js
#
# Contexto de build: raíz del monorepo (context: .)
# Construcción en dos etapas: build → runner ligero con standalone output.
#
# NEXT_PUBLIC_API_URL se inyecta como ARG en tiempo de build porque Next.js
# lo incrusta en el bundle del navegador. El navegador llama al backend
# directamente (no pasa por el contenedor frontend), por eso usa localhost:8000.

# ── Etapa 1: construcción ───────────────────────────────────────────────────
FROM node:20-alpine AS builder

WORKDIR /app

ARG NEXT_PUBLIC_API_URL=http://localhost:8000
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL

COPY frontend/package.json frontend/package-lock.json* ./
RUN npm ci

COPY frontend/ .

RUN npm run build

# ── Etapa 2: ejecución ──────────────────────────────────────────────────────
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production

COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

EXPOSE 3000

CMD ["node", "server.js"]
