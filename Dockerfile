# ---- Builder Stage ----
FROM node:20-alpine AS builder
WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# ---- Production Stage ----
FROM node:20-alpine AS production
WORKDIR /app

# netcat برای health check در entrypoint
RUN apk add --no-cache netcat-openbsd

COPY package*.json ./
RUN npm ci --omit=dev

COPY --from=builder /app/dist ./dist
COPY entrypoint.sh .
RUN chmod +x entrypoint.sh

COPY --from=builder /app/.env ./.env

EXPOSE 5000

ENTRYPOINT ["./entrypoint.sh"]

