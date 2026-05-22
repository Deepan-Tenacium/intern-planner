import os

import httpx
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import RedirectResponse
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.auth import (
    create_access_token,
    get_current_user,
    hash_password,
    verify_password,
)
from app.database import get_db
from app.models import User
from app.schemas import Token, UserCreate, UserLogin, UserOut

router = APIRouter()

GITHUB_CLIENT_ID = os.getenv("GITHUB_CLIENT_ID")
GITHUB_CLIENT_SECRET = os.getenv("GITHUB_CLIENT_SECRET")
GITHUB_REDIRECT_URI = "http://localhost:8000/auth/github/callback"


@router.post("/register", response_model=Token, status_code=status.HTTP_201_CREATED)
def register(payload: UserCreate, db: Session = Depends(get_db)):
    existing = db.scalar(select(User).where(User.email == payload.email))
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    user = User(
        email=payload.email,
        password_hash=hash_password(payload.password),
        name=payload.name,
        role=payload.role,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    token = create_access_token({"email": user.email, "role": user.role, "user_id": user.id})
    return Token(access_token=token, token_type="bearer")


@router.post("/login", response_model=Token)
def login(payload: UserLogin, db: Session = Depends(get_db)):
    user = db.scalar(select(User).where(User.email == payload.email))
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")
    if not user.password_hash or not verify_password(payload.password, user.password_hash):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")
    token = create_access_token({"email": user.email, "role": user.role, "user_id": user.id})
    return Token(access_token=token, token_type="bearer")


@router.get("/github")
def github_login():
    url = (
        "https://github.com/login/oauth/authorize"
        f"?client_id={GITHUB_CLIENT_ID}"
        f"&redirect_uri={GITHUB_REDIRECT_URI}"
        "&scope=read:user+user:email"
    )
    return RedirectResponse(url)


@router.get("/github/callback", response_model=Token)
def github_callback(code: str, db: Session = Depends(get_db)):
    with httpx.Client() as client:
        token_resp = client.post(
            "https://github.com/login/oauth/access_token",
            json={
                "client_id": GITHUB_CLIENT_ID,
                "client_secret": GITHUB_CLIENT_SECRET,
                "code": code,
                "redirect_uri": GITHUB_REDIRECT_URI,
            },
            headers={"Accept": "application/json"},
        )
        token_resp.raise_for_status()
        gh_token = token_resp.json().get("access_token")

    headers = {"Authorization": f"Bearer {gh_token}"}
    with httpx.Client() as client:
        user_resp = client.get("https://api.github.com/user", headers=headers)
        user_resp.raise_for_status()
        gh_user = user_resp.json()

        emails_resp = client.get("https://api.github.com/user/emails", headers=headers)
        emails_resp.raise_for_status()
        gh_emails = emails_resp.json()

    primary_email = next(
        (e["email"] for e in gh_emails if e.get("primary") and e.get("verified")),
        gh_emails[0]["email"] if gh_emails else None,
    )
    gh_id = str(gh_user["id"])
    gh_name = gh_user.get("name") or gh_user.get("login", "GitHub User")

    user = db.scalar(select(User).where(User.github_id == gh_id))
    if not user and primary_email:
        user = db.scalar(select(User).where(User.email == primary_email))

    if user:
        user.github_id = gh_id
        db.commit()
        db.refresh(user)
    else:
        user = User(
            email=primary_email,
            name=gh_name,
            role="intern",
            github_id=gh_id,
        )
        db.add(user)
        db.commit()
        db.refresh(user)

    token = create_access_token({"email": user.email, "role": user.role, "user_id": user.id})
    return Token(access_token=token, token_type="bearer")


@router.get("/me", response_model=UserOut)
def me(current_user: User = Depends(get_current_user)):
    return current_user
