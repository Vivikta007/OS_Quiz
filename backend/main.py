
import os


from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, EmailStr
from supabase import create_client

from pathlib import Path
from dotenv import load_dotenv

load_dotenv(Path(__file__).resolve().parent / ".env")

app = FastAPI(title="OS Quiz API")

supabase_url = os.getenv("SUPABASE_URL")
supabase_key = os.getenv("SUPABASE_PUBLISHABLE_KEY")

supabase = None

if supabase_url and supabase_key:
    supabase = create_client(supabase_url, supabase_key)


class RegisterRequest(BaseModel):
    full_name: str
    email: EmailStr
    password: str


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


@app.get("/")
def home():
    return {"message": "OS Quiz Backend is running!"}


@app.get("/health")
def health_check():
    return {"status": "healthy"}


@app.get("/db-check")
def database_check():
    if supabase is None:
        raise HTTPException(
            status_code=500,
            detail="Supabase configuration is missing",
        )

    try:
        supabase.table("profiles").select("id").limit(1).execute()
        return {
            "connected": True,
            "message": "Supabase connection successful",
        }
    except Exception as error:
        print(f"Database error: {type(error).__name__}: {error}", flush=True)
        raise HTTPException(
            status_code=500,
            detail="Supabase database request failed",
        ) from error


@app.post("/register")
def register_user(data: RegisterRequest):
    if supabase is None:
        raise HTTPException(
            status_code=500,
            detail="Supabase configuration is missing",
        )

    if not data.full_name.strip():
        raise HTTPException(
            status_code=400,
            detail="Name cannot be empty",
        )

    if len(data.password) < 8:
        raise HTTPException(
            status_code=400,
            detail="Password must be at least 8 characters",
        )

    try:
        response = supabase.auth.sign_up({
            "email": str(data.email),
            "password": data.password,
            "options": {
                "data": {
                    "full_name": data.full_name.strip()
                }
            },
        })

        if response.user is None:
            raise HTTPException(
                status_code=400,
                detail="Registration could not be completed",
            )

        return {
            "message": "Registration successful",
            "user_id": str(response.user.id),
            "email": response.user.email,
            "email_confirmation_required": response.session is None,
        }

    except HTTPException:
        raise
    except Exception as error:
        print(
            f"Registration error: {type(error).__name__}: {error}",
            flush=True,
        )
        raise HTTPException(
            status_code=400,
            detail="Registration failed. Check the backend terminal.",
        ) from error


@app.post("/login")
def login_user(data: LoginRequest):
    if supabase is None:
        raise HTTPException(
            status_code=500,
            detail="Supabase configuration is missing",
        )

    try:
        response = supabase.auth.sign_in_with_password({
            "email": str(data.email),
            "password": data.password,
        })

        if response.user is None or response.session is None:
            raise HTTPException(
                status_code=401,
                detail="Login failed",
            )

        return {
            "message": "Login successful",
            "user_id": str(response.user.id),
            "email": response.user.email,
            "access_token": response.session.access_token,
            "refresh_token": response.session.refresh_token,
        }

    except HTTPException:
        raise
    except Exception as error:
        print(
            f"Login error: {type(error).__name__}: {error}",
            flush=True,
        )
        raise HTTPException(
            status_code=401,
            detail="Invalid credentials or login unavailable",
        ) from error
