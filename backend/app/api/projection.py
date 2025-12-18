from fastapi import APIRouter
from app.services.WeaviateClient import weaviate_client as wc

import app.services.projectionHelper as ph

router = APIRouter(tags=["projection"])

@router.post("/projection")
def project(body: ph.ProjectionBody):
    """ Project vectors from a specific collection into lower dimensions for visualization. """
    projection = ph.project_vectors(body)
    if projection is None:
        return {"error": "no vectors found for the specified collection."}, 404
    return projection
