from fastapi import APIRouter
from app.services import weaviate_client

router = APIRouter()

@router.get("/collections")
def list_collections():
    """
    Example endpoint to list Weaviate collections.
    """
    return weaviate_client.list_collections()

@router.get("/connect")
def connect():
    """
    Example endpoint to test connection to Weaviate.
    """
    return {"connected": weaviate_client.test_connection()}