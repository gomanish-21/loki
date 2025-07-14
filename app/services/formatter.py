from sql_formatter.core import format_sql as format_sql_lib
from datetime import datetime, timedelta
from bson import ObjectId
from app.config import get_collections
from app.models import FormatRequest, FormatResponse, HistoryItem


def format_sql(content: str, indent_size: int = 2) -> str:
    """Format SQL content"""
    try:
        return format_sql_lib(content)
    except Exception as e:
        raise ValueError(f"SQL formatting error: {str(e)}")


async def format_content(request: FormatRequest) -> FormatResponse:
    """Format content and save to history"""
    try:
        formatted_content = ""
        is_valid = True
        error_message = None

        if request.format_type == "sql":
            try:
                formatted_content = format_sql(request.content, request.indent_size)
            except ValueError as e:
                is_valid = False
                error_message = str(e)
                formatted_content = request.content
        else:
            is_valid = False
            error_message = "Only SQL formatting is supported"
            formatted_content = request.content

        # Save to history if formatting was successful
        history_id = None
        if is_valid:
            collections = get_collections()
            history_collection = collections["history"]

            history_doc = {
                "content": request.content,
                "formatted_content": formatted_content,
                "format_type": request.format_type,
                "timestamp": datetime.utcnow(),
                "indent_size": request.indent_size,
            }
            result = history_collection.insert_one(history_doc)
            history_id = str(result.inserted_id)

        return FormatResponse(
            formatted_content=formatted_content,
            is_valid=is_valid,
            error_message=error_message,
            history_id=history_id,
        )

    except Exception as e:
        raise ValueError(str(e))


async def get_history() -> list[HistoryItem]:
    """Get formatting history for the last 7 days"""
    try:
        collections = get_collections()
        history_collection = collections["history"]

        # Calculate the date 7 days ago
        seven_days_ago = datetime.utcnow() - timedelta(days=7)

        # Get history from the last 7 days
        history = list(
            history_collection.find({"timestamp": {"$gte": seven_days_ago}}).sort(
                "timestamp", -1
            )
        )

        return [
            HistoryItem(
                id=str(item["_id"]),
                content=item["content"],
                formatted_content=item["formatted_content"],
                format_type=item["format_type"],
                timestamp=item["timestamp"],
                indent_size=item["indent_size"],
            )
            for item in history
        ]
    except Exception as e:
        raise ValueError(str(e))


async def delete_history_item(history_id: str) -> dict:
    """Delete a history item"""
    try:
        collections = get_collections()
        history_collection = collections["history"]

        result = history_collection.delete_one({"_id": ObjectId(history_id)})
        if result.deleted_count == 0:
            raise ValueError("History item not found")

        return {"message": "History item deleted successfully"}
    except Exception as e:
        raise ValueError(str(e))


async def clear_history() -> dict:
    """Clear all history"""
    try:
        collections = get_collections()
        history_collection = collections["history"]

        history_collection.delete_many({})
        return {"message": "All history cleared successfully"}
    except Exception as e:
        raise ValueError(str(e))
