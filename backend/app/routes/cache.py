from fastapi import APIRouter, Depends

from app.models.games import CacheQueryParams
from app.services.cache import cache_game_news, cache_popular_games
from app.services.news import DEFAULT_GAME_NEWS_QUERY

router = APIRouter()


# A route to trigger caching popular games from IGDB to our DB
@router.post("/cache_popular_games")
async def cache_games_route(params: CacheQueryParams = Depends()):
    result = cache_popular_games(limit=params.limit)
    return result


@router.post("/cache_game_news")
async def cache_game_news_route(
    query: str = DEFAULT_GAME_NEWS_QUERY,
    language: str = "en",
    country: str = "us",
    limit: int = 10,
):
    result = cache_game_news(
        query=query,
        language=language,
        country=country,
        limit=limit,
    )
    return result
