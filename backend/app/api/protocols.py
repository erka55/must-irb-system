from fastapi import APIRouter

router = APIRouter()

@router.get("/")
def list_protocols():
    return []

@router.post("/")
def create_protocol():
    return {"message": "created"}