from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routes import health, submissions

app = FastAPI(title="Arcadaeum API")

origins = [
    "http://localhost:5173",  # Dev frontend
    "http://www.arcadaeum.com",  # Production frontend
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Attach all the API routes here
app.include_router(health.router)
app.include_router(submissions.router)
