from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
import psycopg
from pydantic import BaseModel

app = FastAPI(title="Arcadaeum API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class Submission(BaseModel):
    title: str


@app.get("/health")
def health():
    return {"status": "ok"}


@app.post("/submissions")
def add_to_database(submission: Submission):
    with psycopg.connect("dbname=test user=postgres") as conn:
        with conn.cursor() as cur:
            cur.execute(
                """
                CREATE TABLE IF NOT EXISTS favourite_submissions (
                    id serial PRIMARY KEY,
                    title text,
                    timestamp timestamp)
                """
            )
            cur.execute(
                """
                INSERT INTO favourite_submissions (title, timestamp)
                VALUES (%s, NOW())
                """,
                (submission.title,),
            )
    return {"status": "success"}
