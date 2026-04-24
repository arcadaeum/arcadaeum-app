import os
from contextlib import asynccontextmanager

from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from starlette.middleware.sessions import SessionMiddleware

from app.database import create_tables
from app.routes import auth, cache, games, health, users
from app.services.cache import add_default_users, cache_popular_games

load_dotenv()


# On startup, create tables and cache popular games from IGDB to our DB
@asynccontextmanager
async def lifespan(_app: FastAPI):
    create_tables()
    default_users_result = add_default_users()
    print(f"Startup users result: {default_users_result}")
    cache_result = cache_popular_games(limit=500)
    print(f"Startup cache result: {cache_result}")
    yield


app = FastAPI(title="Arcadaeum API", lifespan=lifespan)

secret_key = os.getenv("SECRET_KEY")
if not secret_key:
    raise RuntimeError("SECRET_KEY environment variable is not set")
app.add_middleware(SessionMiddleware, secret_key=secret_key)

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

app.include_router(health.router)
app.include_router(auth.router)
app.include_router(cache.router)
app.include_router(games.router)
app.include_router(users.router)
