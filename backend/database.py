# backend/database.py
# all database operations

import json
import os

import asyncpg
from dotenv import load_dotenv

load_dotenv()

# Module-level pool — set once on startup, reused across all requests
_pool: asyncpg.Pool | None = None


# Connection lifecycle — called by FastAPI startup / shutdown events

async def connect_db() -> None:
    """
    Create the asyncpg connection pool using DATABASE_URL from .env
    """
    global _pool
    database_url = os.getenv("DATABASE_URL")
    print("[DB] DATABASE_URL:", database_url)
    if not database_url:
        raise RuntimeError("DATABASE_URL is not set in .env")

    _pool = await asyncpg.create_pool(
        dsn=database_url,
        min_size=1,   # keep at least 1 connection alive
        max_size=10,  # never open more than 10 simultaneous connections
    )
    print("[DB] Connection pool created.")


async def disconnect_db() -> None:
    """
    Gracefully close all connections in the pool
    """
    global _pool
    if _pool:
        await _pool.close()
        print("[DB] Connection pool closed.")


async def get_pool() -> asyncpg.Pool:
    """
    Returns the module-level pool
    """
    if _pool is None:
        raise RuntimeError("Database pool is not initialised. connect_db() was never called.")
    return _pool


# User operations

async def create_user(email: str, hashed_password: str) -> dict:
    """
    Insert a new user row and return the created record
    """
    pool = await get_pool()
    try:
        row = await pool.fetchrow(
            """
            INSERT INTO users (email, hashed_password)
            VALUES ($1, $2)
            RETURNING id, email, created_at
            """,
            email,
            hashed_password,
        )
    except asyncpg.UniqueViolationError:
        # PostgreSQL unique constraint on users.email fired
        raise ValueError("Email already registered")

    return dict(row)


async def get_user_by_email(email: str) -> dict | None:
    """
    Look up a user by email for login.
    """
    pool = await get_pool()
    row = await pool.fetchrow(
        """
        SELECT id, email, hashed_password
        FROM users
        WHERE email = $1
        """,
        email,
    )
    return dict(row) if row else None


# Paper operations

async def save_paper(
    user_id: str,
    paper_id: str,
    filename: str,
    title_guess: str,
    page_count: int,
    word_count: int,
    full_text: str,
    summary: dict,
    keywords: dict,
    stats: dict,
) -> dict:
    """
    Persist a paper to the database after it has been uploaded and analysed.
    """
    pool = await get_pool()
    row = await pool.fetchrow(
        """
        INSERT INTO papers (
            user_id, paper_id, filename, title_guess,
            page_count, word_count, full_text,
            summary, keywords, stats
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8::jsonb, $9::jsonb, $10::jsonb)
        RETURNING id, user_id, paper_id, filename, title_guess,
                  page_count, word_count, uploaded_at
        """,
        user_id,
        paper_id,
        filename,
        title_guess,
        page_count,
        word_count,
        full_text,
        json.dumps(summary),
        json.dumps(keywords),
        json.dumps(stats),
    )
    return dict(row)


async def get_user_papers(user_id: str) -> list[dict]:
    """
    Return all papers belonging to a user, newest first
    """
    pool = await get_pool()
    rows = await pool.fetch(
        """
        SELECT
            id, user_id, paper_id, filename, title_guess,
            page_count, word_count,
            summary, keywords, stats,
            uploaded_at
        FROM papers
        WHERE user_id = $1
        ORDER BY uploaded_at DESC
        """,
        user_id,
    )
    # asyncpg returns Record objects; convert each to a plain dict.
    # JSONB columns come back as strings from asyncpg, so parse them.
    result = []
    for row in rows:
        d = dict(row)
        d["summary"]  = json.loads(d["summary"])  if isinstance(d["summary"],  str) else d["summary"]
        d["keywords"] = json.loads(d["keywords"]) if isinstance(d["keywords"], str) else d["keywords"]
        d["stats"]    = json.loads(d["stats"])    if isinstance(d["stats"],    str) else d["stats"]
        # Convert UUID and datetime to plain strings so FastAPI can serialise them
        d["id"]         = str(d["id"])
        d["user_id"]    = str(d["user_id"])
        d["uploaded_at"] = d["uploaded_at"].isoformat()
        result.append(d)
    return result


async def get_paper_by_id(paper_id: str, user_id: str) -> dict | None:
    """
    Fetch a single paper including its full_text
    """
    pool = await get_pool()
    row = await pool.fetchrow(
        """
        SELECT
            id, user_id, paper_id, filename, title_guess,
            page_count, word_count, full_text,
            summary, keywords, stats,
            uploaded_at
        FROM papers
        WHERE paper_id = $1
          AND user_id  = $2
        """,
        paper_id,
        user_id,
    )
    if row is None:
        return None

    d = dict(row)
    d["summary"]  = json.loads(d["summary"])  if isinstance(d["summary"],  str) else d["summary"]
    d["keywords"] = json.loads(d["keywords"]) if isinstance(d["keywords"], str) else d["keywords"]
    d["stats"]    = json.loads(d["stats"])    if isinstance(d["stats"],    str) else d["stats"]
    d["id"]          = str(d["id"])
    d["user_id"]     = str(d["user_id"])
    d["uploaded_at"] = d["uploaded_at"].isoformat()
    return d