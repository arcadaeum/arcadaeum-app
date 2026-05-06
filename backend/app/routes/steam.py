import asyncio
from concurrent.futures import ThreadPoolExecutor
from datetime import datetime, timedelta, timezone
from random import randint
import secrets
import logging

from fastapi import APIRouter, Depends, HTTPException, Query, Request, status
from fastapi.responses import RedirectResponse

from app.database import (
    add_steam_game,
    get_database_connection,
    get_steam_account,
    link_steam_account,
    unlink_steam_account,
    update_sync_status,
)
from app.database.queries.library import add_to_library, game_in_library
from app.database.queries.games import add_game_from_igdb_data
from app.models import (
    SteamLinkRequest,
    SteamSyncResult,
    User,
    SteamVerificationResponse,
)
from app.services.auth import get_current_user
from app.services.steam_service import SteamService
from app.services.igdb_service import IGDBService

router = APIRouter(prefix="/steam", tags=["steam"])

# Thread pool for running blocking sync operations
_sync_executor = ThreadPoolExecutor(max_workers=2, thread_name_prefix="steam_sync")


@router.post("/link")
async def link_steam_account_endpoint(
    request: SteamLinkRequest,
    current_user: User = Depends(get_current_user),
) -> dict[str, object]:
    """
    Link a Steam account to the user's Arcadaeum account.
    """
    steam_service = SteamService()
    steam_input = request.steam_id.strip()

    # Validate input is not empty
    if not steam_input:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Steam ID or vanity URL cannot be empty",
        )

    # Remove trailing slashes
    steam_input = steam_input.rstrip("/")

    # Try to resolve vanity URL if input is not numeric
    if not steam_input.isdigit():
        # Extract vanity URL slug from various formats
        vanity_slug = steam_input
        if "/" in steam_input:
            # Handle URLs like /id/archbuscam or full URLs
            vanity_slug = steam_input.split("/")[-1]

        # Ensure vanity slug is not empty
        if not vanity_slug or not vanity_slug.strip():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid Steam URL format",
            )

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

    # Schedule first sync with a delay (30 seconds) to let the user navigate away
    asyncio.create_task(delayed_sync(current_user.id, delay=30))

    return {
        "success": True,
        "message": "Steam account linked successfully",
        "steam_id": steam_id,
    }


@router.post("/verify-start")
async def start_steam_verification(
    current_user: User = Depends(get_current_user),
) -> SteamVerificationResponse:
    """
    Start Steam OpenID verification.

    Returns the Steam login URL the frontend should redirect to.
    """
    logger = logging.getLogger(__name__)
    steam_service = SteamService()
    return_url = "http://localhost:8000/steam/verify-callback"  # Update with your domain

    redirect_url, token = steam_service.get_openid_redirect_url(return_url)

    # Store the token in database
    expires_at = datetime.now(timezone.utc) + timedelta(minutes=10)

    with get_database_connection() as conn:
        with conn.cursor() as cur:
            cur.execute(
                """
                INSERT INTO steam_verification_tokens (user_id, token, expires_at)
                VALUES (%s, %s, %s)
                """,
                (current_user.id, token, expires_at),
            )
            conn.commit()

    logger.info(f"Started Steam OpenID verification for user {current_user.id}")

    return SteamVerificationResponse(redirect_url=redirect_url)


@router.get("/verify-callback")
async def steam_verification_callback(
    request: Request,
    token: str = Query(...),
) -> RedirectResponse:
    """
    Handle Steam OpenID callback.

    Verifies the Steam response and links the account if valid.
    Redirects back to the frontend settings page on success.
    """
    logger = logging.getLogger(__name__)

    # Extract all OpenID parameters from query string
    query_params = dict(request.query_params)
    logger.debug(f"Received callback with params: {list(query_params.keys())}")

    # Verify token exists and hasn't expired, and get the user_id
    with get_database_connection() as conn:
        with conn.cursor() as cur:
            cur.execute(
                """
                SELECT id, user_id, expires_at, verified FROM steam_verification_tokens
                WHERE token = %s
                """,
                (token,),
            )
            token_record = cur.fetchone()

            if not token_record:
                # Redirect to settings with error
                return RedirectResponse(
                    url="http://localhost:5173/settings?steam_error=invalid_token", status_code=303
                )

            token_id, user_id, expires_at, verified = token_record

            # Make expires_at timezone-aware
            if expires_at.tzinfo is None:
                expires_at = expires_at.replace(tzinfo=timezone.utc)

            if expires_at < datetime.now(timezone.utc):
                # Redirect to settings with error
                return RedirectResponse(
                    url="http://localhost:5173/settings?steam_error=token_expired", status_code=303
                )

    # Verify with Steam (query_params already captured from request above)
    steam_service = SteamService()

    # Get the return_to URL from the query params (Steam sends it back)
    return_to = query_params.get("openid.return_to", "")
    verified_steam_id = steam_service.verify_openid_response(query_params, return_to)

    if not verified_steam_id:
        # Redirect to settings with error
        logger.error("Steam verification failed")
        return RedirectResponse(
            url="http://localhost:5173/settings?steam_error=verification_failed", status_code=303
        )

    logger.info(f"Verified Steam ID {verified_steam_id} for user {user_id}")

    # Check if this Steam ID is already linked
    from app.database import get_steam_account_by_steam_id

    existing = get_steam_account_by_steam_id(verified_steam_id)
    if existing and existing["user_id"] != user_id:
        # Redirect to settings with error
        return RedirectResponse(
            url="http://localhost:5173/settings?steam_error=already_linked", status_code=303
        )

    # Link the Steam account
    if not link_steam_account(user_id, verified_steam_id):
        # Redirect to settings with error
        return RedirectResponse(
            url="http://localhost:5173/settings?steam_error=link_failed", status_code=303
        )

    # Mark token as verified and store the Steam ID
    with get_database_connection() as conn:
        with conn.cursor() as cur:
            cur.execute(
                """
                UPDATE steam_verification_tokens
                SET verified = true, verified_steam_id = %s
                WHERE id = %s
                """,
                (verified_steam_id, token_id),
            )
            conn.commit()

    # Schedule sync
    asyncio.create_task(delayed_sync(user_id, delay=30))

    # Redirect back to settings page with success message
    logger.info(f"Steam account linked successfully for user {user_id}: {verified_steam_id}")
    return RedirectResponse(
        url="http://localhost:5173/settings?steam_success=true", status_code=303
    )


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


@router.get("/account")
async def get_steam_account_endpoint(
    current_user: User = Depends(get_current_user),
) -> dict[str, object]:
    """Get the current user's linked Steam account."""
    steam_account = get_steam_account(current_user.id)
    if not steam_account:
        return {"steam_id": None, "steam_username": None}
    return {
        "steam_id": steam_account["steam_id"],
        "steam_username": steam_account.get("steam_username"),
    }


async def delayed_sync(user_id: int, delay: int = 1) -> None:
    """Start sync after a delay to avoid blocking frontend."""
    import logging

    logger = logging.getLogger(__name__)
    await asyncio.sleep(delay)
    # Run sync in thread pool to not block event loop
    loop = asyncio.get_event_loop()
    logger.info(f"Starting Steam sync for user {user_id} in thread pool")
    # First do a quick sync (only existing games)
    await loop.run_in_executor(
        _sync_executor, lambda: sync_user_steam_library_sync(user_id, quick_mode=True)
    )
    # Then schedule a full sync with IGDB searches for later
    await asyncio.sleep(10)  # Wait before expensive IGDB search
    await loop.run_in_executor(
        _sync_executor, lambda: sync_user_steam_library_sync(user_id, quick_mode=False)
    )


def sync_user_steam_library_sync(user_id: int, quick_mode: bool = False) -> SteamSyncResult:
    """Synchronous version of sync for thread pool execution."""
    return _sync_user_steam_library_impl(user_id, quick_mode)


def _sync_user_steam_library_impl(user_id: int, quick_mode: bool = False) -> SteamSyncResult:
    """
    Sync a user's Steam library to their Arcadaeum library.

    Args:
        user_id: User to sync
        quick_mode: If True, only match existing games. If False, also search IGDB.
    """
    import logging

    logger = logging.getLogger(__name__)
    mode_str = "quick" if quick_mode else "full"
    logger.info(f"Starting {mode_str} Steam sync for user {user_id}")

    steam_service = SteamService()
    igdb_service = IGDBService()

    # Get the user's Steam account
    steam_account = get_steam_account(user_id)
    if not steam_account:
        logger.error(f"Steam account not found for user {user_id}")
        return SteamSyncResult(
            matched_games=0,
            added_to_library=0,
            unmatched_games_found=0,
            errors=["Steam account not found"],
        )

    steam_id = steam_account["steam_id"]
    logger.info(f"Starting Steam sync for user {user_id} with Steam ID {steam_id}")

    try:
        # Update status to syncing
        update_sync_status(user_id, "syncing")

        # Get Steam games
        steam_games_response = steam_service.get_owned_games(steam_id)
        steam_games = steam_games_response.get("games", [])
        logger.info(f"Found {len(steam_games)} games in Steam library")

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
                errors=[],
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
        unmatched_count = 0
        errors = []

        # Process each Steam game with rate limiting
        for idx, steam_game in enumerate(steam_games):
            steam_app_id = steam_game.get("appid")
            steam_name = steam_game.get("name", "")
            playtime_forever = steam_game.get("playtime_forever", 0)
            playtime_2weeks = steam_game.get("playtime_2weeks", 0)

            # Add small delay between IGDB searches to avoid rate limiting (only in full mode)
            if not quick_mode and idx > 0 and idx % 3 == 0:
                import time

                time.sleep(1.0)  # Use regular sleep in sync context

            try:
                # Try to find a matching IGDB game by exact title match first
                matching_game = igdb_games_by_title.get(steam_name.lower())

                if matching_game:
                    # Exact match in Arcadaeum database
                    game_id = matching_game["id"]
                    matched_count += 1
                    logger.info(f"Found exact match for {steam_name} in database")
                elif quick_mode:
                    # In quick mode, skip IGDB searches
                    unmatched_count += 1
                    logger.debug(f"Skipping IGDB search in quick mode for {steam_name}")
                    continue
                else:
                    # Search IGDB for the game - get multiple results for better matching
                    try:
                        igdb_games = igdb_service.search_games(steam_name, limit=5)

                        if igdb_games:
                            # Find best match - prefer exact or near-exact matches
                            best_match = None
                            for igdb_game in igdb_games:
                                igdb_name = igdb_game.get("name", "").lower()
                                steam_name_lower = steam_name.lower()

                                # Exact match
                                if igdb_name == steam_name_lower:
                                    best_match = igdb_game
                                    break
                                # Very close match (within 95% similarity)
                                elif igdb_name.startswith(
                                    steam_name_lower[:10]
                                ) or steam_name_lower.startswith(igdb_name[:10]):
                                    if best_match is None:
                                        best_match = igdb_game

                            if best_match:
                                igdb_game_id = best_match.get("id")
                                # Use the helper function to add the game
                                game_id = add_game_from_igdb_data(igdb_game_id, igdb_service)

                                if game_id:
                                    matched_count += 1
                                    logger.info(
                                        f"Matched {steam_name} to IGDB game: {best_match.get('name')}"
                                    )
                                else:
                                    unmatched_count += 1
                                    logger.debug(f"Failed to add {steam_name} from IGDB")
                                    continue
                            else:
                                unmatched_count += 1
                                logger.debug(
                                    f"No good match found for {steam_name} in IGDB search results"
                                )
                                # Log the search results for debugging
                                search_results = [g.get("name") for g in igdb_games[:3]]
                                logger.debug(f"  Top IGDB results: {search_results}")
                                continue
                        else:
                            unmatched_count += 1
                            logger.debug(f"Game {steam_name} not found on IGDB")
                            continue
                    except Exception as e:
                        unmatched_count += 1
                        logger.warning(f"Error searching IGDB for {steam_name}: {str(e)}")
                        continue

                # Store the Steam game record
                add_steam_game(
                    user_id,
                    steam_app_id,
                    game_id,
                    playtime_forever,
                    playtime_2weeks,
                    steam_name,
                )

                # Add to user's library if not already there
                try:
                    result = add_to_library(user_id, game_id)
                    if result is not None:
                        added_count += 1
                except Exception as e:
                    logger.debug(f"Game {steam_name} already in library")
                    added_count += 1

            except Exception as e:
                error_msg = f"Error processing {steam_name}: {str(e)}"
                errors.append(error_msg)
                logger.error(error_msg)

        # Schedule next sync for 24 hours + random offset (0-2 hours)
        random_minutes = randint(0, 120)
        next_sync = datetime.now(timezone.utc) + timedelta(hours=24, minutes=random_minutes)

        # Update status to idle with next sync time
        update_sync_status(user_id, "idle", next_sync)

        logger.info(
            f"Steam sync completed for user {user_id}: {matched_count} matched, {added_count} added, {unmatched_count} unmatched"
        )

        return SteamSyncResult(
            matched_games=matched_count,
            added_to_library=added_count,
            unmatched_games_found=unmatched_count,
            errors=errors,
        )

    except Exception as e:
        error_msg = f"Sync failed for user {user_id}: {str(e)}"
        logger.error(error_msg, exc_info=True)
        update_sync_status(user_id, "error")
        return SteamSyncResult(
            matched_games=0,
            added_to_library=0,
            unmatched_games_found=0,
            errors=[error_msg],
        )
