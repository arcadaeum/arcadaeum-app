from app.database.connection import get_database_connection
from app.database.queries.games import add_game_to_db
from app.services.igdb_service import IGDBService


def cache_popular_games(limit: int = 500) -> dict[str, str]:
    try:
        igdb = IGDBService()
        games_data = igdb.fetch_top_games(limit=limit)

        if not games_data:
            return {"message": "No games fetched from IGDB"}

        saved_count = 0
        for game_data in games_data:
            try:
                igdb_id = game_data.get("id")
                title = game_data.get("name")
                if not isinstance(igdb_id, int) or not isinstance(title, str) or not title:
                    continue

                cover_url: str | None = None
                cover = game_data.get("cover")
                if isinstance(cover, dict):
                    image_id = cover.get("image_id")
                    if isinstance(image_id, str) and image_id:
                        cover_url = (
                            f"https://images.igdb.com/igdb/image/upload/t_cover_big/{image_id}.jpg"
                        )

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

                first_release_date = game_data.get("first_release_date")
                release_date = first_release_date if isinstance(first_release_date, int) else None

                total_rating = game_data.get("total_rating")
                igdb_rating = (
                    float(total_rating) if isinstance(total_rating, (int, float)) else None
                )

                saved_id = add_game_to_db(
                    igdb_id=igdb_id,
                    title=title,
                    summary=(
                        game_data.get("summary")
                        if isinstance(game_data.get("summary"), str)
                        else None
                    ),
                    developer=developer,
                    cover_url=cover_url,
                    screenshots=screenshots,
                    platforms=platform_names,
                    genres=genre_names,
                    release_date=release_date,
                    igdb_rating=igdb_rating,
                )
                if saved_id is not None:
                    saved_count += 1
            except Exception as error:
                print(f"Error saving game {game_data.get('name')}: {error}")
                continue

        return {"message": f"Successfully cached {saved_count} games"}
    except Exception as error:
        print(f"Cache error: {error}")
        return {"error": str(error)}


def add_default_users() -> dict[str, str]:
    """Seed default users into the database."""
    default_users = [
        {
            "username": "Stephen Malkmus",
            "email": "stephen@arcadaeum.com",
            "display_name": "Stephen Malkmus",
        },
        {
            "username": "Scott Kannberg",
            "email": "scott@arcadaeum.com",
            "display_name": "Scott Kannberg",
        },
        {"username": "Mark Ibold", "email": "mark@arcadaeum.com", "display_name": "Mark Ibold"},
        {
            "username": "Bob Nastanovich",
            "email": "bob@arcadaeum.com",
            "display_name": "Bob Nastanovich",
        },
        {"username": "Steve West", "email": "steve@arcadaeum.com", "display_name": "Steve West"},
    ]

    try:
        with get_database_connection() as conn:
            with conn.cursor() as cur:
                for user in default_users:
                    cur.execute("SELECT id FROM users WHERE email = %s", (user["email"],))
                    if cur.fetchone():
                        continue

                    cur.execute(
                        """
                        INSERT INTO users (username, email, password_hash, display_name)
                        VALUES (%s, %s, %s, %s)
                        """,
                        (
                            user["username"],
                            user["email"],
                            "default_password_hash",
                            user["display_name"],
                        ),
                    )
                conn.commit()

        return {"message": "Default users seeded successfully"}
    except Exception as error:
        print(f"Cache users error: {error}")
        return {"error": str(error)}
