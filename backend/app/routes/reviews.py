import psycopg
from fastapi import APIRouter, Depends, HTTPException, status

from app.database.queries.reviews import (
    add_review,
    get_review_by_id,
    get_reviews_for_game,
)
from app.models import Review, ReviewCreateRequest, ReviewWithUser, User
from app.services.auth import get_current_user

router = APIRouter()


@router.get("/games/{game_id}/reviews", response_model=list[ReviewWithUser])
def list_game_reviews(game_id: int) -> list[ReviewWithUser]:
    """Get all reviews for a game."""
    reviews = get_reviews_for_game(game_id)
    return [ReviewWithUser(**review) for review in reviews]


@router.post(
    "/games/{game_id}/reviews",
    response_model=Review,
    status_code=status.HTTP_201_CREATED,
)
def create_game_review(
    game_id: int,
    request: ReviewCreateRequest,
    current_user: User = Depends(get_current_user),
) -> Review:
    """Create a review for a game by the current user."""
    try:
        review_id = add_review(
            current_user.id, game_id, request.rating, request.review_text
        )
    except psycopg.errors.UniqueViolation:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Review already exists for this game",
        )
    except psycopg.errors.ForeignKeyViolation:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Game not found"
        )

    review = get_review_by_id(review_id)
    if review is None:
        raise HTTPException(status_code=500, detail="Failed to retrieve review")

    return Review(**review)
