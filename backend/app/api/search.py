from fastapi import APIRouter, HTTPException
from typing import Optional, List, Dict, Any
from pydantic import BaseModel
from app.services import weaviate_client as wc

router = APIRouter(tags=["search"])

class NearVectorBody(BaseModel):
    vector: List[float]
    collection: Optional[str] = None
    limit: int = 10

class NearObjectBody(BaseModel):
    collection: str
    id: str
    limit: int = 10

@router.get("/search/text")
def search_text(q: str, collection: Optional[str] = None, limit: int = 10, fields: Optional[str] = None):
    return wc.search_text(q=q, collection=collection, limit=limit, fields=fields)

@router.post("/search/near-vector")
def search_near_vector(body: NearVectorBody):
    return wc.near_vector(vector=body.vector, collection=body.collection, limit=body.limit)

@router.post("/search/near-object")
def search_near_object(body: NearObjectBody):
    res = wc.near_object(collection=body.collection, id=body.id, limit=body.limit)
    if res is None:
        raise HTTPException(status_code=404, detail="anchor object not found")
    return res
