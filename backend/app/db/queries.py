"""
Funciones de acceso a datos para sessions y messages.

Toda la lógica de SQL está aquí — los servicios y routers nunca
escriben SQL directamente. Cada función tiene una responsabilidad única.
"""

import logging
from datetime import datetime, timezone
from typing import Optional

import aiosqlite

from app.db.database import get_db_path

logger = logging.getLogger(__name__)


# ── Sessions ──────────────────────────────────────────────────────────────────


async def create_session(
    session_id: str,
    profile_id: str,
    brief_id: str,
    llm_provider: str,
    department_id: Optional[str] = None,
) -> dict:
    """
    Inserta una nueva sesión en la base de datos.

    Args:
        session_id: UUID único generado por el cliente.
        profile_id: Identificador del perfil de comportamiento seleccionado.
        brief_id: Identificador del brief de producto seleccionado.
        llm_provider: Proveedor LLM a usar en esta sesión (openai, anthropic, ollama).
        department_id: Identificador del departamento (opcional).

    Returns:
        Diccionario con los datos de la sesión recién creada.
    """
    created_at = datetime.now(timezone.utc).isoformat()

    async with aiosqlite.connect(get_db_path()) as db:
        await db.execute(
            """
            INSERT INTO sessions (session_id, profile_id, brief_id, llm_provider, created_at, department_id)
            VALUES (?, ?, ?, ?, ?, ?)
            """,
            (session_id, profile_id, brief_id, llm_provider, created_at, department_id),
        )
        await db.commit()

    logger.info(f"Sesión creada: {session_id} (perfil={profile_id}, brief={brief_id}, dept={department_id})")
    return {
        "session_id": session_id,
        "profile_id": profile_id,
        "brief_id": brief_id,
        "department_id": department_id,
        "llm_provider": llm_provider,
        "created_at": created_at,
        "closed_at": None,
    }


async def get_session(session_id: str) -> Optional[dict]:
    """
    Recupera los metadatos de una sesión por su ID.

    Args:
        session_id: UUID de la sesión a buscar.

    Returns:
        Diccionario con los datos de la sesión, o None si no existe.
    """
    async with aiosqlite.connect(get_db_path()) as db:
        db.row_factory = aiosqlite.Row
        async with db.execute(
            "SELECT * FROM sessions WHERE session_id = ?",
            (session_id,),
        ) as cursor:
            row = await cursor.fetchone()

    return dict(row) if row else None


async def list_sessions() -> list[dict]:
    """
    Lista todas las sesiones ordenadas por fecha de creación descendente.
    Incluye el conteo de mensajes por sesión.

    Returns:
        Lista de diccionarios con metadatos de sesión y message_count.
    """
    async with aiosqlite.connect(get_db_path()) as db:
        db.row_factory = aiosqlite.Row
        async with db.execute(
            """
            SELECT
                s.session_id,
                s.profile_id,
                s.brief_id,
                s.department_id,
                s.llm_provider,
                s.created_at,
                s.closed_at,
                COUNT(m.id) AS message_count
            FROM sessions s
            LEFT JOIN messages m ON s.session_id = m.session_id
            GROUP BY s.session_id
            ORDER BY s.created_at DESC
            """
        ) as cursor:
            rows = await cursor.fetchall()

    return [dict(row) for row in rows]


async def close_session(session_id: str) -> None:
    """
    Marca una sesión como cerrada registrando el timestamp de cierre.

    Args:
        session_id: UUID de la sesión a cerrar.
    """
    closed_at = datetime.now(timezone.utc).isoformat()

    async with aiosqlite.connect(get_db_path()) as db:
        await db.execute(
            "UPDATE sessions SET closed_at = ? WHERE session_id = ?",
            (closed_at, session_id),
        )
        await db.commit()

    logger.info(f"Sesión cerrada: {session_id}")


# ── Messages ──────────────────────────────────────────────────────────────────


async def save_message(
    session_id: str,
    role: str,
    content: str,
    system_prompt: Optional[str] = None,
    messages_sent: Optional[str] = None,
    prompt_tokens: Optional[int] = None,
    completion_tokens: Optional[int] = None,
    total_tokens: Optional[int] = None,
) -> dict:
    """
    Persiste un mensaje en la conversación.

    Args:
        session_id: UUID de la sesión a la que pertenece el mensaje.
        role: Quién envió el mensaje — 'user' (investigador) o 'assistant' (usuario sintético).
        content: Texto completo del mensaje.
        system_prompt: System prompt enviado al LLM en este turno (solo mensajes assistant).
        messages_sent: JSON con los mensajes exactos enviados al LLM (ventana deslizante).
        prompt_tokens: Tokens de entrada consumidos.
        completion_tokens: Tokens de salida consumidos.
        total_tokens: Total de tokens consumidos.

    Returns:
        Diccionario con los datos del mensaje guardado, incluyendo su id y timestamp.
    """
    timestamp = datetime.now(timezone.utc).isoformat()

    async with aiosqlite.connect(get_db_path()) as db:
        cursor = await db.execute(
            """
            INSERT INTO messages (
                session_id, role, content, timestamp,
                system_prompt, messages_sent, prompt_tokens, completion_tokens, total_tokens
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            """,
            (session_id, role, content, timestamp,
             system_prompt, messages_sent, prompt_tokens, completion_tokens, total_tokens),
        )
        await db.commit()
        message_id = cursor.lastrowid

    return {
        "id": message_id,
        "session_id": session_id,
        "role": role,
        "content": content,
        "timestamp": timestamp,
        "system_prompt": system_prompt,
        "messages_sent": messages_sent,
        "prompt_tokens": prompt_tokens,
        "completion_tokens": completion_tokens,
        "total_tokens": total_tokens,
    }


async def get_messages(session_id: str) -> list[dict]:
    """
    Recupera todos los mensajes de una sesión en orden cronológico.

    Args:
        session_id: UUID de la sesión cuyos mensajes se quieren obtener.

    Returns:
        Lista de mensajes ordenados por timestamp ascendente (el más antiguo primero).
    """
    async with aiosqlite.connect(get_db_path()) as db:
        db.row_factory = aiosqlite.Row
        async with db.execute(
            "SELECT * FROM messages WHERE session_id = ? ORDER BY id ASC",
            (session_id,),
        ) as cursor:
            rows = await cursor.fetchall()

    return [dict(row) for row in rows]
