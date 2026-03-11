from fastapi import APIRouter
from app.services.igdb_service import IGDBService
from app.database import add_game_to_db

router = APIRouter()
igdb = IGDBService()


@router.post("/cache")
async def cache_games():
    try:
        # Fetch From Service
        games_data = igdb.fetch_top_games(limit=500)

        if not games_data:
            return {"message": "No games fetched from IGDB"}

        # Logic to save to our DB
        saved_count = 0
        for game_data in games_data:
            try:
                cover_url = None
                if game_data.get("cover"):
                    cover_url = f"https://images.igdb.com/igdb/image/upload/t_cover_big/{game_data['cover']}.jpg"

                add_game_to_db(
                    igdb_id=game_data.get("id"),
                    title=game_data.get("name"),
                    summary=game_data.get("summary"),
                    cover_url=cover_url,
                    platforms=game_data.get("platforms", []),
                    release_date=game_data.get("first_release_date"),
                    igdb_rating=game_data.get("total_rating"),
                )
                saved_count += 1
            except Exception as error:
                print(f"Error saving game {game_data.get('name')}: {error}")
                continue

        return {"message": f"Successfully cached {saved_count} games"}
    except Exception as error:
        print(f"Cache error: {error}")
        return {"error": str(error)}
