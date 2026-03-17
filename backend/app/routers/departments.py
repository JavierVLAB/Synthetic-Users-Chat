"""
Router para gestión de departamentos de Moeve.

Endpoints públicos (lectura):
  GET /departments        — lista departamentos disponibles
  GET /departments/{id}   — detalle de un departamento

Endpoints de administración (escritura, requieren X-Admin-Token):
  POST   /departments        — crear departamento
  PUT    /departments/{id}   — actualizar departamento
  DELETE /departments/{id}   — eliminar departamento
"""

import logging

from fastapi import APIRouter, Depends, HTTPException

from app.models.department import DepartmentDetail, DepartmentSummary, DepartmentWriteRequest
from app.routers.profiles import verify_admin_token  # Reutilizamos la misma dependencia
from app.services import department_service

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/departments", tags=["Departamentos"])


# ── Endpoints públicos ────────────────────────────────────────────────────────


@router.get("", response_model=list[DepartmentSummary])
async def list_departments() -> list[DepartmentSummary]:
    """Lista todos los departamentos de Moeve disponibles."""
    departments = department_service.list_departments()
    return [DepartmentSummary(**d) for d in departments]


@router.get("/{dept_id}", response_model=DepartmentDetail)
async def get_department(dept_id: str) -> DepartmentDetail:
    """
    Obtiene el contenido completo de un departamento.

    Args:
        dept_id: Identificador del departamento (nombre del archivo sin extensión).
    """
    dept = department_service.get_department(dept_id)
    if not dept:
        raise HTTPException(status_code=404, detail="Department not found")
    return DepartmentDetail(**dept)


# ── Endpoints de administración ───────────────────────────────────────────────


@router.post("", status_code=201, dependencies=[Depends(verify_admin_token)])
async def create_department(request: DepartmentWriteRequest) -> dict:
    """
    Crea un nuevo departamento.

    Requiere header: X-Admin-Token
    """
    content = request.content
    if "name" not in content:
        raise HTTPException(status_code=422, detail="El campo 'name' es obligatorio.")

    dept_id = content["name"].lower().replace(" ", "_")
    department_service.save_department(dept_id, content)
    return {"id": dept_id, "name": content["name"]}


@router.put("/{dept_id}", dependencies=[Depends(verify_admin_token)])
async def update_department(dept_id: str, request: DepartmentWriteRequest) -> dict:
    """
    Actualiza el contenido de un departamento existente.

    Requiere header: X-Admin-Token
    """
    department_service.save_department(dept_id, request.content)
    return {"id": dept_id, "updated": True}


@router.delete("/{dept_id}", dependencies=[Depends(verify_admin_token)])
async def delete_department(dept_id: str) -> dict:
    """
    Elimina un departamento del sistema.

    Requiere header: X-Admin-Token
    """
    deleted = department_service.delete_department(dept_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Department not found")
    return {"id": dept_id, "deleted": True}
