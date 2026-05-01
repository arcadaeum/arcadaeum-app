import asyncio
from datetime import datetime, timedelta, timezone
from random import randint

from fastapi import APIRouter, Depends, HTTPException, status

from app.database import (
    add_steam_game,
    get_database_connection,
    get_steam_account,
    link_steam_account,
    unlink_steam_account,
    update_sync_status,
)
from app.database.queries.library import add_to_library
from app.models import (
    SteamLinkRequest,
    SteamSyncResult,
    User,
)
from app.services.auth import get_current_user
from app.services.steam_service import SteamService

router = APIRouter(prefix="/steam", tags=["steam"])


@router.post("/link")
async def link_steam_account_endpoint(
    request: SteamLinkRequest,
    current_user: User = Depends(get_current_user),
) -> dict[str, object]:
    """
    Link a Steam account to the user's Arcadaeum account.

    Supports both direct Steam IDs and vanity URLs.

    Args:
        request: Contains the Steam ID or vanity URL
        current_user: Current authenticated user

    Returns - Success message with linked Steam ID
    """
    steam_service = SteamService()
    steam_input = request.steam_id.strip()

    # Try to resolve vanity URL if input is not numeric
    if not steam_input.isdigit():
        # Extract vanity URL slug from various formats
        vanity_slug = steam_input
        if "/" in steam_input:
            # Handle URLs like /id/archbuscam or full URLs
            vanity_slug = steam_input.split("/")[-1]

        resolved_id = steam_service.resolve_vanity_url(vanity_slug)
        if not resolved_id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Could not find Steam account with vanity URL: {vanity_slug}",
            )
        steam_id = resolved_id
    else:
        steam_id = steam_input

    # Validate the Steam ID exists
    if not steam_service.validate_steam_id(steam_id):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid Steam ID or account not found",
        )

    # Check if Steam ID is already linked to another user
    from app.database import get_steam_account_by_steam_id

    existing = get_steam_account_by_steam_id(steam_id)
    if existing and existing["user_id"] != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="This Steam account is already linked to another Arcadaeum account",
        )

    # Link the Steam account
    if not link_steam_account(current_user.id, steam_id):
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to link Steam account",
        )

    # Schedule first sync
    asyncio.create_task(sync_user_steam_library(current_user.id))

    return {
        "success": True,
        "message": "Steam account linked successfully",
        "steam_id": steam_id,
    }


@router.post("/unlink")
async def unlink_steam_account_endpoint(
    current_user: User = Depends(get_current_user),
) -> dict[str, object]:
    """
    Unlink the Steam account from the user's Arcadaeum account.

    Returns - Success message
    """
    if not unlink_steam_account(current_user.id):
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to unlink Steam account",
        )

    return {"success": True, "message": "Steam account unlinked successfully"}


async def sync_user_steam_library(user_id: int) -> SteamSyncResult:
    """
    Sync a user's Steam library to their Arcadaeum library.

    Args:
        user_id: The user ID to sync

    Returns:
        SteamSyncResult with sync statistics
    """
    steam_service = SteamService()

    # Get the user's Steam account
    steam_account = get_steam_account(user_id)
    if not steam_account:
        return SteamSyncResult(
            matched_games=0,
            added_to_library=0,
            unmatched_games_found=0,
            errors=["Steam account not found"],
        )

    steam_id = steam_account["steam_id"]

    try:
        # Update status to syncing
        update_sync_status(user_id, "syncing")

        # Get Steam games
        steam_games_response = steam_service.get_owned_games(steam_id)
        steam_games = steam_games_response.get("games", [])

        if not steam_games:
            update_sync_status(
                user_id,
                "idle",
                datetime.now(timezone.utc) + timedelta(hours=24),
            )
            return SteamSyncResult(
                matched_games=0,
                added_to_library=0,
                unmatched_games_found=0,
            )

        # Get all games from Arcadaeum database for matching
        igdb_games_by_title = {}
        with get_database_connection() as conn:
            with conn.cursor() as cur:
                cur.execute("SELECT id, title FROM games")
                for game_id, title in cur.fetchall():
                    if title:
                        igdb_games_by_title[title.lower()] = {"id": game_id}

        matched_count = 0
        added_count = 0
        errors = []

        # Process each Steam game
        for steam_game in steam_games:
            steam_app_id = steam_game.get("appid")
            steam_name = steam_game.get("name", "")
            playtime_forever = steam_game.get("playtime_forever", 0)
            playtime_2weeks = steam_game.get("playtime_2weeks", 0)

            try:
                # Try to find a matching IGDB game
                matching_game = igdb_games_by_title.get(steam_name.lower())

                if matching_game:
                    # Store the Steam game with the matched game ID
                    add_steam_game(
                        user_id,
                        steam_app_id,
                        matching_game["id"],  # Arcadaeum game ID
                        playtime_forever,
                        playtime_2weeks,
                        steam_name,
                    )
                    matched_count += 1

                    # Add to user's library if not already there
                    try:
                        add_to_library(user_id, matching_game["id"])
                        added_count += 1
                    except Exception as e:
                        # Game might already be in library
                        if "already" not in str(e).lower():
                            errors.append(f"Failed to add {steam_name} to library: {str(e)}")
                # Unmatched games are silently skipped

            except Exception as e:
                errors.append(f"Error processing {steam_name}: {str(e)}")

        # Schedule next sync for 24 hours + random offset (0-2 hours)
        random_minutes = randint(0, 120)
        next_sync = datetime.now(timezone.utc) + timedelta(hours=24, minutes=random_minutes)

        # Update status to idle with next sync time
        update_sync_status(user_id, "idle", next_sync)

        return SteamSyncResult(
            matched_games=matched_count,
            added_to_library=added_count,
            unmatched_games_found=0,
            errors=errors,
        )

    except Exception as e:
        update_sync_status(user_id, "error")
        return SteamSyncResult(
            matched_games=0,
            added_to_library=0,
            unmatched_games_found=0,
            errors=[f"Sync failed: {str(e)}"],
        )
