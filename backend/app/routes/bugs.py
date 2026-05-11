import asyncio
import os
from concurrent.futures import ThreadPoolExecutor
from datetime import datetime, timedelta, timezone
from random import randint
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

# ── URL config (set in .env, fall back to localhost for local dev) ─────────
BACKEND_URL = os.getenv("BACKEND_URL", "http://localhost:8000")
FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:5173")


@router.post("/link")
async def link_steam_account_endpoint(
    request: SteamLinkRequest,
    current_user: User = Depends(get_current_user),
) -> dict[str, object]:
    """
    Link a Steam account to the user's Arcadaeum account.
    Accepts a raw SteamID64, a vanity slug, or a full Steam profile URL.
    """
    steam_service = SteamService()
    steam_input = request.steam_id.strip()

    if not steam_input:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Steam ID or vanity URL cannot be empty",
        )

    steam_input = steam_input.rstrip("/")

    if not steam_input.isdigit():
        vanity_slug = steam_input
        if "/" in steam_input:
            vanity_slug = steam_input.split("/")[-1]

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

    if not steam_service.validate_steam_id(steam_id):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid Steam ID or account not found",
        )

    from app.database import get_steam_account_by_steam_id

    existing = get_steam_account_by_steam_id(steam_id)
    if existing and existing["user_id"] != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="This Steam account is already linked to another Arcadaeum account",
        )

    if not link_steam_account(current_user.id, steam_id):
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to link Steam account",
        )

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
    Returns the Steam login URL for the frontend to redirect to.
    """
    logger = logging.getLogger(__name__)
    steam_service = SteamService()

    return_url = f"{BACKEND_URL}/steam/verify-callback"
    redirect_url, token = steam_service.get_openid_redirect_url(return_url)

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
    Verifies the response, links the account, and redirects to the settings page.
    """
    logger = logging.getLogger(__name__)
    query_params = dict(request.query_params)

    # ── Validate token ─────────────────────────────────────────────────────
    with get_database_connection() as conn:
        with conn.cursor() as cur:
            cur.execute(
                """
                SELECT id, user_id, expires_at, verified
                FROM steam_verification_tokens
                WHERE token = %s
                """,
                (token,),
            )
            token_record = cur.fetchone()

            if not token_record:
                return RedirectResponse(
                    url=f"{FRONTEND_URL}/settings?steam_error=invalid_token",
                    status_code=303,
                )

            token_id, user_id, expires_at, verified = token_record

            if expires_at.tzinfo is None:
                expires_at = expires_at.replace(tzinfo=timezone.utc)

            if expires_at < datetime.now(timezone.utc):
                return RedirectResponse(
                    url=f"{FRONTEND_URL}/settings?steam_error=token_expired",
                    status_code=303,
                )

    # ── Verify OpenID response ─────────────────────────────────────────────
    steam_service = SteamService()
    return_to = query_params.get("openid.return_to", "")
    verified_steam_id = steam_service.verify_openid_response(query_params, return_to)

    if not verified_steam_id:
        logger.error("Steam OpenID verification failed")
        return RedirectResponse(
            url=f"{FRONTEND_URL}/settings?steam_error=verification_failed",
            status_code=303,
        )

    logger.info(f"Verified Steam ID {verified_steam_id} for user {user_id}")

    # ── Check for duplicate link ───────────────────────────────────────────
    from app.database import get_steam_account_by_steam_id

    existing = get_steam_account_by_steam_id(verified_steam_id)
    if existing and existing["user_id"] != user_id:
        return RedirectResponse(
            url=f"{FRONTEND_URL}/settings?steam_error=already_linked",
            status_code=303,
        )

    # ── Persist link ───────────────────────────────────────────────────────
    if not link_steam_account(user_id, verified_steam_id):
        return RedirectResponse(
            url=f"{FRONTEND_URL}/settings?steam_error=link_failed",
            status_code=303,
        )

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

    asyncio.create_task(delayed_sync(user_id, delay=30))

    logger.info(f"Steam account linked for user {user_id}: {verified_steam_id}")
    return RedirectResponse(
        url=f"{FRONTEND_URL}/settings?steam_success=true",
        status_code=303,
    )


@router.post("/unlink")
async def unlink_steam_account_endpoint(
    current_user: User = Depends(get_current_user),
) -> dict[str, object]:
    """Unlink the Steam account from the user's Arcadaeum account."""
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
    """Get the current user's linked Steam account info."""
    steam_account = get_steam_account(current_user.id)
    if not steam_account:
        return {"steam_id": None, "steam_username": None}
    return {
        "steam_id": steam_account["steam_id"],
        "steam_username": steam_account.get("steam_username"),
    }


# ── Background sync helpers ────────────────────────────────────────────────


async def delayed_sync(user_id: int, delay: int = 1) -> None:
    """Start a two-phase sync after a short delay to avoid blocking the frontend."""
    logger = logging.getLogger(__name__)
    await asyncio.sleep(delay)
    loop = asyncio.get_event_loop()
    logger.info(f"Starting Steam sync for user {user_id}")
    await loop.run_in_executor(
        _sync_executor, lambda: sync_user_steam_library_sync(user_id, quick_mode=True)
    )
    await asyncio.sleep(10)
    await loop.run_in_executor(
        _sync_executor, lambda: sync_user_steam_library_sync(user_id, quick_mode=False)
    )


def sync_user_steam_library_sync(user_id: int, quick_mode: bool = False) -> SteamSyncResult:
    """Synchronous wrapper used by the thread-pool executor."""
    return _sync_user_steam_library_impl(user_id, quick_mode)


def _sync_user_steam_library_impl(user_id: int, quick_mode: bool = False) -> SteamSyncResult:
    """
    Sync a user's Steam library to their Arcadaeum library.

    quick_mode=True  → only match games already in the local DB (fast).
    quick_mode=False → also search IGDB for unmatched titles (slow).
    """
    logger = logging.getLogger(__name__)
    mode_str = "quick" if quick_mode else "full"
    logger.info(f"Starting {mode_str} Steam sync for user {user_id}")

    steam_service = SteamService()
    igdb_service = IGDBService()

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

    try:
        update_sync_status(user_id, "syncing")

        steam_games_response = steam_service.get_owned_games(steam_id)
        steam_games = steam_games_response.get("games", [])
        logger.info(f"Found {len(steam_games)} games in Steam library for user {user_id}")

        if not steam_games:
            update_sync_status(
                user_id, "idle", datetime.now(timezone.utc) + timedelta(hours=24)
            )
            return SteamSyncResult(
                matched_games=0, added_to_library=0, unmatched_games_found=0, errors=[]
            )

        igdb_games_by_title: dict[str, dict] = {}
        with get_database_connection() as conn:
            with conn.cursor() as cur:
                cur.execute("SELECT id, title FROM games")
                for game_id, title in cur.fetchall():
                    if title:
                        igdb_games_by_title[title.lower()] = {"id": game_id}

        matched_count = added_count = unmatched_count = 0
        errors: list[str] = []

        for idx, steam_game in enumerate(steam_games):
            steam_app_id = steam_game.get("appid")
            steam_name = steam_game.get("name", "")
            playtime_forever = steam_game.get("playtime_forever", 0)
            playtime_2weeks = steam_game.get("playtime_2weeks", 0)

            if not quick_mode and idx > 0 and idx % 3 == 0:
                import time
                time.sleep(1.0)

            try:
                matching_game = igdb_games_by_title.get(steam_name.lower())

                if matching_game:
                    game_id = matching_game["id"]
                    matched_count += 1
                elif quick_mode:
                    unmatched_count += 1
                    continue
                else:
                    try:
                        igdb_games = igdb_service.search_games(steam_name, limit=5)
                        if igdb_games:
                            best_match = None
                            for igdb_game in igdb_games:
                                igdb_name = igdb_game.get("name", "").lower()
                                steam_lower = steam_name.lower()
                                if igdb_name == steam_lower:
                                    best_match = igdb_game
                                    break
                                elif igdb_name.startswith(steam_lower[:10]) or steam_lower.startswith(igdb_name[:10]):
                                    if best_match is None:
                                        best_match = igdb_game

                            if best_match:
                                game_id = add_game_from_igdb_data(best_match.get("id"), igdb_service)
                                if game_id:
                                    matched_count += 1
                                else:
                                    unmatched_count += 1
                                    continue
                            else:
                                unmatched_count += 1
                                continue
                        else:
                            unmatched_count += 1
                            continue
                    except Exception as e:
                        unmatched_count += 1
                        logger.warning(f"IGDB search error for {steam_name}: {e}")
                        continue

                add_steam_game(user_id, steam_app_id, game_id, playtime_forever, playtime_2weeks, steam_name)

                try:
                    result = add_to_library(user_id, game_id)
                    if result is not None:
                        added_count += 1
                except Exception:
                    added_count += 1

            except Exception as e:
                msg = f"Error processing {steam_name}: {e}"
                errors.append(msg)
                logger.error(msg)

        random_minutes = randint(0, 120)
        next_sync = datetime.now(timezone.utc) + timedelta(hours=24, minutes=random_minutes)
        update_sync_status(user_id, "idle", next_sync)

        logger.info(
            f"Steam sync done for user {user_id}: "
            f"{matched_count} matched, {added_count} added, {unmatched_count} unmatched"
        )
        return SteamSyncResult(
            matched_games=matched_count,
            added_to_library=added_count,
            unmatched_games_found=unmatched_count,
            errors=errors,
        )

    except Exception as e:
        msg = f"Sync failed for user {user_id}: {e}"
        logger.error(msg, exc_info=True)
        update_sync_status(user_id, "error")
        return SteamSyncResult(
            matched_games=0, added_to_library=0, unmatched_games_found=0, errors=[msg]
        )
