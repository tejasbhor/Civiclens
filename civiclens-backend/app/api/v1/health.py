"""
Production-ready health check endpoint for CivicLens.
Extends main.py with detailed service status for cloud infrastructure.
"""

from fastapi import APIRouter
from datetime import datetime
from app.core.database import check_database_connection, check_redis_connection
from app.config import settings

router = APIRouter(tags=["Health"])


@router.get("/health")
async def health_check():
    """
    Basic health check — used by load balancers and Docker healthcheck.
    Always returns 200 if the process is alive.
    """
    return {
        "status": "healthy",
        "version": settings.APP_VERSION,
        "timestamp": datetime.utcnow().isoformat() + "Z",
    }


@router.get("/health/detailed")
async def detailed_health_check():
    """
    Detailed health check including downstream service status.
    Use this for monitoring dashboards, not load balancers.
    """
    db_ok = await check_database_connection()
    redis_ok = await check_redis_connection()

    # Check MinIO
    minio_ok = False
    try:
        from minio import Minio
        client = Minio(
            settings.MINIO_ENDPOINT,
            access_key=settings.MINIO_ACCESS_KEY,
            secret_key=settings.MINIO_SECRET_KEY,
            secure=settings.MINIO_USE_SSL,
        )
        minio_ok = client.bucket_exists(settings.MINIO_BUCKET)
    except Exception:
        pass

    all_healthy = db_ok and redis_ok and minio_ok
    http_status = 200 if all_healthy else 503

    from fastapi.responses import JSONResponse
    return JSONResponse(
        status_code=http_status,
        content={
            "status": "healthy" if all_healthy else "degraded",
            "version": settings.APP_VERSION,
            "environment": settings.ENVIRONMENT,
            "timestamp": datetime.utcnow().isoformat() + "Z",
            "services": {
                "database": {
                    "status": "ok" if db_ok else "error",
                    "type": "postgresql+postgis",
                },
                "cache": {
                    "status": "ok" if redis_ok else "error",
                    "type": "redis",
                },
                "storage": {
                    "status": "ok" if minio_ok else "error",
                    "type": "minio",
                    "bucket": settings.MINIO_BUCKET,
                },
            },
        },
    )


@router.get("/health/ready")
async def readiness_check():
    """
    Kubernetes readiness probe — returns 503 until all services are ready.
    """
    db_ok = await check_database_connection()
    redis_ok = await check_redis_connection()

    from fastapi.responses import JSONResponse
    if db_ok and redis_ok:
        return JSONResponse(status_code=200, content={"ready": True})
    return JSONResponse(
        status_code=503,
        content={
            "ready": False,
            "database": db_ok,
            "redis": redis_ok,
        }
    )


@router.get("/health/live")
async def liveness_check():
    """
    Kubernetes liveness probe — basic aliveness check.
    """
    return {"alive": True}
