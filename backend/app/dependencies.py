"""
Dependencias compartidas de FastAPI.

Proporciona get_current_user, que verifica el JWT en el header
Authorization: Bearer <token> y lanza 401 si no es válido.

Uso en routers:
    from app.dependencies import get_current_user
    from fastapi import Depends

    @router.get("/resource")
    async def endpoint(_: str = Depends(get_current_user)):
        ...
"""

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from jose import ExpiredSignatureError, JWTError, jwt

from app.config import settings

_ALGORITHM = "HS256"
_bearer = HTTPBearer()


async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(_bearer),
) -> str:
    """
    Verifica el JWT del header Authorization.

    Returns el subject del token ("moeve-user") si es válido.
    Raises 401 si el token está ausente, expirado o tiene firma inválida.
    """
    token = credentials.credentials
    try:
        payload = jwt.decode(token, settings.access_password, algorithms=[_ALGORITHM])
        return payload.get("sub", "moeve-user")
    except ExpiredSignatureError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token expirado",
        )
    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token inválido",
        )
