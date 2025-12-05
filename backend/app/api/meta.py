from fastapi import APIRouter

from app.services.WeaviateClient import weaviate_client as wc

router = APIRouter(tags=["meta"])

@router.get("/meta")
def meta():
    meta_data = wc.get_meta()
    if not meta_data:
        return {}
    if meta_data and "hostname" in meta_data and "[::]:" in str(meta_data["hostname"]):
        meta_data["hostname"] = meta_data["hostname"].replace("[::]:", "localhost:")
    return meta_data

@router.get("/ping")
def ping():
    return {"weaviate": wc.ping()}
