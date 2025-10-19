from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# API endpoints
from app.api.collections import router as collections_router
from app.api.objects import router as objects_router
from app.api.search import router as search_router
from app.api.projection import router as projection_router
from app.api.meta import router as meta_router

app = FastAPI(title="db-dash backend")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/health", tags=["server"])
def health():
    """ Health check endpoint. Returns status ok if the server is running. """
    return {"status": "ok"}

# Mount API under /api
app.include_router(collections_router, prefix="/api")
app.include_router(objects_router, prefix="/api")
app.include_router(search_router, prefix="/api")
app.include_router(projection_router, prefix="/api")
app.include_router(meta_router, prefix="/api")
