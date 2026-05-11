from fastapi import APIRouter, Depends, HTTPException, status

from app.database.queries.posts import (
    create_post,
    delete_post,
    get_following_posts,
    get_post_with_user,
    get_user_posts,
    update_post,
)
from app.database.queries.users import get_user_by_id
from app.models import CreatePostRequest, PostWithUser, UpdatePostRequest, User
from app.services.auth import get_current_user

router = APIRouter(tags=["posts"])


@router.post(
    "/users/me/posts",
    response_model=PostWithUser,
    status_code=status.HTTP_201_CREATED,
)
def create_user_post(
    request: CreatePostRequest, current_user: User = Depends(get_current_user)
) -> PostWithUser:
    content = request.content.strip()
    if not content:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="Post content cannot be empty"
        )

    post_id = create_post(current_user.id, content)
    post = get_post_with_user(post_id)
    if post is None:
        raise HTTPException(status_code=500, detail="Failed to retrieve post")
    return PostWithUser(**post)


@router.patch("/users/me/posts/{post_id}", response_model=PostWithUser)
def update_user_post(
    post_id: int,
    request: UpdatePostRequest,
    current_user: User = Depends(get_current_user),
) -> PostWithUser:
    content = request.content.strip()
    if not content:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="Post content cannot be empty"
        )

    updated = update_post(current_user.id, post_id, content)
    if not updated:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Post not found")

    post = get_post_with_user(post_id)
    if post is None:
        raise HTTPException(status_code=500, detail="Failed to retrieve post")
    return PostWithUser(**post)


@router.delete("/users/me/posts/{post_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_user_post(post_id: int, current_user: User = Depends(get_current_user)) -> None:
    deleted = delete_post(current_user.id, post_id)
    if not deleted:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Post not found")


@router.get("/users/{user_id}/posts", response_model=list[PostWithUser])
def list_user_posts(user_id: int, offset: int = 0, limit: int = 50) -> list[PostWithUser]:
    if get_user_by_id(user_id) is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

    posts = get_user_posts(user_id, offset=offset, limit=limit)
    return [PostWithUser(**post) for post in posts]


@router.get("/users/me/feed", response_model=list[PostWithUser])
def list_following_feed(
    offset: int = 0,
    limit: int = 50,
    current_user: User = Depends(get_current_user),
) -> list[PostWithUser]:
    posts = get_following_posts(current_user.id, offset=offset, limit=limit)
    return [PostWithUser(**post) for post in posts]
