from fastapi import APIRouter, HTTPException, Query

import app.services.collectionsHelper as ch

router = APIRouter(tags=["collections & schema"])

@router.get("/collections")
def list_collections():
    """ List all collections in the Weaviate instance. """
    return {"collections": ch.list_collections()}

@router.get("/collections/{name}")
def get_collection(name: str):
    """ Get information about a specific collection by name. """
    coll = ch.collection_exists(name)
    if not coll:
        raise HTTPException(status_code=404, detail="collection not found")
    return {"collection": coll} 

@router.delete("/collections/{name}")
def delete_collection(name: str, confirm: str = Query(..., description="must match the collection name")):
    """ Delete a specific collection by name. Requires confirmation. """
    if confirm != name:
        raise HTTPException(status_code=400, detail="confirm must match collection name")
    ok = ch.delete_collection(name)
    if not ok:
        raise HTTPException(status_code=404, detail="collection not found or not deletable")
    return {"deleted": name}
