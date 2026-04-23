import os
import requests
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from app.database import get_database_connection, add_game_to_db
from app.services.igdb_service import IGDBService
from datetime import datetime


router = APIRouter()
igdb_service = IGDBService()


# IMPORTANT: More specific routes should come first
@router.get("/games/search-igdb")
async def search_igdb(q: str):
    """Search IGDB for games"""
    try:
        games = igdb_service.search_games(q, limit=10)

        # Format the response
        formatted_games = []
        for game in games:
            cover_url = None
            cover = game.get("cover")
            if isinstance(cover, dict) and cover.get("image_id"):
                image_id = cover["image_id"]
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


class AddGameFromIGDBRequest(BaseModel):
    igdb_id: int


@router.post("/games/add-from-igdb")
async def add_game_from_igdb(request: AddGameFromIGDBRequest):
    """Add a game from IGDB to the database"""
    try:
        print(f"Adding game from IGDB with igdb_id: {request.igdb_id}")  # Debug

        # Check if game already exists in database
        with get_database_connection() as conn:
            with conn.cursor() as cur:
                cur.execute("SELECT id FROM games WHERE igdb_id = %s", (request.igdb_id,))
                existing = cur.fetchone()
                if existing:
                    print(f"Game already exists with id: {existing[0]}")  # Debug
                    return {"id": existing[0], "title": "Game already exists"}

        # Fetch game details from IGDB
        print(f"Fetching game {request.igdb_id} from IGDB service...")  # Debug
        game_data = igdb_service.fetch_game_by_id(request.igdb_id)
        print(f"Game data received: {game_data}")  # Debug

        if not game_data:
            raise HTTPException(status_code=404, detail="Game not found on IGDB")

        # Extract cover URL
        cover_url = None
        cover = game_data.get("cover")
        if isinstance(cover, dict) and cover.get("image_id"):
            image_id = cover["image_id"]
            cover_url = f"https://images.igdb.com/igdb/image/upload/t_cover_big/{image_id}.jpg"

        # Extract platform and genre names
        platform_names = []
        for platform in game_data.get("platforms", []):
            if isinstance(platform, dict) and platform.get("name"):
                platform_names.append(platform["name"])

        genre_names = []
        for genre in game_data.get("genres", []):
            if isinstance(genre, dict) and genre.get("name"):
                genre_names.append(genre["name"])

        # Convert Unix timestamp to date
        release_date = None
        first_release_date = game_data.get("first_release_date")
        if first_release_date:
            try:
                release_date = datetime.fromtimestamp(first_release_date).date()
            except (ValueError, TypeError):
                release_date = None

        print(f"Inserting game: {game_data.get('name')}")  # Debug

        # Add to database and get the returned id
        with get_database_connection() as conn:
            with conn.cursor() as cur:
                cur.execute(
                    """
                    INSERT INTO games (igdb_id, title, summary, cover_url, platforms, genres, release_date, igdb_rating)
                    VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
                    RETURNING id
                    """,
                    (
                        request.igdb_id,
                        game_data.get("name"),
                        game_data.get("summary"),
                        cover_url,
                        platform_names,
                        genre_names,
                        release_date,  # Now a proper date object
                        game_data.get("total_rating"),
                    ),
                )
                new_game_id = cur.fetchone()[0]
                conn.commit()

        print(f"Successfully added game with database id: {new_game_id}")  # Debug
        return {"id": new_game_id, "title": game_data.get("name")}

    except HTTPException:
        raise  # Re-raise HTTPExceptions as-is
    except Exception as e:
        print(f"Error adding game: {str(e)}")  # Debug
        import traceback

        traceback.print_exc()  # Print full stack trace
        raise HTTPException(status_code=500, detail=f"Error adding game: {str(e)}")


@router.get("/games")
def get_games():
    with get_database_connection() as conn:
        with conn.cursor() as cur:
            cur.execute(
                """
                SELECT id, igdb_id, title, summary, cover_url, platforms, release_date, igdb_rating, created_at
                FROM games
                ORDER BY id DESC
                """
            )
            rows = cur.fetchall()
            columns = [desc[0] for desc in cur.description]

    return [dict(zip(columns, row)) for row in rows]


@router.get("/games/{game_id}")
def get_game(game_id: int):
    with get_database_connection() as conn:
        with conn.cursor() as cur:
            cur.execute(
                """
                SELECT id, igdb_id, title, summary, cover_url, platforms, release_date, igdb_rating, created_at
                FROM games
                WHERE id = %s
                """,
                (game_id,),
            )
            row = cur.fetchone()
            if row is None:
                return {"error": "Game not found"}

            columns = [desc[0] for desc in cur.description]
            return dict(zip(columns, row))
