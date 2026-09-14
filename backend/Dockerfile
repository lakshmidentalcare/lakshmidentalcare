# --- BUILD STAGE ---
FROM node:18-slim AS builder

# Install OpenSSL (required by Prisma)
RUN apt-get update -y && apt-get install -y openssl

WORKDIR /app

# Copy dependency configs
COPY package*.json ./
COPY prisma ./prisma/

# Install all packages (including devDependencies for build)
RUN npm ci

# Copy sources
COPY . .

# Generate Prisma client and build NestJS
RUN node node_modules/prisma/build/index.js generate
RUN npm run build

# --- RUN STAGE ---
FROM node:18-slim

# Install OpenSSL for production runtime
RUN apt-get update -y && apt-get install -y openssl

WORKDIR /app

# Copy built app and production dependencies
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma

# Railway / Render inject PORT at runtime

# Start production build
CMD ["node", "dist/main.js"]
