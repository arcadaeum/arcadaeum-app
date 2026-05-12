from fastapi import APIRouter, HTTPException

from app.database.connection import get_database_connection
from app.database.queries.games import add_game_from_igdb_data
from app.database.queries.games import add_game_to_db as _add_game_to_db
from app.models.games import AddGameFromIGDBRequest
from app.services.igdb_service import IGDBService

# Expose for tests that monkeypatch this symbol in app.routes.games
add_game_to_db = _add_game_to_db

router = APIRouter()


def get_igdb_service() -> IGDBService:
    return IGDBService()


# IMPORTANT: More specific routes should come first
@router.get("/games/search-igdb")
async def search_igdb(q: str) -> list[dict[str, object]]:
    """Search IGDB for games."""
    try:
        igdb_service = get_igdb_service()
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
        igdb_service = get_igdb_service()
        game_id = add_game_from_igdb_data(request.igdb_id, igdb_service)

        if game_id is None:
            raise HTTPException(
                status_code=404, detail="Game not found on IGDB or failed to add"
            )

        # Get the game title for response
        with get_database_connection() as conn:
            with conn.cursor() as cur:
                cur.execute("SELECT title FROM games WHERE id = %s", (game_id,))
                row = cur.fetchone()
                title = row[0] if row else "Unknown"

        return {"id": game_id, "title": title}

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error adding game: {str(e)}")


@router.get("/games")
def get_games() -> list[dict[str, object]]:
    with get_database_connection() as conn:
        with conn.cursor() as cur:
            cur.execute("""
                SELECT id, igdb_id, title, summary, developer, cover_url, artworks, screenshots, platforms, genres, release_date, igdb_rating, created_at
                FROM games
                ORDER BY id DESC
                """)

            if cur.description is None:
                return []

            rows = cur.fetchall()
            columns = [desc[0] for desc in cur.description]

    return [dict(zip(columns, row)) for row in rows]


@router.get("/games/game-of-the-day")
def get_game_of_the_day() -> dict[str, object]:
    with get_database_connection() as conn:
        with conn.cursor() as cur:
            cur.execute("""
                SELECT id, igdb_id, title, summary, developer, cover_url, artworks, screenshots, platforms, genres, release_date, igdb_rating, created_at
                FROM games
                ORDER BY md5(CURRENT_DATE::text || '-' || id::text)
                LIMIT 1
                """)
            row = cur.fetchone()
            if row is None:
                raise HTTPException(status_code=404, detail="No games found")

            if cur.description is None:
                raise HTTPException(
                    status_code=500, detail="Failed to retrieve game data"
                )

            columns = [desc[0] for desc in cur.description]
            return dict(zip(columns, row))


@router.get("/games/{game_id}")
def get_game(game_id: int) -> dict[str, object]:
    with get_database_connection() as conn:
        with conn.cursor() as cur:
            cur.execute(
                """
                SELECT id, igdb_id, title, summary, developer, cover_url, artworks, screenshots, platforms, genres, release_date, igdb_rating, created_at
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
