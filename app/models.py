from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime


# SQL Formatter Models
class FormatRequest(BaseModel):
    content: str
    format_type: str  # "sql"
    indent_size: Optional[int] = 2


class FormatResponse(BaseModel):
    formatted_content: str
    is_valid: bool
    error_message: Optional[str] = None
    history_id: Optional[str] = None


class HistoryItem(BaseModel):
    id: str
    content: str
    formatted_content: str
    format_type: str
    timestamp: datetime
    indent_size: int


# Information Documents Models
class InfoDocument(BaseModel):
    id: str
    title: str
    category: str
    content: str
    tags: List[str]
    created_at: datetime
    updated_at: datetime
    author: str
    is_published: bool


# Admin Models
class LoginRequest(BaseModel):
    username: str
    password: str


class LoginResponse(BaseModel):
    message: str


class LogoutResponse(BaseModel):
    message: str


# AI SQL Analyzer
class AnalyzeRequest(BaseModel):
    sql: str
