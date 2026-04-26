from fastapi import APIRouter, HTTPException

from app.database import add_game_to_db, get_database_connection
from app.models import AddGameFromIGDBRequest
from app.services.igdb_service import IGDBService

router = APIRouter()
igdb_service = IGDBService()


# IMPORTANT: More specific routes should come first
@router.get("/games/search-igdb")
async def search_igdb(q: str) -> list[dict[str, object]]:
    """Search IGDB for games."""
    try:
        games = igdb_service.search_games(q, limit=10)

        formatted_games: list[dict[str, object]] = []
        for game in games:
            cover_url: str | None = None
            cover = game.get("cover")
            if isinstance(cover, dict):
                image_id = cover.get("image_id")
                if isinstance(image_id, str) and image_id:
                    cover_url = f"https://images.igdb.com/igdb/image/upload/t_cover_big/{image_id}.jpg"

            formatted_games.append(
                {
                    "id": game.get("id"),
                    "name": game.get("name"),
                    "cover_url": cover_url,
                }
            )

        return formatted_games
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Search failed: {str(e)}")


@router.post("/games/add-from-igdb")
async def add_game_from_igdb(request: AddGameFromIGDBRequest) -> dict[str, object]:
    """Add a game from IGDB to the database."""
    try:
        with get_database_connection() as conn:
            with conn.cursor() as cur:
                cur.execute(
                    "SELECT id FROM games WHERE igdb_id = %s", (request.igdb_id,)
                )
                existing = cur.fetchone()
                if existing is not None:
                    existing_id = existing[0]
                    return {"id": existing_id, "title": "Game already exists"}

        game_data = igdb_service.fetch_game_by_id(request.igdb_id)

        if not game_data:
            raise HTTPException(status_code=404, detail="Game not found on IGDB")

        cover_url: str | None = None
        cover = game_data.get("cover")
        if isinstance(cover, dict):
            image_id = cover.get("image_id")
            if isinstance(image_id, str) and image_id:
                cover_url = f"https://images.igdb.com/igdb/image/upload/t_cover_big/{image_id}.jpg"

        platform_names: list[str] = []
        for platform in game_data.get("platforms", []):
            if isinstance(platform, dict):
                name = platform.get("name")
                if isinstance(name, str) and name:
                    platform_names.append(name)

        genre_names: list[str] = []
        for genre in game_data.get("genres", []):
            if isinstance(genre, dict):
                name = genre.get("name")
                if isinstance(name, str) and name:
                    genre_names.append(name)

        screenshots: list[str] = []
        for screenshot in game_data.get("screenshots", []):
            if not isinstance(screenshot, dict):
                continue
            image_id = screenshot.get("image_id")
            if isinstance(image_id, str) and image_id:
                screenshots.append(
                    f"https://images.igdb.com/igdb/image/upload/t_screenshot_big/{image_id}.jpg"
                )

        first_release_date = game_data.get("first_release_date")
        release_timestamp: int | None = None
        if isinstance(first_release_date, int):
            release_timestamp = first_release_date
        elif isinstance(first_release_date, float):
            release_timestamp = int(first_release_date)

        total_rating = game_data.get("total_rating")
        igdb_rating: float | None = None
        if isinstance(total_rating, (int, float)):
            igdb_rating = float(total_rating)

        new_game_id = add_game_to_db(
            igdb_id=request.igdb_id,
            title=str(game_data.get("name") or ""),
            summary=game_data.get("summary")
            if isinstance(game_data.get("summary"), str)
            else None,
            developer=None,
            cover_url=cover_url,
            screenshots=screenshots,
            platforms=platform_names,
            genres=genre_names,
            release_date=release_timestamp,
            igdb_rating=igdb_rating,
        )

        if new_game_id is None:
            raise HTTPException(
                status_code=500, detail="Failed to add game to database"
            )

        return {"id": new_game_id, "title": game_data.get("name")}

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error adding game: {str(e)}")


@router.get("/games")
def get_games() -> list[dict[str, object]]:
    with get_database_connection() as conn:
        with conn.cursor() as cur:
            cur.execute(
                """
                SELECT id, igdb_id, title, summary, developer, cover_url, screenshots, platforms, release_date, igdb_rating, created_at
                FROM games
                ORDER BY id DESC
                """
            )

            if cur.description is None:
                return []

            rows = cur.fetchall()
            columns = [desc[0] for desc in cur.description]

    return [dict(zip(columns, row)) for row in rows]


@router.get("/games/{game_id}")
def get_game(game_id: int) -> dict[str, object]:
    with get_database_connection() as conn:
        with conn.cursor() as cur:
            cur.execute(
                """
                SELECT id, igdb_id, title, summary, developer, cover_url, screenshots, platforms, release_date, igdb_rating, created_at
                FROM games
                WHERE id = %s
                """,
                (game_id,),
            )
            row = cur.fetchone()
            if row is None:
                raise HTTPException(status_code=404, detail="Game not found")

            if cur.description is None:
                raise HTTPException(
                    status_code=500, detail="Failed to retrieve game data"
                )

            columns = [desc[0] for desc in cur.description]
            return dict(zip(columns, row))
