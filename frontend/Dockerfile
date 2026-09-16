# --- BUILD STAGE ---
FROM node:18-alpine AS builder

WORKDIR /app

# Copy dependency configs
COPY package*.json ./

# Install packages
RUN npm ci

# Copy sources
COPY . .

# Build Next.js project
RUN npm run build

# --- RUN STAGE ---
FROM node:18-alpine

WORKDIR /app

# Copy built package assets
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/node_modules ./node_modules

EXPOSE 3000

ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

# Start Next.js server
CMD ["npm", "start"]
