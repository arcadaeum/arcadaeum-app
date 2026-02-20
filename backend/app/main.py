from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routes import health, submissions
from app.database import create_tables


@asynccontextmanager
async def lifespan(app: FastAPI):
    create_tables()
    yield


app = FastAPI(title="Arcadaeum API", lifespan=lifespan)

origins = [
    "http://localhost:5173",
    "https://www.arcadaeum.com",
    "https://arcadaeum.com",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_origin_regex=r"https://.*\.vercel\.app",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Attach all the API routes here
app.include_router(health.router)
app.include_router(submissions.router)
