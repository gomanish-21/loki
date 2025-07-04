from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from app.config import APP_TITLE, APP_DESCRIPTION
from app.routes import pages, api
from app.middleware.auth import AdminAuthMiddleware
from app.utils.init_db import initialize_sample_info

# Create FastAPI app
app = FastAPI(
    title=APP_TITLE,
    description=APP_DESCRIPTION,
)

# Mount static files
app.mount("/static", StaticFiles(directory="static"), name="static")

# Add middleware
app.add_middleware(AdminAuthMiddleware)

# Include routers
app.include_router(pages.router, tags=["pages"])
app.include_router(api.router, prefix="/api", tags=["api"])


# Initialize sample data on startup
@app.on_event("startup")
async def startup_event():
    initialize_sample_info()


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=8000)
