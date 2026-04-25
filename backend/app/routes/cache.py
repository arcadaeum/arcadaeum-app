from fastapi import APIRouter, Depends

from app.models import CacheQueryParams
from app.services.cache import cache_popular_games

router = APIRouter()


# A route to trigger caching popular games from IGDB to our DB
@router.post("/cache_popular_games")
async def cache_games_route(params: CacheQueryParams = Depends()):
    result = cache_popular_games(limit=params.limit)
    return result
