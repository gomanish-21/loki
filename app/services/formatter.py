import sqlparse
from datetime import datetime
from bson import ObjectId
from app.config import get_collections
from app.models import FormatRequest, FormatResponse, HistoryItem


def format_sql(content: str, indent_size: int = 2) -> str:
    """Format SQL content"""
    try:
        return sqlparse.format(
            content,
            reindent=True,
            keyword_case="upper",
            indent_width=indent_size,
            use_space_around_operators=True,
        )
    except Exception as e:
        raise ValueError(f"SQL formatting error: {str(e)}")


def cleanup_history():
    """Keep only the last 5 history items"""
    try:
        collections = get_collections()
        history_collection = collections["history"]

        # Get all history items sorted by timestamp (newest first)
        all_items = list(history_collection.find().sort("timestamp", -1))

        # If we have more than 5 items, delete the older ones
        if len(all_items) > 5:
            # Get the IDs of items to delete (all except the first 5)
            items_to_delete = all_items[5:]
            delete_ids = [item["_id"] for item in items_to_delete]

            # Delete the older items
            if delete_ids:
                history_collection.delete_many({"_id": {"$in": delete_ids}})
    except Exception as e:
        print(f"Error cleaning up history: {e}")


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

            # Cleanup: keep only the last 5 items
            cleanup_history()

        return FormatResponse(
            formatted_content=formatted_content,
            is_valid=is_valid,
            error_message=error_message,
            history_id=history_id,
        )

    except Exception as e:
        raise ValueError(str(e))


async def get_history() -> list[HistoryItem]:
    """Get formatting history"""
    try:
        collections = get_collections()
        history_collection = collections["history"]

        # Always return only the last 5 items
        history = list(history_collection.find().sort("timestamp", -1).limit(5))

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
