from app.services.igdb_service import IGDBService
from app.database import add_game_to_db

igdb = IGDBService()


def cache_popular_games(limit: int = 500):
    try:
        # Fetch From Service
        games_data = igdb.fetch_top_games(limit=limit)

        if not games_data:
            return {"message": "No games fetched from IGDB"}

        # Logic to save to our DB
        saved_count = 0
        for game_data in games_data:
            try:
                cover_url = None
                cover = game_data.get("cover")
                if isinstance(cover, dict) and cover.get("image_id"):
                    image_id = cover["image_id"]

                    # Change size by changing 't_cover_big' to other size options, check IGDB docs for more: https://api-docs.igdb.com/#images
                    cover_url = (
                        f"https://images.igdb.com/igdb/image/upload/t_cover_big/{image_id}.jpg"
                    )

                platform_names = []
                for platform in game_data.get("platforms", []):
                    if isinstance(platform, dict) and platform.get("name"):
                        platform_names.append(platform["name"])

                genre_names = []
                for genre in game_data.get("genres", []):
                    if isinstance(genre, dict) and genre.get("name"):
                        genre_names.append(genre["name"])

                developer_names = []
                for involved_company in game_data.get("involved_companies", []):
                    if not isinstance(involved_company, dict):
                        continue
                    if not involved_company.get("developer"):
                        continue

                    company = involved_company.get("company")
                    if isinstance(company, dict) and company.get("name"):
                        developer_names.append(company["name"])

                developer = ", ".join(developer_names) if developer_names else None

                add_game_to_db(
                    igdb_id=game_data.get("id"),
                    title=game_data.get("name"),
                    summary=game_data.get("summary"),
                    developer=developer,
                    cover_url=cover_url,
                    platforms=platform_names,
                    genres=genre_names,
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
