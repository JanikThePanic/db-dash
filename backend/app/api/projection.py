from fastapi import APIRouter
from typing import List, Optional
from pydantic import BaseModel
from app.services.WeaviateClient import weaviate_client as wc

router = APIRouter(tags=["projection"])

class ProjectionBody(BaseModel):
    collection: str
    limit: int = 500
    dims: int = 3
    includeProps: Optional[List[str]] = None

@router.post("/projection")
def project(body: ProjectionBody):
    """ Project vectors from a specific collection into lower dimensions for visualization. """
    return wc.project_vectors(collection=body.collection, limit=body.limit, dims=body.dims, include_props=body.includeProps)
