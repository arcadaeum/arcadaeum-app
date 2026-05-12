import csv
import os
import re
from functools import lru_cache

from fastapi import HTTPException, status

MODERATION_ERROR_DETAIL = "Content contains disallowed language"


def _parse_blocklist(raw_blocklist: str) -> tuple[str, ...]:
    if not raw_blocklist.strip():
        return ()

    terms: list[str] = []
    for row in csv.reader(raw_blocklist.splitlines()):
        for term in row:
            normalized = " ".join(term.strip().casefold().split())
            if normalized:
                terms.append(normalized)

    return tuple(dict.fromkeys(terms))


@lru_cache(maxsize=1)
def get_blocked_terms() -> tuple[str, ...]:
    return _parse_blocklist(os.getenv("MODERATION_BLOCKLIST", ""))


def _term_pattern(term: str) -> re.Pattern[str]:
    escaped_parts = [re.escape(part) for part in term.split()]
    escaped_term = r"[\W_]+".join(escaped_parts)
    return re.compile(rf"(?<![\w]){escaped_term}(?![\w])", re.IGNORECASE)


def contains_blocked_term(content: str | None) -> bool:
    if not content:
        return False

    normalized_content = " ".join(content.casefold().split())
    return any(_term_pattern(term).search(normalized_content) for term in get_blocked_terms())


def assert_content_allowed(content: str | None) -> None:
    if contains_blocked_term(content):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=MODERATION_ERROR_DETAIL,
        )
