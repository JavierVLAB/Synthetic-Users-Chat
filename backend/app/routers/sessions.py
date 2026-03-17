"""
Router de sesiones — el núcleo de la aplicación.

Gestiona el ciclo de vida completo de una sesión de investigación:
creación, conversación, cuestionarios, generación de PDF y cierre.

Endpoints:
  GET    /sessions                     — listar todas las sesiones (historial)
  POST   /sessions                     — crear sesión
  GET    /sessions/{id}                — estado y historial
  DELETE /sessions/{id}                — cerrar sesión
  POST   /sessions/{id}/chat           — enviar mensaje
  POST   /sessions/{id}/questionnaire  — enviar cuestionario
  GET    /sessions/{id}/pdf            — descargar PDF
"""

import json
import logging
import uuid
from typing import Optional

from fastapi import APIRouter, HTTPException, Request
from fastapi.responses import StreamingResponse
from slowapi import Limiter
from slowapi.util import get_remote_address

from app.config import settings
from app.db import queries
from app.models.questionnaire import QuestionnaireRequest, QuestionnaireResponse
from app.models.session import (
    ChatRequest,
    ChatResponse,
    CreateSessionRequest,
    PromptOverrides,
    PromptSections,
    SessionListItem,
    SessionResponse,
)
from app.services import brief_service, llm_service, pdf_service, profile_service

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/sessions", tags=["Sesiones"])
limiter = Limiter(key_func=get_remote_address)


# ── Helpers ───────────────────────────────────────────────────────────────────


async def get_active_session(session_id: str) -> dict:
    """
    Recupera una sesión verificando que existe y está activa (no cerrada).

    Args:
        session_id: UUID de la sesión.

    Returns:
        Datos de la sesión como diccionario.

    Raises:
        HTTPException(404): Si la sesión no existe.
        HTTPException(409): Si la sesión ya está cerrada.
    """
    session = await queries.get_session(session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    if session.get("closed_at"):
        raise HTTPException(status_code=409, detail="Session is closed")
    return session


def _enrich_session(session: dict) -> dict:
    """
    Añade los nombres legibles de perfil, brief y departamento a los datos de sesión.

    Args:
        session: Diccionario de sesión con IDs.

    Returns:
        Diccionario enriquecido con campos *_name.
    """
    profile = profile_service.get_behavior_profile(session["profile_id"])
    brief = brief_service.get_brief(session["brief_id"])

    profile_name = profile["content"].get("name", session["profile_id"]) if profile else session["profile_id"]
    brief_name = brief["content"].get("name", session["brief_id"]) if brief else session["brief_id"]

    dept_name = None
    if session.get("department_id"):
        try:
            from app.services import department_service
            dept = department_service.get_department(session["department_id"])
            if dept:
                dept_name = dept["content"].get("name", session["department_id"])
        except Exception:
            pass

    return {**session, "profile_name": profile_name, "brief_name": brief_name, "department_name": dept_name}


async def build_system_prompt_for_session(
    session: dict,
    overrides: Optional[PromptOverrides] = None,
) -> tuple[str, PromptSections]:
    """
    Construye el system prompt completo para una sesión cargando sus perfiles y brief.

    Args:
        session: Datos de la sesión (profile_id, brief_id, department_id).
        overrides: Overrides opcionales para sustituir el texto de cada sección.

    Returns:
        Tupla (system_prompt, sections) con el prompt interpolado y los textos resueltos.

    Raises:
        HTTPException(500): Si no se pueden cargar los perfiles o el brief.
    """
    employee_text = profile_service.load_employee_profile()

    behavior_text = (overrides and overrides.profile_text) or profile_service.get_behavior_profile_as_text(session["profile_id"])
    if not behavior_text:
        raise HTTPException(status_code=500, detail=f"Profile '{session['profile_id']}' not found")

    brief_text = (overrides and overrides.brief_text) or brief_service.get_brief_as_text(session["brief_id"])
    if not brief_text:
        raise HTTPException(status_code=500, detail=f"Brief '{session['brief_id']}' not found")

    department_text = None
    if overrides and overrides.department_text is not None:
        department_text = overrides.department_text
    elif session.get("department_id"):
        try:
            from app.services import department_service
            department_text = department_service.get_department_as_text(session["department_id"])
        except Exception:
            pass

    system_prompt = llm_service.build_system_prompt(employee_text, behavior_text, brief_text, department_text)
    sections = PromptSections(
        profile_text=behavior_text,
        brief_text=brief_text,
        department_text=department_text,
    )
    return system_prompt, sections


# ── Endpoints ─────────────────────────────────────────────────────────────────


@router.get("", response_model=list[SessionListItem])
async def list_all_sessions() -> list[SessionListItem]:
    """
    Lista todas las sesiones de investigación con datos enriquecidos.

    Usada por el sidebar del historial de conversaciones. Devuelve sesiones
    ordenadas de más reciente a más antigua, con nombre legible de perfil,
    brief y departamento, y conteo de mensajes.
    """
    raw_sessions = await queries.list_sessions()
    result = []
    for s in raw_sessions:
        enriched = _enrich_session(s)
        result.append(SessionListItem(
            session_id=enriched["session_id"],
            profile_id=enriched["profile_id"],
            profile_name=enriched.get("profile_name") or enriched["profile_id"],
            brief_id=enriched["brief_id"],
            brief_name=enriched.get("brief_name") or enriched["brief_id"],
            department_id=enriched.get("department_id"),
            department_name=enriched.get("department_name"),
            llm_provider=enriched["llm_provider"],
            created_at=enriched["created_at"],
            closed_at=enriched.get("closed_at"),
            message_count=enriched.get("message_count", 0),
            status="closed" if enriched.get("closed_at") else "active",
        ))
    return result


@router.post("", response_model=SessionResponse, status_code=201)
@limiter.limit("10/minute")
async def create_session(request: Request, body: CreateSessionRequest) -> SessionResponse:
    """
    Crea una nueva sesión de investigación.

    Genera un UUID único, verifica que el perfil, brief y departamento existen,
    y persiste la sesión en la base de datos.
    """
    # Verificar que el perfil existe antes de crear la sesión
    if not profile_service.get_behavior_profile(body.profile_id):
        raise HTTPException(status_code=404, detail="Profile not found")

    # Verificar que el brief existe
    if not brief_service.get_brief(body.brief_id):
        raise HTTPException(status_code=404, detail="Brief not found")

    # Verificar el departamento si se especifica (es opcional)
    if body.department_id:
        try:
            from app.services import department_service
            if not department_service.get_department(body.department_id):
                raise HTTPException(status_code=404, detail="Department not found")
        except HTTPException:
            raise
        except Exception:
            raise HTTPException(status_code=404, detail="Department not found")

    # El proveedor LLM puede venir del body o del entorno
    provider = body.llm_provider or settings.llm_provider

    # Validar que el proveedor es soportado
    llm_service.get_llm_provider(provider)  # Lanza HTTPException(400) si no es válido

    session_id = str(uuid.uuid4())
    session = await queries.create_session(
        session_id, body.profile_id, body.brief_id, provider, body.department_id
    )

    enriched = _enrich_session(session)
    return SessionResponse(**enriched)


@router.get("/{session_id}", response_model=SessionResponse)
async def get_session(session_id: str) -> SessionResponse:
    """
    Devuelve el estado y el historial completo de una sesión.

    El historial incluye todos los mensajes en orden cronológico.
    Los nombres legibles de perfil, brief y departamento se incluyen en la respuesta.
    """
    session = await queries.get_session(session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")

    messages = await queries.get_messages(session_id)
    enriched = _enrich_session(session)
    return SessionResponse(**enriched, messages=messages)


@router.delete("/{session_id}")
async def close_session(session_id: str) -> dict:
    """
    Cierra una sesión registrando el timestamp de cierre.

    Una sesión cerrada no acepta nuevos mensajes ni cuestionarios.
    """
    session = await queries.get_session(session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")

    await queries.close_session(session_id)
    return {"session_id": session_id, "closed": True}


@router.post("/{session_id}/chat", response_model=ChatResponse)
@limiter.limit("30/minute")
async def send_message(
    request: Request, session_id: str, body: ChatRequest
) -> ChatResponse:
    """
    Envía un mensaje del investigador al usuario sintético y obtiene respuesta.

    Flujo:
      1. Verifica que la sesión está activa
      2. Persiste el mensaje del investigador
      3. Construye el system prompt y el historial con ventana deslizante
      4. Llama al LLM y persiste la respuesta
      5. Devuelve ambos mensajes al cliente
    """
    session = await get_active_session(session_id)

    # Guardar el mensaje del investigador
    user_message = await queries.save_message(session_id, "user", body.message)

    # Recuperar historial y construir contexto para el LLM
    all_messages = await queries.get_messages(session_id)
    system_prompt, sections = await build_system_prompt_for_session(session, body.overrides)

    # Convertir al formato que espera el LLM (solo role y content)
    llm_messages = [{"role": m["role"], "content": m["content"]} for m in all_messages]

    # Aplicar ventana deslizante para saber exactamente qué se envió al LLM
    from app.services.llm_service import apply_context_window
    messages_sent = apply_context_window(llm_messages)

    # Generar respuesta del usuario sintético
    chat_result = await llm_service.generate_response(
        messages=llm_messages,
        provider_name=session["llm_provider"],
        system_prompt=system_prompt,
    )

    # Guardar y devolver la respuesta con datos de debug
    assistant_message = await queries.save_message(
        session_id, "assistant", chat_result.response,
        system_prompt=system_prompt,
        messages_sent=json.dumps(messages_sent),
        prompt_tokens=chat_result.usage.prompt_tokens if chat_result.usage else None,
        completion_tokens=chat_result.usage.completion_tokens if chat_result.usage else None,
        total_tokens=chat_result.usage.total_tokens if chat_result.usage else None,
    )

    return ChatResponse(
        session_id=session_id,
        user_message=user_message,
        assistant_message=assistant_message,
        system_prompt=system_prompt,
        usage=chat_result.usage,
        messages_sent=messages_sent,
        sections=sections,
    )


@router.post("/{session_id}/questionnaire", response_model=QuestionnaireResponse)
async def send_questionnaire(
    session_id: str, body: QuestionnaireRequest
) -> QuestionnaireResponse:
    """
    Envía un cuestionario al usuario sintético para que lo responda de una vez.

    Las preguntas se agrupan en un único mensaje y el LLM las responde
    todas en orden numerado. Tras la respuesta, la conversación puede
    continuar en modo chat libre normal.
    """
    session = await get_active_session(session_id)

    # Construir el mensaje agrupado con las preguntas
    questionnaire_text = llm_service.build_questionnaire_message(body.questions)

    # Guardar el mensaje de cuestionario como si fuera del investigador
    questionnaire_message = await queries.save_message(session_id, "user", questionnaire_text)

    # Recuperar historial (incluye ya el mensaje de cuestionario recién guardado)
    all_messages = await queries.get_messages(session_id)
    system_prompt, _ = await build_system_prompt_for_session(session)

    llm_messages = [{"role": m["role"], "content": m["content"]} for m in all_messages]

    # Generar respuesta
    chat_result = await llm_service.generate_response(
        messages=llm_messages,
        provider_name=session["llm_provider"],
        system_prompt=system_prompt,
    )

    assistant_message = await queries.save_message(session_id, "assistant", chat_result.response)

    return QuestionnaireResponse(
        session_id=session_id,
        questionnaire_message=questionnaire_message,
        assistant_message=assistant_message,
    )


@router.get("/{session_id}/pdf")
async def download_session_pdf(session_id: str) -> StreamingResponse:
    """
    Genera y descarga el informe PDF de una sesión.

    El PDF incluye: perfil de comportamiento, brief del producto
    y conversación completa con etiquetas 'Investigador' / 'Usuario sintético'.
    Disponible tanto para sesiones activas como cerradas.
    """
    session = await queries.get_session(session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")

    messages = await queries.get_messages(session_id)

    # Cargar los datos completos del perfil y brief para incluir en el PDF
    profile_content = profile_service.get_behavior_profile(session["profile_id"])
    brief_content = brief_service.get_brief(session["brief_id"])

    pdf_bytes = pdf_service.generate_session_pdf(
        session=session,
        messages=messages,
        profile=profile_content,
        brief=brief_content,
    )

    filename = f"sesion-{session_id[:8]}-{session['created_at'][:10]}.pdf"

    return StreamingResponse(
        iter([pdf_bytes]),
        media_type="application/pdf",
        headers={"Content-Disposition": f'attachment; filename="{filename}"'},
    )
