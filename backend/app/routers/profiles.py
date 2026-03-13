"""
Router para gestión de perfiles de comportamiento.

Endpoints públicos (lectura):
  GET /profiles        — lista perfiles disponibles
  GET /profiles/{id}   — detalle de un perfil

Endpoints de administración (escritura, requieren X-Admin-Token):
  POST   /profiles        — crear perfil
  PUT    /profiles/{id}   — actualizar perfil
  DELETE /profiles/{id}   — eliminar perfil

El perfil 'empleado' está protegido y no puede modificarse ni eliminarse
mediante la API — solo a través del sistema de archivos directamente.
"""

import logging

from fastapi import APIRouter, Depends, Header, HTTPException

from app.models.profile import ProfileDetail, ProfileSummary, ProfileWriteRequest
from app.services import profile_service
from app.config import settings

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/profiles", tags=["Perfiles"])


def verify_admin_token(x_admin_token: str = Header(...)) -> None:
    """
    Dependencia que verifica el token de administración.

    Rechaza la request con 401 si el token no coincide con el configurado.
    Se usa en todos los endpoints de escritura de perfiles y briefs.
    """
    if not settings.admin_token or x_admin_token != settings.admin_token:
        raise HTTPException(status_code=401, detail="Unauthorized")


# ── Endpoints públicos ────────────────────────────────────────────────────────


@router.get("", response_model=list[ProfileSummary])
async def list_profiles() -> list[ProfileSummary]:
    """
    Lista todos los perfiles de comportamiento disponibles.

    No incluye el perfil de empleado (perfil fijo del sistema).
    """
    profiles = profile_service.list_behavior_profiles()
    return [ProfileSummary(**p) for p in profiles]


@router.get("/{profile_id}", response_model=ProfileDetail)
async def get_profile(profile_id: str) -> ProfileDetail:
    """
    Obtiene el contenido completo de un perfil de comportamiento.

    Args:
        profile_id: Identificador del perfil (nombre del archivo sin extensión).
    """
    profile = profile_service.get_behavior_profile(profile_id)
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")
    return ProfileDetail(**profile)


# ── Endpoints de administración ───────────────────────────────────────────────


@router.post("", status_code=201, dependencies=[Depends(verify_admin_token)])
async def create_profile(request: ProfileWriteRequest) -> dict:
    """
    Crea un nuevo perfil de comportamiento.

    Requiere header: X-Admin-Token

    El 'id' del perfil se deriva del campo 'name' en snake_case.
    """
    content = request.content
    if "name" not in content:
        raise HTTPException(status_code=422, detail="El campo 'name' es obligatorio.")

    profile_id = content["name"].lower().replace(" ", "_")

    try:
        profile_service.save_behavior_profile(profile_id, content)
    except ValueError as e:
        raise HTTPException(status_code=403, detail=str(e))

    return {"id": profile_id, "name": content["name"]}


@router.put("/{profile_id}", dependencies=[Depends(verify_admin_token)])
async def update_profile(profile_id: str, request: ProfileWriteRequest) -> dict:
    """
    Actualiza el contenido de un perfil existente.

    Requiere header: X-Admin-Token
    """
    try:
        profile_service.save_behavior_profile(profile_id, request.content)
    except ValueError as e:
        raise HTTPException(status_code=403, detail=str(e))

    return {"id": profile_id, "updated": True}


@router.delete("/{profile_id}", dependencies=[Depends(verify_admin_token)])
async def delete_profile(profile_id: str) -> dict:
    """
    Elimina un perfil de comportamiento del sistema.

    Requiere header: X-Admin-Token
    No permite eliminar el perfil de empleado.
    """
    try:
        deleted = profile_service.delete_behavior_profile(profile_id)
    except ValueError as e:
        raise HTTPException(status_code=403, detail=str(e))

    if not deleted:
        raise HTTPException(status_code=404, detail="Profile not found")

    return {"id": profile_id, "deleted": True}
