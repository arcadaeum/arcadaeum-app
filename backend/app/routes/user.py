from fastapi import APIRouter

router = APIRouter()

@router.get("/users"):
	return {"users": ["Alice", "Bob", "Charlie"]}
