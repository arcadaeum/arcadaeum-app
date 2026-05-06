import psycopg
from fastapi import APIRouter, Depends, HTTPException, status

from app.database.queries.reviews import (
    add_review,
    delete_review,
    get_review_with_user,
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
    response_model=ReviewWithUser,
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

    review = get_review_with_user(review_id)
    if review is None:
        raise HTTPException(status_code=500, detail="Failed to retrieve review")

    return ReviewWithUser(**review)


@router.delete("/games/{game_id}/reviews", status_code=status.HTTP_204_NO_CONTENT)
def delete_game_review(
    game_id: int, current_user: User = Depends(get_current_user)
) -> None:
    """Delete the current user's review for a game."""
    deleted = delete_review(current_user.id, game_id)
    if not deleted:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Review not found"
        )
