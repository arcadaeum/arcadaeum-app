import logging
import os
import traceback
from contextlib import asynccontextmanager
from pathlib import Path

from dotenv import load_dotenv
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from starlette.middleware.sessions import SessionMiddleware
from starlette.responses import JSONResponse

from app.database import create_tables
from app.routes import (
    auth,
    bugs,
    cache,
    collections,
    followers,
    games,
    health,
    library,
    reviews,
    steam,
    users,
    news,
    posts,
)
from app.services.cache import add_default_users, cache_popular_games, get_game_news
from app.services.scheduler import start_steam_sync_scheduler

PROJECT_ROOT = Path(__file__).resolve().parents[2]
load_dotenv(PROJECT_ROOT / ".env")
load_dotenv()

# Configure logging
logging.basicConfig(
    level=logging.INFO, format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger(__name__)

scheduler_task = None


# On startup, create tables and cache popular games from IGDB to our DB
@asynccontextmanager
async def lifespan(_app: FastAPI):
    global scheduler_task

    create_tables()
    default_users_result = add_default_users()
    print(f"Startup users result: {default_users_result}")
    cache_result = cache_popular_games(limit=500)
    print(f"Startup cache result: {cache_result}")
    try:
        news_cache_result = get_game_news(limit=5)
        print(f"Startup news cache result: cached {len(news_cache_result)} articles")
    except Exception as error:
        print(f"Startup news cache skipped: {error}")

    # Start the Steam sync scheduler
    scheduler_task = start_steam_sync_scheduler()
    print("Started Steam sync scheduler")

    yield

    # Clean up scheduler on shutdown
    if scheduler_task:
        scheduler_task.cancel()
        try:
            await scheduler_task
        except Exception:
            pass
    print("Stopped Steam sync scheduler")


app = FastAPI(title="Arcadaeum API", lifespan=lifespan)

secret_key = os.getenv("SECRET_KEY")
if not secret_key:
    raise RuntimeError("SECRET_KEY environment variable is not set")
app.add_middleware(
    SessionMiddleware,
    secret_key=secret_key,
    session_cookie="arcadaeum_session",
    same_site="none",
    https_only=os.getenv("ENVIRONMENT", "").lower() == "production",
)

origins = [
    "http://localhost:5173",
    "https://www.arcadaeum.com",
    "https://arcadaeum.com",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Global exception handler for catching crashes
@app.middleware("http")
async def crash_logging_middleware(request: Request, call_next):
    try:
        response = await call_next(request)
        return response
    except Exception as e:
        # Log the crash with full traceback
        logger.critical(
            f"CRASH: Unhandled exception in {request.method} {request.url.path}", exc_info=True
        )
        logger.critical(f"Error type: {type(e).__name__}")
        logger.critical(f"Error message: {str(e)}")
        logger.critical(f"Traceback:\n{traceback.format_exc()}")

        headers = {}
        origin = request.headers.get("origin")
        if origin in origins:
            headers["Access-Control-Allow-Origin"] = origin
            headers["Access-Control-Allow-Credentials"] = "true"

        # Return error response
        return JSONResponse(
            status_code=500,
            content={"detail": "Internal server error"},
            headers=headers,
        )


app.include_router(health.router)
app.include_router(auth.router)
app.include_router(bugs.router)
app.include_router(cache.router)
app.include_router(games.router)
app.include_router(library.router)
app.include_router(steam.router)
app.include_router(collections.router)
app.include_router(reviews.router)
app.include_router(news.router)
app.include_router(posts.router)
app.include_router(users.router)
app.include_router(followers.router)
