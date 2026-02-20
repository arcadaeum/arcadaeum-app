from fastapi import APIRouter
import psycopg
from app.database import get_database_url
from app.models import Submission

router = APIRouter()


@router.post("/submissions")
def add_to_database(submission: Submission):
    database_url = get_database_url()
    with psycopg.connect(database_url) as conn:
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


@router.get("/submissions")
def get_submissions():
    database_url = get_database_url()
    with psycopg.connect(database_url) as conn:
        with conn.cursor() as cur:
            cur.execute("SELECT id, title, timestamp FROM favourite_submissions")
            rows = cur.fetchall()
            return {
                "submissions": [
                    {"id": row[0], "title": row[1], "timestamp": row[2]} for row in rows
                ]
            }
