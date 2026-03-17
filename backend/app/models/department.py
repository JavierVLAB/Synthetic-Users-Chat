"""
Schemas Pydantic para departamentos de Moeve.
"""

from typing import Any, Optional

from pydantic import BaseModel


class DepartmentSummary(BaseModel):
    """Resumen de departamento para listados y dropdowns."""

    id: str
    name: str
    descripcion: Optional[str] = None


class DepartmentDetail(BaseModel):
    """Detalle completo de un departamento."""

    id: str
    content: dict[str, Any]


class DepartmentWriteRequest(BaseModel):
    """Datos para crear o actualizar un departamento."""

    content: dict[str, Any]
