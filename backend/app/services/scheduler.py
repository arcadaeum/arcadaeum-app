import asyncio
import logging
from collections import defaultdict
from datetime import datetime, timedelta, timezone

from app.database import get_steam_accounts_due_for_sync, update_sync_status

logger = logging.getLogger(__name__)

# Track failed syncs: user_id -> (fail_count, last_fail_time)
failed_syncs: dict[int, tuple[int, datetime | None]] = defaultdict(lambda: (0, None))


async def steam_sync_scheduler() -> None:
    """
    Background scheduler that periodically checks for Steam accounts that need syncing.

    Simple failure handling:
    - After 5 failures: pause for 6 hours
    - After 6 hours if still failing: stop syncing (mark as error) - requires user to re-link
    """
    global failed_syncs

    logger.info("Steam sync scheduler started")

    while True:
        try:
            await asyncio.sleep(300)  # Check every 5 minutes

            # Get all accounts due for sync
            accounts_to_sync = get_steam_accounts_due_for_sync()

            if not accounts_to_sync:
                continue

            logger.info(f"Found {len(accounts_to_sync)} accounts due for Steam sync")

            # Import here to avoid circular imports
            from app.routes.steam import sync_user_steam_library

            # Sync each account
            for account in accounts_to_sync:
                user_id = account["user_id"]
                fail_count, last_fail_time = failed_syncs[user_id]

                # Check if user is paused due to too many failures
                if fail_count >= 5 and last_fail_time is not None:
                    # After 5 failures, check if 6 hours have passed
                    pause_until = last_fail_time + timedelta(hours=6)

                    if datetime.now(timezone.utc) < pause_until:
                        logger.debug(
                            f"User {user_id} paused due to failures. "
                            f"Will retry after {pause_until.isoformat()}"
                        )
                        continue

                    # 6 hours have passed, try again but if it fails, give up
                    # (will be caught below and marked as permanently failed)

                try:
                    logger.info(f"Starting Steam sync for user {user_id}")
                    await sync_user_steam_library(user_id)
                    logger.info(f"Completed Steam sync for user {user_id}")

                    # Clear failures on success
                    if user_id in failed_syncs:
                        del failed_syncs[user_id]

                except Exception as e:
                    # Increment failure count
                    fail_count, _ = failed_syncs[user_id]
                    failed_syncs[user_id] = (fail_count + 1, datetime.now(timezone.utc))

                    logger.error(
                        f"Error syncing user {user_id} (failure #{fail_count + 1}): {str(e)}"
                    )

                    # If 5+ failures and 6+ hours have passed, mark as error and stop trying
                    if fail_count >= 5 and last_fail_time is not None:
                        pause_until = last_fail_time + timedelta(hours=6)
                        if datetime.now(timezone.utc) >= pause_until:
                            # This is the second failure after 6-hour pause - give up
                            logger.critical(
                                f"User {user_id} sync has failed repeatedly. "
                                f"Stopping sync attempts. User must re-link Steam account."
                            )
                            update_sync_status(user_id, "error")
                            # Remove from tracking (won't retry until re-link)
                            del failed_syncs[user_id]

        except asyncio.CancelledError:
            logger.info("Steam sync scheduler stopped")
            break
        except Exception as e:
            logger.exception(f"Unexpected error in Steam sync scheduler: {str(e)}")
            await asyncio.sleep(60)


def start_steam_sync_scheduler() -> asyncio.Task:
    """
    Start the Steam sync scheduler as a background task.

    Returns:
        The asyncio task for the scheduler
    """
    return asyncio.create_task(steam_sync_scheduler())
