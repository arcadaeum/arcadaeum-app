from dotenv import load_dotenv
load_dotenv()

import os
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from starlette.middleware.sessions import SessionMiddleware
from app.routes import health, submissions, auth, cache
from app.database import create_tables


@asynccontextmanager
async def lifespan(app: FastAPI):
    create_tables()
    yield


app = FastAPI(title="Arcadaeum API", lifespan=lifespan)

app.add_middleware(SessionMiddleware, secret_key=os.getenv("SECRET_KEY"))

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
app.include_router(submissions.router)
app.include_router(auth.router)
app.include_router(cache.router)
