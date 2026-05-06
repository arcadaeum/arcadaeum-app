from fastapi import APIRouter
from app.services.news import NewsApiService
from typing import Any


router = APIRouter()
	
@router.get("/news/search")
def search_news_route(
	query: str = "gaming", language: str = "en", limit: int = 10
) -> list[dict[str, Any]]:
	
	"""Endpoint to search for news articles based on keywords."""
	news_service = NewsApiService()

	return news_service.search_news(query=query, language=language, limit=limit)