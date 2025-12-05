from fastapi import APIRouter, HTTPException, Query
from typing import Optional
from app.services.WeaviateClient import weaviate_client as wc

router = APIRouter(tags=["objects"])

@router.get("/collections/{name}/objects")
def list_objects(
    name: str,
    limit: int = 50,
    cursor: Optional[str] = None,
    where: Optional[str] = None,
    fields: Optional[str] = None,
    include_vector: bool = False,
):
    """ List objects in a specific collection with optional filtering and pagination. """
    return wc.list_objects(name, limit=limit, cursor=cursor, where=where, fields=fields, include_vector=include_vector)

@router.get("/collections/{name}/objects/{id}")
def get_object(name: str, id: str, include_vector: bool = False):
    """ Get a specific object by ID from a collection. """
    obj = wc.get_object(name, id, include_vector=include_vector)
    if not obj:
        raise HTTPException(status_code=404, detail="object not found")
    return obj

@router.get("/collections/{name}/objects/{id}/vector")
def get_vector(name: str, id: str):
    """ Get the vector of a specific object by ID from a collection. """
    vec = wc.get_vector(name, id)
    if vec is None:
        raise HTTPException(status_code=404, detail="vector not found")
    return {"id": id, "vector": vec}

@router.delete("/collections/{name}/objects/{id}")
def delete_object(
    name: str,
    id: str,
    hard: bool = Query(False, description="require true to actually delete"),
    dry_run: bool = False,
):
    """ Delete a specific object by ID from a collection. Supports dry run and hard delete confirmation. """
    if dry_run:
        return {"dry_run": True, "would_delete": {"collection": name, "id": id}}
    if not hard:
        raise HTTPException(status_code=400, detail="set hard=true to confirm deletion")
    ok = wc.delete_object(name, id)
    if not ok:
        raise HTTPException(status_code=404, detail="object not found")
    return {"deleted": {"collection": name, "id": id}}
