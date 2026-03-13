"""
Servicio de generación de PDF para informes de sesión.

Genera el PDF usando WeasyPrint a partir de una plantilla HTML+CSS.
El informe incluye: perfil de comportamiento, brief del producto
y la conversación completa con etiquetas 'Investigador' / 'Usuario sintético'.

WeasyPrint no soporta fuentes .otf locales sin configuración adicional,
por lo que el PDF usa la familia sans-serif del sistema como fallback.
"""

import logging
import os
from typing import Any, Optional

import yaml
from jinja2 import Environment, FileSystemLoader
from weasyprint import HTML

logger = logging.getLogger(__name__)

# Directorio donde está la plantilla HTML del informe
TEMPLATES_DIR = os.path.join(os.path.dirname(__file__), "..", "..", "templates")

# Prefijo que identifica los mensajes de cuestionario en el historial
QUESTIONNAIRE_PREFIX = "Por favor, responde a todas las siguientes preguntas"


def _format_timestamp(iso_timestamp: str) -> str:
    """
    Extrae la hora HH:MM de un timestamp ISO 8601.

    Args:
        iso_timestamp: Timestamp en formato '2026-03-12T14:30:00+00:00'.

    Returns:
        Hora en formato 'HH:MM'.
    """
    try:
        # El timestamp tiene formato ISO 8601 — tomamos los caracteres de hora
        time_part = iso_timestamp[11:16]
        return time_part
    except (IndexError, TypeError):
        return ""


def _summarize_content(content: Optional[dict[str, Any]]) -> str:
    """
    Extrae un resumen corto de un perfil o brief para el PDF.

    Muestra el campo 'descripcion' y, si existe, un segundo campo relevante
    ('motivaciones' para perfiles, 'propuesta_de_valor' para briefs).
    Si ninguno de esos campos existe, coge los dos primeros campos no-meta.

    Args:
        content: Diccionario con el contenido del perfil o brief.

    Returns:
        Texto de resumen de 1-2 párrafos para mostrar en el PDF.
    """
    if not content:
        return "Información no disponible."

    skip_keys = {"placeholder", "name"}
    priority_keys = ["descripcion", "motivaciones", "propuesta_de_valor"]

    lines = []
    # Primero los campos prioritarios que existan
    for key in priority_keys:
        if key in content and key not in skip_keys:
            lines.append(content[key].strip())
        if len(lines) == 2:
            break

    # Si no había suficientes, rellenar con los primeros campos disponibles
    if len(lines) < 2:
        for key, value in content.items():
            if key in skip_keys or key in priority_keys:
                continue
            lines.append(str(value).strip())
            if len(lines) == 2:
                break

    return "\n\n".join(lines) if lines else "Información no disponible."


def generate_session_pdf(
    session: dict,
    messages: list[dict],
    profile: Optional[dict],
    brief: Optional[dict],
) -> bytes:
    """
    Genera el PDF del informe de sesión.

    Args:
        session: Metadatos de la sesión (session_id, profile_id, brief_id, created_at).
        messages: Lista de mensajes de la conversación en orden cronológico.
        profile: Contenido del perfil de comportamiento (id + content).
        brief: Contenido del brief del producto (id + content).

    Returns:
        Bytes del PDF generado, listos para devolver al cliente.
    """
    logger.info(f"Generando PDF para sesión: {session['session_id']}")

    # Preparar resúmenes cortos del perfil y brief para la plantilla
    profile_content = _summarize_content(profile.get("content") if profile else None)
    brief_content = _summarize_content(brief.get("content") if brief else None)

    # Preparar los mensajes para la plantilla, identificando cuestionarios
    template_messages = []
    for msg in messages:
        is_questionnaire = (
            msg["role"] == "user"
            and msg["content"].startswith(QUESTIONNAIRE_PREFIX)
        )
        template_messages.append({
            "role": msg["role"],
            "content": msg["content"],
            "time": _format_timestamp(msg["timestamp"]),
            "is_questionnaire": is_questionnaire,
        })

    # Fecha de la sesión en formato legible
    session_date = session["created_at"][:10]  # '2026-03-12'

    # Renderizar la plantilla HTML con Jinja2
    env = Environment(loader=FileSystemLoader(TEMPLATES_DIR))
    template = env.get_template("session_report.html")
    html_content = template.render(
        session=session,
        session_date=session_date,
        profile_content=profile_content,
        brief_content=brief_content,
        messages=template_messages,
        message_count=len(template_messages),
    )

    # Generar PDF desde el HTML con WeasyPrint
    pdf_bytes = HTML(string=html_content).write_pdf()

    logger.info(f"PDF generado: {len(pdf_bytes)} bytes")
    return pdf_bytes
