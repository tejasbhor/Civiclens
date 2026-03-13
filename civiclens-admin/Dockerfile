# ============================================================
# CivicLens Admin Dashboard — Production Dockerfile
# Multi-stage build: Next.js standalone output
# ============================================================

# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Accept build-time arguments — Next.js bakes NEXT_PUBLIC_* at build time
ARG NEXT_PUBLIC_API_URL
ARG NEXT_PUBLIC_APP_NAME
ARG NEXT_PUBLIC_ORG_NAME
ARG NEXT_PUBLIC_ORG_SHORT_NAME
ARG NEXT_PUBLIC_SUPPORT_EMAIL
ARG NEXT_PUBLIC_REPORT_PREFIX
ARG NEXT_PUBLIC_CITY_CODE
ARG NEXT_PUBLIC_ENABLE_DEMO_OTP

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Build application (NEXT_PUBLIC_* vars are baked into the bundle here)
RUN npm run build

# Production stage — minimal runtime
FROM node:20-alpine AS runner

WORKDIR /app

# Set environment to production
ENV NODE_ENV=production

# Create non-root user
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Copy necessary files from builder
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

# Expose port
EXPOSE 3000

# Set hostname for Docker networking
ENV HOSTNAME=0.0.0.0

# Health check to ensure Dashboard is responsive
HEALTHCHECK --interval=30s --timeout=5s --start-period=30s --retries=3 \
    CMD curl -f http://localhost:3000/api/health || exit 1

# Start the application
CMD ["node", "server.js"]
