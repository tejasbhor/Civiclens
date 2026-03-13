# ============================================================
# CivicLens Citizen Portal — Production Dockerfile
# Multi-stage build: Vite SPA served by nginx
# ============================================================

# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Accept build-time arguments — Vite bakes VITE_* at build time
ARG VITE_API_URL
ARG VITE_APP_NAME
ARG VITE_ORG_NAME
ARG VITE_ORG_SHORT_NAME
ARG VITE_SUPPORT_EMAIL
ARG VITE_REPORT_PREFIX
ARG VITE_CITY_CODE
ARG VITE_ENABLE_DEMO_OTP

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Build application (VITE_* vars are baked into the bundle here)
RUN npm run build

# Production stage — nginx for static serving
FROM nginx:alpine

# Copy built files to nginx
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port
EXPOSE 80

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
