from typing import Any

from fastapi import APIRouter

from app.services.cache import get_game_news
from app.services.news import DEFAULT_GAME_NEWS_QUERY

router = APIRouter()


@router.get("/news/search")
def search_news_route(
    query: str = DEFAULT_GAME_NEWS_QUERY,
    language: str = "en",
    country: str = "us",
    limit: int = 10,
) -> list[dict[str, Any]]:
    """Endpoint to search for news articles based on keywords."""
    return get_game_news(
        query=query,
        language=language,
        country=country,
        limit=limit,
    )
