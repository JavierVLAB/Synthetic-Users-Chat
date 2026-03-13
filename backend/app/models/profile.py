"""
Schemas Pydantic para perfiles de comportamiento.

Los perfiles son archivos YAML con estructura libre — estos schemas
solo cubren los campos mínimos que el sistema necesita para mostrarlos
en la UI. El contenido completo del archivo se pasa al LLM como texto.
"""

from typing import Any, Optional

from pydantic import BaseModel


class ProfileSummary(BaseModel):
    """Resumen de un perfil para mostrar en el dropdown de la UI."""

    id: str
    name: str
    descripcion: Optional[str] = None


class ProfileDetail(BaseModel):
    """Detalle completo de un perfil, incluyendo todo su contenido."""

    id: str
    content: dict[str, Any]


class ProfileWriteRequest(BaseModel):
    """
    Cuerpo de request para crear o actualizar un perfil (endpoints admin).

    El contenido es un diccionario libre — no se validan campos específicos.
    Solo se requiere que exista el campo 'name'.
    """

    content: dict[str, Any]
