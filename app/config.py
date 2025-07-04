import os
from dotenv import load_dotenv
from pymongo import MongoClient

# Load environment variables
load_dotenv()

# FastAPI Configuration
APP_TITLE = "Loki - Tools & Utilities"
APP_DESCRIPTION = (
    "A collection of useful tools including SQL formatter and document management"
)

# MongoDB Configuration
MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017")
DATABASE_NAME = "formatter_db"

# Admin Authentication
ADMIN_USERNAME = os.getenv("ADMIN_USERNAME", "admin")
ADMIN_PASSWORD = os.getenv("ADMIN_PASSWORD", "changeme123")
SESSION_COOKIE_NAME = "loki_admin_session"
SESSION_SECRET = os.getenv("SESSION_SECRET", "supersecret")

# Database Collections
HISTORY_COLLECTION = "formatting_history"
INFO_COLLECTION = "information_documents"


# Initialize MongoDB connection
def get_database():
    client = MongoClient(MONGO_URI)
    return client[DATABASE_NAME]


def get_collections():
    db = get_database()
    return {"history": db[HISTORY_COLLECTION], "info": db[INFO_COLLECTION]}
