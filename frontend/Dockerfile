# Dockerfile para el frontend Next.js
#
# Contexto de build: raíz del monorepo (context: .)
# Construcción en dos etapas: build → runner ligero con standalone output.
#
# NEXT_PUBLIC_API_URL: URL del backend vista desde el navegador.
#   - En Docker: "/api" — el navegador llama a /api/* y Next.js lo proxea internamente.
#   - En local sin Docker: "http://localhost:8000" — llamada directa al backend.
#
# BACKEND_URL: URL interna del backend dentro de la red Docker.
#   Solo la usa el servidor de Next.js para reenviar las llamadas de /api/*.
#   Nunca llega al navegador.

# ── Etapa 1: construcción ───────────────────────────────────────────────────
FROM node:20-alpine AS builder

WORKDIR /app

ARG NEXT_PUBLIC_API_URL=/api
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL

ARG BACKEND_URL=http://localhost:8000
ENV BACKEND_URL=$BACKEND_URL

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
