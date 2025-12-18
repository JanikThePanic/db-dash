from fastapi import APIRouter, HTTPException
from app.services.WeaviateClient import weaviate_client as wc

import app.services.projectionHelper as ph

router = APIRouter(tags=["projection"])

@router.post("/projection")
def project(body: ph.ProjectionBody):
    """ Project vectors from a specific collection into lower dimensions for visualization. """
    projection = ph.project_vectors(body)
    if projection is None:
        raise HTTPException(status_code=404, detail="Collection not found or insufficient vectors for projection.")
    return projection
