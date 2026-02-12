from starlette.middleware.base import BaseHTTPMiddleware, RequestResponseEndpoint
from starlette.requests import Request
from starlette.responses import Response
from app.config import settings

class SecurityHeadersMiddleware(BaseHTTPMiddleware):
    """
    Middleware to add security headers to all responses.
    Implements Priority 2/3 security headers (HSTS, X-Frame-Options, etc.)
    """
    async def dispatch(self, request: Request, call_next: RequestResponseEndpoint) -> Response:
        response = await call_next(request)

        # Add security headers
        response.headers["X-Content-Type-Options"] = "nosniff"
        response.headers["X-Frame-Options"] = "DENY"  # Prevent clickjacking
        response.headers["X-XSS-Protection"] = "1; mode=block"  # Browser XSS filtering
        response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"

        # Add HSTS if HTTPS_ONLY is enabled (Force HTTPS)
        if settings.HTTPS_ONLY:
            response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"

        return response
