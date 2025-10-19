from fastapi import APIRouter, HTTPException, Query
from app.services import weaviate_client as wc

router = APIRouter(tags=["collections & schema"])

@router.get("/collections")
def list_collections():
    return {"collections": wc.list_collections()}

@router.get("/collections/{name}")
def get_collection(name: str):

    info = wc.get_collection(name)
    if not info:
        raise HTTPException(status_code=404, detail="collection not found")
    return info

@router.get("/schema")
def get_schema():
    return wc.get_schema()

@router.delete("/collections/{name}")
def delete_collection(name: str, confirm: str = Query(..., description="must match the collection name")):
    if confirm != name:
        raise HTTPException(status_code=400, detail="confirm must match collection name")
    ok = wc.delete_collection(name)
    if not ok:
        raise HTTPException(status_code=404, detail="collection not found or not deletable")
    return {"deleted": name}
