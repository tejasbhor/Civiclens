# ============================================================
# CivicLens Backend — Production Dockerfile
# Multi-stage build for minimal image size
# Compatible with: linux/amd64, linux/arm64
# Uses UV for fast, reproducible dependency installation
# ============================================================

# ---- Stage 1: Build dependencies ----
FROM python:3.11-slim-bookworm AS builder

WORKDIR /app

# System dependencies for psycopg2, Pillow, python-magic
RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc \
    libpq-dev \
    libmagic1 \
    libglib2.0-0 \
    && rm -rf /var/lib/apt/lists/*

# Install UV for fast dependency resolution
RUN pip install --no-cache-dir uv

# Copy dependency files
COPY pyproject.toml uv.lock ./

# Install dependencies using UV (reproducible with lockfile)
# We set UV_PROJECT_ENVIRONMENT to install into the system path
ENV UV_PROJECT_ENVIRONMENT=/usr/local
RUN uv sync --no-dev --frozen --extra-index-url https://download.pytorch.org/whl/cu121


# ---- Stage 2: Runtime image ----
FROM python:3.11-slim-bookworm AS runtime

WORKDIR /app

# Runtime system dependencies only
RUN apt-get update && apt-get install -y --no-install-recommends \
    libpq5 \
    libmagic1 \
    libglib2.0-0 \
    libgl1-mesa-glx \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Set Python environment variables
ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    PYTHONPATH=/app

# Create non-root user for security
RUN useradd -m -u 1000 -s /bin/bash civiclens && \
    mkdir -p /app/logs /app/media /app/models/cache && \
    chown -R civiclens:civiclens /app
USER civiclens

# Copy virtual environment from builder
COPY --from=builder --chown=civiclens /usr/local/lib/python3.11/site-packages /usr/local/lib/python3.11/site-packages
COPY --from=builder --chown=civiclens /usr/local/bin /usr/local/bin

# Copy application code
COPY --chown=civiclens . .

# Expose API port
EXPOSE 8000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=3 \
    CMD curl -sf http://localhost:8000/health || exit 1

# Production server: uvicorn with uvloop + httptools
# Workers set to 2 for OCI ARM 2-OCPU instance
CMD ["uvicorn", "app.main:app", \
    "--host", "0.0.0.0", \
    "--port", "8000", \
    "--workers", "2", \
    "--loop", "uvloop", \
    "--http", "httptools", \
    "--log-level", "info", \
    "--access-log", \
    "--proxy-headers", \
    "--forwarded-allow-ips", "*"]
