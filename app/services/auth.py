import secrets
from fastapi import HTTPException, Request, Response
from fastapi.responses import JSONResponse
from app.config import ADMIN_USERNAME, ADMIN_PASSWORD, SESSION_COOKIE_NAME

# Simple in-memory session store (for demo; use Redis or DB for production)
sessions = set()


def is_authenticated(request: Request) -> bool:
    """Check if user is authenticated"""
    session = request.cookies.get(SESSION_COOKIE_NAME)
    return session and session in sessions


def require_admin(request: Request):
    """Require admin authentication"""
    if not is_authenticated(request):
        raise HTTPException(status_code=401, detail="Not authenticated")


async def login_admin(request: Request, response: Response) -> JSONResponse:
    """Handle admin login"""
    data = await request.json()
    username = data.get("username")
    password = data.get("password")

    if username == ADMIN_USERNAME and password == ADMIN_PASSWORD:
        # Generate a session token
        session_token = secrets.token_urlsafe(32)
        sessions.add(session_token)

        response = JSONResponse({"message": "Login successful"})
        response.set_cookie(
            key=SESSION_COOKIE_NAME,
            value=session_token,
            httponly=True,
            max_age=60 * 60 * 8,  # 8 hours
            samesite="lax",
        )
        return response
    else:
        raise HTTPException(status_code=401, detail="Invalid credentials")


async def logout_admin(request: Request, response: Response) -> JSONResponse:
    """Handle admin logout"""
    session = request.cookies.get(SESSION_COOKIE_NAME)
    if session and session in sessions:
        sessions.remove(session)

    response = JSONResponse({"message": "Logged out"})
    response.delete_cookie(SESSION_COOKIE_NAME)
    return response
