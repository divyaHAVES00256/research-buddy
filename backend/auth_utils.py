# backend/auth_utils.py
# authentication logic for Research Buddy — password hashing, JWT token creation/validation, 
# and the get_current_user FastAPI dependency

import os
from datetime import datetime, timedelta, timezone

from dotenv import load_dotenv
from fastapi import Header, HTTPException, status
from jose import JWTError, jwt
from passlib.context import CryptContext

load_dotenv()

# Configuration

SECRET_KEY = os.getenv("SECRET_KEY", "")
ALGORITHM  = "HS256"
TOKEN_EXPIRE_DAYS = 7   # tokens are valid for one week

if not SECRET_KEY:
    raise RuntimeError("SECRET_KEY is not set in .env — generate one with: "
                       "python -c \"import secrets; print(secrets.token_hex(32))\"")

# CryptContext wraps bcrypt and lets us swap algorithms in the future
# without changing every call site
_pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


# Password utilities
def hash_password(password: str) -> str:
    """
    Hash a plain-text password using bcrypt
    """
    return _pwd_context.hash(password)


def verify_password(plain: str, hashed: str) -> bool:
    """
    Check whether a plain-text password matches a stored bcrypt hash
    """
    return _pwd_context.verify(plain, hashed)


# JWT utilities
def create_access_token(data: dict) -> str:
    """
    Create a signed JWT token containing the given payload dict
    """
    payload = data.copy()
    expire  = datetime.now(timezone.utc) + timedelta(days=TOKEN_EXPIRE_DAYS)
    payload["exp"] = expire
    return jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)


def decode_access_token(token: str) -> dict | None:
    """
    Decode and validate a JWT token
    """
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except JWTError:
        # Covers ExpiredSignatureError, JWTClaimsError, DecodeError, etc.
        return None


# FastAPI dependency
async def get_current_user(authorization: str = Header(None)) -> dict:
    """
    FastAPI dependency — inject this into any endpoint that requires auth
    """
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Not authenticated — provide a valid Bearer token",
        headers={"WWW-Authenticate": "Bearer"},
    )

    if not authorization:
        raise credentials_exception

    parts = authorization.split(" ")
    if len(parts) != 2 or parts[0].lower() != "bearer":
        raise credentials_exception

    token = parts[1]
    payload = decode_access_token(token)

    if payload is None:
        raise credentials_exception

    # Sanity-check that the token contains the fields we need
    if "user_id" not in payload or "email" not in payload:
        raise credentials_exception

    return payload