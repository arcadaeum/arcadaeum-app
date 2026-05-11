import logging
import traceback
from typing import Any, Optional

logger = logging.getLogger(__name__)


def log_crash(context: str, exception: Exception, extra_info: Optional[dict] = None) -> None:
    """
    Log an exception with full context and traceback.

    try:
        function()
        except Exception as e:
            log_crash("steam_sync_user_123", e, {"user_id": 123})
    """
    logger.critical(f"CRASH [{context}]: {type(exception).__name__}")
    logger.critical(f"Message: {str(exception)}")

    if extra_info:
        logger.critical(f"Context: {extra_info}")

    logger.critical(f"Traceback:\n{traceback.format_exc()}")


def log_error(
    context: str,
    message: str,
    exception: Optional[Exception] = None,
    extra_info: Optional[dict] = None,
) -> None:
    """Log an error with an optional exception details."""
    logger.error(f"ERROR [{context}]: {message}")

    if extra_info:
        logger.error(f"Details: {extra_info}")

    if exception:
        logger.error(f"Exception: {type(exception).__name__}: {str(exception)}")
