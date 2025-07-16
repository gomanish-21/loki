from fastapi import APIRouter, Request
from fastapi.responses import HTMLResponse
from fastapi.templating import Jinja2Templates
from app.services.auth import is_authenticated

router = APIRouter()
templates = Jinja2Templates(directory="templates")


@router.get("/", response_class=HTMLResponse)
async def landing(request: Request):
    """Landing page"""
    return templates.TemplateResponse("landing.html", {"request": request})


@router.get("/sql-formatter", response_class=HTMLResponse)
async def sql_formatter(request: Request):
    """SQL formatter page"""
    return templates.TemplateResponse("index.html", {"request": request})


@router.get("/info", response_class=HTMLResponse)
async def info_page(request: Request):
    """Info page"""
    return templates.TemplateResponse("info.html", {"request": request})


@router.get("/admin", response_class=HTMLResponse)
async def admin_page(request: Request):
    """Admin page with authentication check"""
    if not is_authenticated(request):
        # Always serve the page, frontend will show login modal
        return templates.TemplateResponse(
            "admin.html", {"request": request, "show_login": True}
        )
    return templates.TemplateResponse(
        "admin.html", {"request": request, "show_login": False}
    )


@router.get("/sql-analyzer", response_class=HTMLResponse)
async def sql_analyzer(request: Request):
    """SQL analyzer page"""
    return templates.TemplateResponse("analyzer.html", {"request": request})
