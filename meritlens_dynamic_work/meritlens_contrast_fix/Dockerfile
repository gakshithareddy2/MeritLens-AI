# MeritLens AI — Production Dockerfile
FROM node:20-slim AS builder

WORKDIR /app

# Copy dependency manifests
COPY package*.json ./
RUN npm ci

# Copy source code and build frontend
COPY . .
RUN npm run build

# Remove development files if desired or run with lightweight runner
FROM node:20-slim AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000

# Copy node modules and built assets
COPY --from=builder /app /app

EXPOSE 3000

CMD ["npm", "start"]
