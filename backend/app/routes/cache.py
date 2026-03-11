from fastapi import APIRouter, Depends
from pydantic import BaseModel
from app.services.cache import cache_popular_games


# This can be expanded easily if we need.
class CacheQueryParams(BaseModel):
    limit: int = 500


router = APIRouter()


# A route to trigger caching popular games from IGDB to our DB
@router.post("/cache_popular_games")
async def cache_games_route(params: CacheQueryParams = Depends()):
    result = cache_popular_games(limit=params.limit)
    return result
