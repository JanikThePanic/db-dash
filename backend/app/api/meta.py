from fastapi import APIRouter
from app.services import weaviate_client as wc

router = APIRouter(tags=["meta"])

@router.get("/meta")
def meta():
    return wc.get_meta()

@router.get("/ping")
def ping():
    return {"weaviate": wc.ping()}
