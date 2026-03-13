"""
Router para gestión de briefs de producto.

Endpoints públicos (lectura):
  GET /briefs        — lista briefs disponibles
  GET /briefs/{id}   — detalle de un brief

Endpoints de administración (escritura, requieren X-Admin-Token):
  POST   /briefs        — crear brief
  PUT    /briefs/{id}   — actualizar brief
  DELETE /briefs/{id}   — eliminar brief
"""

import logging

from fastapi import APIRouter, Depends, HTTPException

from app.models.brief import BriefDetail, BriefSummary, BriefWriteRequest
from app.routers.profiles import verify_admin_token  # Reutilizamos la misma dependencia
from app.services import brief_service

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/briefs", tags=["Briefs"])


# ── Endpoints públicos ────────────────────────────────────────────────────────


@router.get("", response_model=list[BriefSummary])
async def list_briefs() -> list[BriefSummary]:
    """Lista todos los briefs de producto disponibles."""
    briefs = brief_service.list_briefs()
    return [BriefSummary(**b) for b in briefs]


@router.get("/{brief_id}", response_model=BriefDetail)
async def get_brief(brief_id: str) -> BriefDetail:
    """
    Obtiene el contenido completo de un brief.

    Args:
        brief_id: Identificador del brief (nombre del archivo sin extensión).
    """
    brief = brief_service.get_brief(brief_id)
    if not brief:
        raise HTTPException(status_code=404, detail="Brief not found")
    return BriefDetail(**brief)


# ── Endpoints de administración ───────────────────────────────────────────────


@router.post("", status_code=201, dependencies=[Depends(verify_admin_token)])
async def create_brief(request: BriefWriteRequest) -> dict:
    """
    Crea un nuevo brief de producto.

    Requiere header: X-Admin-Token
    """
    content = request.content
    if "name" not in content:
        raise HTTPException(status_code=422, detail="El campo 'name' es obligatorio.")

    brief_id = content["name"].lower().replace(" ", "_")
    brief_service.save_brief(brief_id, content)
    return {"id": brief_id, "name": content["name"]}


@router.put("/{brief_id}", dependencies=[Depends(verify_admin_token)])
async def update_brief(brief_id: str, request: BriefWriteRequest) -> dict:
    """
    Actualiza el contenido de un brief existente.

    Requiere header: X-Admin-Token
    """
    brief_service.save_brief(brief_id, request.content)
    return {"id": brief_id, "updated": True}


@router.delete("/{brief_id}", dependencies=[Depends(verify_admin_token)])
async def delete_brief(brief_id: str) -> dict:
    """
    Elimina un brief del sistema.

    Requiere header: X-Admin-Token
    """
    deleted = brief_service.delete_brief(brief_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Brief not found")
    return {"id": brief_id, "deleted": True}
