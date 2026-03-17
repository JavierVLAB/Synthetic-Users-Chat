"""
Schemas Pydantic para sesiones y conversación.

Define la forma de los datos que entran y salen de los endpoints
de sesiones, chat y cuestionarios.
"""

from typing import Optional

from pydantic import BaseModel, Field


class TokenUsage(BaseModel):
    """Conteo de tokens consumidos en un turno de conversación."""

    prompt_tokens: int
    completion_tokens: int
    total_tokens: int


class CreateSessionRequest(BaseModel):
    """Datos necesarios para iniciar una nueva sesión."""

    profile_id: str = Field(..., description="ID del perfil de comportamiento seleccionado")
    brief_id: str = Field(..., description="ID del brief de producto seleccionado")
    department_id: Optional[str] = Field(
        default=None,
        description="ID del departamento de Moeve (opcional).",
    )
    llm_provider: Optional[str] = Field(
        default=None,
        description="Proveedor LLM a usar. Si no se especifica, se usa el configurado en LLM_PROVIDER.",
    )


class SessionResponse(BaseModel):
    """Datos de una sesión devueltos al cliente."""

    session_id: str
    profile_id: str
    brief_id: str
    department_id: Optional[str] = None
    llm_provider: str
    created_at: str
    closed_at: Optional[str] = None
    messages: Optional[list[dict]] = None
    profile_name: Optional[str] = None
    brief_name: Optional[str] = None
    department_name: Optional[str] = None


class SessionListItem(BaseModel):
    """Resumen de sesión para la lista del sidebar de historial."""

    session_id: str
    profile_id: str
    profile_name: str
    brief_id: str
    brief_name: str
    department_id: Optional[str] = None
    department_name: Optional[str] = None
    llm_provider: str
    created_at: str
    closed_at: Optional[str] = None
    message_count: int
    status: str  # "active" | "closed"


class PromptSections(BaseModel):
    """Textos resueltos de las secciones que componen el system prompt."""

    profile_text: str
    brief_text: str
    department_text: Optional[str] = None


class PromptOverrides(BaseModel):
    """Overrides opcionales por sesión para sustituir el texto de cada sección del prompt."""

    profile_text: Optional[str] = None
    brief_text: Optional[str] = None
    department_text: Optional[str] = None


class ChatRequest(BaseModel):
    """Mensaje enviado por el investigador al usuario sintético."""

    message: str = Field(..., min_length=1, description="Texto del mensaje del investigador")
    overrides: Optional[PromptOverrides] = Field(
        default=None,
        description="Overrides opcionales para sustituir el texto de las secciones del prompt.",
    )


class ChatResponse(BaseModel):
    """Respuesta del usuario sintético al investigador."""

    session_id: str
    user_message: dict
    assistant_message: dict
    system_prompt: str
    usage: Optional[TokenUsage] = None
    messages_sent: list[dict] = Field(default_factory=list)
    sections: Optional[PromptSections] = None
