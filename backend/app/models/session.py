"""
Schemas Pydantic para sesiones y conversación.

Define la forma de los datos que entran y salen de los endpoints
de sesiones, chat y cuestionarios.
"""

from typing import Optional

from pydantic import BaseModel, Field


class CreateSessionRequest(BaseModel):
    """Datos necesarios para iniciar una nueva sesión."""

    profile_id: str = Field(..., description="ID del perfil de comportamiento seleccionado")
    brief_id: str = Field(..., description="ID del brief de producto seleccionado")
    llm_provider: Optional[str] = Field(
        default=None,
        description="Proveedor LLM a usar. Si no se especifica, se usa el configurado en LLM_PROVIDER.",
    )


class SessionResponse(BaseModel):
    """Datos de una sesión devueltos al cliente."""

    session_id: str
    profile_id: str
    brief_id: str
    llm_provider: str
    created_at: str
    closed_at: Optional[str] = None
    messages: Optional[list[dict]] = None


class ChatRequest(BaseModel):
    """Mensaje enviado por el investigador al usuario sintético."""

    message: str = Field(..., min_length=1, description="Texto del mensaje del investigador")


class ChatResponse(BaseModel):
    """Respuesta del usuario sintético al investigador."""

    session_id: str
    user_message: dict
    assistant_message: dict
