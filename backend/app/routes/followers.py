import psycopg
from fastapi import APIRouter, Depends, HTTPException, status

from app.database.queries.followers import get_social_users_with_game
from app.models.auth import User
from app.models.followers import FollowResponse, SocialLibraryUser, UserSummary
from app.services.auth import get_current_user
from app.services.followers import (
    follow_user,
    get_followers,
    get_following,
    unfollow_user,
)

router = APIRouter()


@router.post(
    "/users/{user_id}/follow",
    response_model=FollowResponse,
    status_code=status.HTTP_201_CREATED,
)
def follow_user_endpoint(
    user_id: int, current_user: User = Depends(get_current_user)
) -> FollowResponse:
    try:
        follow_user(current_user.id, user_id)
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc))
    except LookupError:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    except psycopg.errors.UniqueViolation:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT, detail="Already following this user"
        )

    return FollowResponse(user_id=user_id, follower_user_id=current_user.id, is_following=True)


@router.delete("/users/{user_id}/follow")
def unfollow_user_endpoint(
    user_id: int, current_user: User = Depends(get_current_user)
) -> dict[str, str]:
    try:
        removed = unfollow_user(current_user.id, user_id)
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc))
    except LookupError:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

    if not removed:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Not following this user")

    return {"message": "Unfollowed user"}


@router.get("/users/{user_id}/followers", response_model=list[UserSummary])
def list_followers(user_id: int) -> list[UserSummary]:
    try:
        followers = get_followers(user_id)
    except LookupError:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    return [UserSummary.model_validate(follower) for follower in followers]


@router.get("/users/{user_id}/following", response_model=list[UserSummary])
def list_following(user_id: int) -> list[UserSummary]:
    try:
        following = get_following(user_id)
    except LookupError:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    return [UserSummary.model_validate(followed) for followed in following]


@router.get("/users/me/social-library/{game_id}", response_model=list[SocialLibraryUser])
def list_social_users_with_game(
    game_id: int, current_user: User = Depends(get_current_user)
) -> list[SocialLibraryUser]:
    users = get_social_users_with_game(current_user.id, game_id)
    return [SocialLibraryUser.model_validate(user) for user in users]
