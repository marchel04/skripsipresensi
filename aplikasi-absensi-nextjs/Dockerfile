# Stage 1: Build
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

# Copy .env file if it exists (needed for NEXT_PUBLIC_* vars during build)
# This will work both locally (where .env exists) and in CI/CD (where it might not)
COPY .env* ./

RUN npm run build

# Stage 2: Runner
FROM node:20-alpine AS runner

WORKDIR /app

# Import the production build
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules

# Copy .env for runtime (Next.js needs it for server-side rendering)
COPY --from=builder /app/.env* ./

# Expose frontend port
EXPOSE 3000

# Start Next.js
CMD ["npm", "run", "start"]
