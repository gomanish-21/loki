from fastapi import APIRouter, Request, HTTPException
from fastapi.responses import JSONResponse
from typing import List, Optional
from app.models import (
    FormatRequest,
    FormatResponse,
    HistoryItem,
    InfoDocument,
    LoginRequest,
    LoginResponse,
    LogoutResponse,
    AnalyzeRequest,
)
from app.services.formatter import (
    format_content,
    get_history,
    delete_history_item,
    clear_history,
)
from app.services.documents import (
    get_info_documents,
    get_info_document,
    get_info_categories,
    get_all_documents,
    get_document,
    create_document,
    update_document,
    delete_document,
    get_document_categories,
)
from app.services.auth import login_admin, logout_admin

router = APIRouter()


# SQL Formatter API
@router.post("/format", response_model=FormatResponse)
async def format_content_endpoint(request: FormatRequest):
    """Format SQL content"""
    try:
        return await format_content(request)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/history", response_model=List[HistoryItem])
async def get_history_endpoint():
    """Get formatting history"""
    try:
        return await get_history()
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.delete("/history/{history_id}")
async def delete_history_item_endpoint(history_id: str):
    """Delete a history item"""
    try:
        return await delete_history_item(history_id)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.delete("/history")
async def clear_history_endpoint():
    """Clear all history"""
    try:
        return await clear_history()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# Information Documents API
@router.get("/info/documents", response_model=List[InfoDocument])
async def get_info_documents_endpoint(category: Optional[str] = None, limit: int = 50):
    """Get information documents with optional category filter"""
    try:
        return await get_info_documents(category, limit)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/info/documents/{doc_id}", response_model=InfoDocument)
async def get_info_document_endpoint(doc_id: str):
    """Get a specific information document"""
    try:
        return await get_info_document(doc_id)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/info/categories")
async def get_info_categories_endpoint():
    """Get all available categories"""
    try:
        return await get_info_categories()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# Admin API
@router.post("/admin/login", response_model=LoginResponse)
async def admin_login_endpoint(request: Request):
    """Admin login"""
    try:
        return await login_admin(request, JSONResponse({}))
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/admin/logout", response_model=LogoutResponse)
async def admin_logout_endpoint(request: Request):
    """Admin logout"""
    try:
        return await logout_admin(request, JSONResponse({}))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# Admin Document Management API
@router.get("/documents")
async def get_all_documents_endpoint():
    """Get all documents (admin only)"""
    try:
        return await get_all_documents()
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/documents/categories")
async def get_document_categories_endpoint():
    """Get all available categories (admin)"""
    try:
        return await get_document_categories()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/documents/{doc_id}")
async def get_document_endpoint(doc_id: str):
    """Get a specific document (admin only)"""
    try:
        return await get_document(doc_id)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/documents")
async def create_document_endpoint(request: Request):
    """Create a new document"""
    try:
        data = await request.json()
        return await create_document(data)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.put("/documents/{doc_id}")
async def update_document_endpoint(doc_id: str, request: Request):
    """Update an existing document"""
    try:
        data = await request.json()
        return await update_document(doc_id, data)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


from app.services.gemini import analyze_sql_performance


@router.delete("/documents/{doc_id}")
async def delete_document_endpoint(doc_id: str):
    """Delete a document"""
    try:
        return await delete_document(doc_id)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/analyze-sql")
async def analyze_sql(item: AnalyzeRequest):
    """Analyzes SQL performance using Gemini"""
    try:
        analysis = await analyze_sql_performance(item.sql)
        return {"analysis": analysis}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
