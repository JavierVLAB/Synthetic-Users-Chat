"""
Router de autenticación.

Proporciona el endpoint de login que valida el password de acceso
y devuelve un JWT firmado con HS256 válido durante 30 días.

Endpoints:
  POST /auth/login  — validar password y obtener token
"""

from datetime import datetime, timedelta, timezone

from fastapi import APIRouter, HTTPException, status
from jose import jwt
from pydantic import BaseModel

from app.config import settings

router = APIRouter(prefix="/auth", tags=["Autenticación"])

_ALGORITHM = "HS256"
_TOKEN_EXPIRE_DAYS = 30


class LoginRequest(BaseModel):
    password: str


class LoginResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"


@router.post("/login", response_model=LoginResponse)
async def login(body: LoginRequest) -> LoginResponse:
    """
    Valida el password de acceso y devuelve un JWT de 30 días.

    El password se compara con ACCESS_PASSWORD del .env.
    El JWT se firma con HS256 usando el mismo ACCESS_PASSWORD como secret.
    """
    if body.password != settings.access_password:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Password incorrecto",
        )

    expire = datetime.now(timezone.utc) + timedelta(days=_TOKEN_EXPIRE_DAYS)
    token = jwt.encode(
        {"sub": "moeve-user", "exp": expire},
        settings.access_password,
        algorithm=_ALGORITHM,
    )

    return LoginResponse(access_token=token)
