from fastapi import APIRouter

from app.services.weaviate_client import weaviate_client as wc

router = APIRouter(tags=["meta"])

@router.get("/meta")
def meta():
    meta_data = wc.get_meta()
    if "hostname" in meta_data and "[::]:" in str(meta_data["hostname"]):
        meta_data["hostname"] = meta_data["hostname"].replace("[::]:", "localhost:")
    return meta_data

@router.get("/ping")
def ping():
    return {"weaviate": wc.ping()}
