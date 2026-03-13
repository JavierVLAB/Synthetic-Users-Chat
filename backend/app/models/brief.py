"""
Schemas Pydantic para briefs de producto.

Los briefs son archivos YAML con estructura libre — igual que los perfiles,
estos schemas solo cubren los campos mínimos necesarios para la UI.
El contenido completo se pasa al LLM como texto.
"""

from typing import Any, Optional

from pydantic import BaseModel


class BriefSummary(BaseModel):
    """Resumen de un brief para mostrar en el dropdown de la UI."""

    id: str
    name: str
    descripcion: Optional[str] = None


class BriefDetail(BaseModel):
    """Detalle completo de un brief, incluyendo todo su contenido."""

    id: str
    content: dict[str, Any]


class BriefWriteRequest(BaseModel):
    """
    Cuerpo de request para crear o actualizar un brief (endpoints admin).

    El contenido es un diccionario libre. Solo se requiere el campo 'name'.
    """

    content: dict[str, Any]
