from datetime import datetime
from typing import List, Optional
from bson import ObjectId
from app.config import get_collections
from app.models import InfoDocument


async def get_info_documents(
    category: Optional[str] = None, limit: int = 50
) -> List[InfoDocument]:
    """Get information documents with optional category filter"""
    try:
        collections = get_collections()
        info_collection = collections["info"]

        query = {"is_published": True}
        if category:
            query["category"] = category

        documents = list(
            info_collection.find(query).sort("updated_at", -1).limit(limit)
        )

        return [
            InfoDocument(
                id=str(doc["_id"]),
                title=doc["title"],
                category=doc["category"],
                content=doc["content"],
                tags=doc["tags"],
                created_at=doc["created_at"],
                updated_at=doc["updated_at"],
                author=doc["author"],
                is_published=doc["is_published"],
            )
            for doc in documents
        ]
    except Exception as e:
        raise ValueError(str(e))


async def get_info_document(doc_id: str) -> InfoDocument:
    """Get a specific information document"""
    try:
        collections = get_collections()
        info_collection = collections["info"]

        document = info_collection.find_one(
            {"_id": ObjectId(doc_id), "is_published": True}
        )
        if not document:
            raise ValueError("Document not found")

        return InfoDocument(
            id=str(document["_id"]),
            title=document["title"],
            category=document["category"],
            content=document["content"],
            tags=document["tags"],
            created_at=document["created_at"],
            updated_at=document["updated_at"],
            author=document["author"],
            is_published=document["is_published"],
        )
    except Exception as e:
        raise ValueError(str(e))


async def get_info_categories() -> dict:
    """Get all available categories"""
    try:
        collections = get_collections()
        info_collection = collections["info"]

        categories = info_collection.distinct("category", {"is_published": True})
        return {"categories": categories}
    except Exception as e:
        raise ValueError(str(e))


# Admin document management functions
async def get_all_documents() -> List[dict]:
    """Get all documents (admin only)"""
    try:
        collections = get_collections()
        info_collection = collections["info"]

        documents = list(info_collection.find().sort("updated_at", -1))
        return [
            {
                "_id": str(doc["_id"]),
                "title": doc["title"],
                "category": doc["category"],
                "content": doc["content"],
                "tags": doc["tags"],
                "created_at": doc["created_at"],
                "updated_at": doc["updated_at"],
                "author": doc["author"],
                "is_published": doc["is_published"],
            }
            for doc in documents
        ]
    except Exception as e:
        raise ValueError(str(e))


async def get_document(doc_id: str) -> dict:
    """Get a specific document (admin only)"""
    try:
        collections = get_collections()
        info_collection = collections["info"]

        document = info_collection.find_one({"_id": ObjectId(doc_id)})
        if not document:
            raise ValueError("Document not found")

        return {
            "_id": str(document["_id"]),
            "title": document["title"],
            "category": document["category"],
            "content": document["content"],
            "tags": document["tags"],
            "created_at": document["created_at"],
            "updated_at": document["updated_at"],
            "author": document["author"],
            "is_published": document["is_published"],
        }
    except Exception as e:
        raise ValueError(str(e))


async def create_document(data: dict) -> dict:
    """Create a new document"""
    try:
        collections = get_collections()
        info_collection = collections["info"]

        document = {
            "title": data["title"],
            "category": data["category"],
            "content": data["content"],
            "tags": data.get("tags", []),
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow(),
            "author": data["author"],
            "is_published": data.get("is_published", False),
        }

        result = info_collection.insert_one(document)
        document["_id"] = str(result.inserted_id)

        return document
    except Exception as e:
        raise ValueError(str(e))


async def update_document(doc_id: str, data: dict) -> dict:
    """Update an existing document"""
    try:
        collections = get_collections()
        info_collection = collections["info"]

        update_data = {
            "title": data["title"],
            "category": data["category"],
            "content": data["content"],
            "tags": data.get("tags", []),
            "updated_at": datetime.utcnow(),
            "author": data["author"],
            "is_published": data.get("is_published", False),
        }

        result = info_collection.update_one(
            {"_id": ObjectId(doc_id)}, {"$set": update_data}
        )

        if result.matched_count == 0:
            raise ValueError("Document not found")

        return {"message": "Document updated successfully"}
    except Exception as e:
        raise ValueError(str(e))


async def delete_document(doc_id: str) -> dict:
    """Delete a document"""
    try:
        collections = get_collections()
        info_collection = collections["info"]

        result = info_collection.delete_one({"_id": ObjectId(doc_id)})
        if result.deleted_count == 0:
            raise ValueError("Document not found")

        return {"message": "Document deleted successfully"}
    except Exception as e:
        raise ValueError(str(e))


async def get_document_categories() -> List[str]:
    """Get all available categories (admin)"""
    try:
        collections = get_collections()
        info_collection = collections["info"]

        categories = info_collection.distinct("category")
        return categories
    except Exception as e:
        raise ValueError(str(e))
