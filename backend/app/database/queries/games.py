from datetime import datetime
from typing import Optional

from app.database import get_database_connection


def add_game_to_db(
    igdb_id: int,
    title: str,
    summary: Optional[str] = None,
    developer: Optional[str] = None,
    cover_url: Optional[str] = None,
    artworks: Optional[list[str]] = None,
    platforms: Optional[list[str]] = None,
    genres: Optional[list[str]] = None,
    screenshots: Optional[list[str]] = None,
    release_date: Optional[int] = None,
    igdb_rating: Optional[float] = None,
) -> Optional[int]:
    """Add a game to the database and return the game's ID."""
    with get_database_connection() as conn:
        with conn.cursor() as cur:
            # Convert Unix timestamp to date
            formatted_date = None
            if release_date:
                formatted_date = datetime.fromtimestamp(release_date).date()

            cur.execute(
                """
                INSERT INTO games (
                    igdb_id,
                    title,
                    summary,
                    developer,
                    cover_url,
                    artworks,
                    screenshots,
                    platforms,
                    genres,
                    release_date,
                    igdb_rating
                )
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                ON CONFLICT (igdb_id) DO UPDATE SET
                    title = EXCLUDED.title,
                    summary = EXCLUDED.summary,
                    developer = EXCLUDED.developer,
                    cover_url = EXCLUDED.cover_url,
                    artworks = EXCLUDED.artworks,
                    screenshots = EXCLUDED.screenshots,
                    platforms = EXCLUDED.platforms,
                    genres = EXCLUDED.genres,
                    release_date = EXCLUDED.release_date,
                    igdb_rating = EXCLUDED.igdb_rating
                RETURNING id
                """,
                (
                    igdb_id,
                    title,
                    summary,
                    developer,
                    cover_url,
                    artworks,
                    screenshots,
                    platforms,
                    genres,
                    formatted_date,
                    igdb_rating,
                ),
            )

            result = cur.fetchone()
            conn.commit()
            return result[0] if result else None


def add_game_from_igdb_data(igdb_id: int, igdb_service) -> int | None:
    """
    Fetch a game from IGDB and add it to the database.
    Returns the game ID if successful, None otherwise.
    """
    # Check if already exists
    with get_database_connection() as conn:
        with conn.cursor() as cur:
            cur.execute("SELECT id FROM games WHERE igdb_id = %s", (igdb_id,))
            existing = cur.fetchone()
            if existing is not None:
                return existing[0]

    # Fetch from IGDB
    game_data = igdb_service.fetch_game_by_id(igdb_id)
    if not game_data:
        return None

    # Format cover
    cover_url: str | None = None
    cover = game_data.get("cover")
    if isinstance(cover, dict):
        image_id = cover.get("image_id")
        if isinstance(image_id, str) and image_id:
            cover_url = f"https://images.igdb.com/igdb/image/upload/t_cover_big/{image_id}.jpg"

    # Format platforms
    platform_names: list[str] = []
    for platform in game_data.get("platforms", []):
        if isinstance(platform, dict):
            name = platform.get("name")
            if isinstance(name, str) and name:
                platform_names.append(name)

    # Format genres
    genre_names: list[str] = []
    for genre in game_data.get("genres", []):
        if isinstance(genre, dict):
            name = genre.get("name")
            if isinstance(name, str) and name:
                genre_names.append(name)

    # Format artworks
    artworks: list[str] = []
    for artwork in game_data.get("artworks", []):
        if not isinstance(artwork, dict):
            continue
        image_id = artwork.get("image_id")
        if isinstance(image_id, str) and image_id:
            artworks.append(f"https://images.igdb.com/igdb/image/upload/t_1080p/{image_id}.jpg")

    # Format screenshots
    screenshots: list[str] = []
    for screenshot in game_data.get("screenshots", []):
        if not isinstance(screenshot, dict):
            continue
        image_id = screenshot.get("image_id")
        if isinstance(image_id, str) and image_id:
            screenshots.append(
                f"https://images.igdb.com/igdb/image/upload/t_screenshot_big/{image_id}.jpg"
            )

    # Format developers
    developer_names: list[str] = []
    for involved_company in game_data.get("involved_companies", []):
        if not isinstance(involved_company, dict):
            continue
        if not involved_company.get("developer"):
            continue
        company = involved_company.get("company")
        if isinstance(company, dict):
            company_name = company.get("name")
            if isinstance(company_name, str) and company_name:
                developer_names.append(company_name)

    developer = ", ".join(developer_names) if developer_names else None

    # Format release date
    first_release_date = game_data.get("first_release_date")
    release_timestamp: int | None = None
    if isinstance(first_release_date, int):
        release_timestamp = first_release_date
    elif isinstance(first_release_date, float):
        release_timestamp = int(first_release_date)

    # Format rating
    total_rating = game_data.get("total_rating")
    igdb_rating: float | None = None
    if isinstance(total_rating, (int, float)):
        igdb_rating = float(total_rating)

    # Add to database
    return add_game_to_db(
        igdb_id=igdb_id,
        title=str(game_data.get("name") or ""),
        summary=game_data.get("summary") if isinstance(game_data.get("summary"), str) else None,
        developer=developer,
        cover_url=cover_url,
        artworks=artworks,
        screenshots=screenshots,
        platforms=platform_names,
        genres=genre_names,
        release_date=release_timestamp,
        igdb_rating=igdb_rating,
    )
