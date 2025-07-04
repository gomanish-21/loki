from fastapi import Request
from fastapi.responses import JSONResponse
from starlette.middleware.base import BaseHTTPMiddleware
from app.services.auth import is_authenticated


class AdminAuthMiddleware(BaseHTTPMiddleware):
    """Middleware to protect admin API endpoints"""

    async def dispatch(self, request: Request, call_next):
        # Protect all /api/documents* endpoints
        if request.url.path.startswith("/api/documents"):
            if not is_authenticated(request):
                return JSONResponse({"detail": "Not authenticated"}, status_code=401)

        return await call_next(request)
