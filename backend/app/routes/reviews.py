import psycopg
from fastapi import APIRouter, Depends, HTTPException, status

from app.database.queries.reviews import (
    add_review,
    delete_review,
    delete_review_by_id,
    get_reviews_for_user,
    get_review_with_user,
    get_user_review_by_id,
    get_reviews_for_game,
    get_arcadaeum_review,
    update_review,
)
from app.database.queries.users import get_user_by_id
from app.models import (
    Review,
    ReviewCreateRequest,
    ReviewUpdateRequest,
    ReviewWithGame,
    ReviewWithUser,
    User,
    ArcadaeumReview,
)
from app.services.auth import get_current_user

router = APIRouter()


@router.get("/users/me/reviews", response_model=list[ReviewWithGame])
def list_current_user_reviews(
    current_user: User = Depends(get_current_user),
) -> list[ReviewWithGame]:
    """Get all reviews by the current user."""
    reviews = get_reviews_for_user(current_user.id)
    return [ReviewWithGame(**review) for review in reviews]


@router.get("/users/{user_id}/reviews", response_model=list[ReviewWithGame])
def list_user_reviews(user_id: int) -> list[ReviewWithGame]:
    """Get all reviews by a user."""
    if get_user_by_id(user_id) is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

    reviews = get_reviews_for_user(user_id)
    return [ReviewWithGame(**review) for review in reviews]


@router.patch("/users/me/reviews/{review_id}", response_model=ReviewWithGame)
def update_current_user_review(
    review_id: int,
    request: ReviewUpdateRequest,
    current_user: User = Depends(get_current_user),
) -> ReviewWithGame:
    """Update one of the current user's reviews."""
    updated = update_review(
        current_user.id, review_id, request.rating, request.review_text
    )
    if not updated:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Review not found")

    review = get_user_review_by_id(current_user.id, review_id)
    if review is None:
        raise HTTPException(status_code=500, detail="Failed to retrieve review")
    return ReviewWithGame(**review)


@router.delete("/users/me/reviews/{review_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_current_user_review(
    review_id: int,
    current_user: User = Depends(get_current_user),
) -> None:
    """Delete one of the current user's reviews."""
    deleted = delete_review_by_id(current_user.id, review_id)
    if not deleted:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Review not found")


@router.get("/games/{game_id}/reviews", response_model=list[ReviewWithUser])
def list_game_reviews(game_id: int) -> list[ReviewWithUser]:
    """Get all reviews for a game."""
    reviews = get_reviews_for_game(game_id)
    return [ReviewWithUser(**review) for review in reviews]


@router.get("/games/{game_id}/arcadaeum-review", response_model=ArcadaeumReview)
def get_game_arcadaeum_review(game_id: int) -> ArcadaeumReview:
    """Get the aggregated Arcadaeum review for a game (average rating and review count)."""
    arcadaeum_review = get_arcadaeum_review(game_id)
    if arcadaeum_review is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No reviews found for this game",
        )
    return ArcadaeumReview(**arcadaeum_review)


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
