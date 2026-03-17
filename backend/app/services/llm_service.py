"""
Servicio de conversación con el LLM.

Responsabilidades:
  1. Seleccionar el proveedor LLM correcto (factory)
  2. Construir el system prompt desde la plantilla y los perfiles
  3. Aplicar la ventana deslizante al historial de mensajes
  4. Manejar errores del LLM con mensajes amigables para el usuario

Este servicio es el único punto de contacto entre la lógica de negocio
y los proveedores LLM — los routers y servicios de sesión no llaman
a los proveedores directamente.
"""

import logging
import os

import httpx
import yaml
from fastapi import HTTPException

from app.config import settings
from app.providers.base import LLMProvider
from app.providers.openai_provider import OpenAIProvider
from app.providers.anthropic_provider import AnthropicProvider
from app.providers.ollama_provider import OllamaProvider
from app.providers.huggingface_provider import HuggingFaceProvider

logger = logging.getLogger(__name__)

# Ruta a la plantilla del system prompt
PROMPT_TEMPLATE_PATH = os.path.join(
    os.path.dirname(__file__), "..", "..", "prompts", "system_prompt_template.txt"
)

# Proveedores soportados y sus nombres legibles
SUPPORTED_PROVIDERS = {"openai", "anthropic", "ollama", "huggingface"}


def get_llm_provider(provider_name: str) -> LLMProvider:
    """
    Factory que devuelve la instancia del proveedor LLM solicitado.

    Args:
        provider_name: Nombre del proveedor ('openai', 'anthropic', 'ollama').

    Returns:
        Instancia del proveedor LLM correspondiente.

    Raises:
        HTTPException(400): Si el proveedor no está soportado.
    """
    if provider_name not in SUPPORTED_PROVIDERS:
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported LLM provider. Use: {', '.join(SUPPORTED_PROVIDERS)}",
        )

    providers = {
        "openai": OpenAIProvider,
        "anthropic": AnthropicProvider,
        "ollama": OllamaProvider,
        "huggingface": HuggingFaceProvider,
    }
    return providers[provider_name]()


def build_system_prompt(
    employee_profile_text: str,
    behavior_profile_text: str,
    brief_text: str,
    department_text: str | None = None,
) -> str:
    """
    Construye el system prompt interpolando la plantilla con los perfiles y el brief.

    La plantilla se lee del disco en cada llamada (sin caché) para que los cambios
    en el archivo se apliquen sin reiniciar el servidor.

    Args:
        employee_profile_text: Contenido completo del perfil de empleado como texto.
        behavior_profile_text: Contenido completo del perfil de comportamiento como texto.
        brief_text: Contenido completo del brief de producto como texto.
        department_text: Contenido del departamento (opcional). Si se provee, se incluye
                         como sección con cabecera en el prompt.

    Returns:
        System prompt completo listo para enviar al LLM.

    Raises:
        FileNotFoundError: Si la plantilla de prompt no existe.
    """
    if not os.path.exists(PROMPT_TEMPLATE_PATH):
        raise FileNotFoundError(
            f"System prompt template not found at prompts/system_prompt_template.txt"
        )

    with open(PROMPT_TEMPLATE_PATH, "r", encoding="utf-8") as f:
        template = f.read()

    # Construir la sección de departamento solo si se ha seleccionado uno
    if department_text:
        dept_section = (
            "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n"
            "DEPARTAMENTO EN EL QUE TRABAJAS\n"
            "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n"
            f"{department_text}\n\n"
        )
    else:
        dept_section = ""

    # Extraer datos_de_uso del brief si existe
    datos_de_uso_section = ""
    try:
        brief_parsed = yaml.safe_load(brief_text)
        if isinstance(brief_parsed, dict):
            datos = brief_parsed.get("datos_de_uso", "")
            if datos and str(datos).strip():
                datos_de_uso_section = (
                    "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n"
                    "DATOS REALES DE USO (úsalos como referencia, no los inventes)\n"
                    "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n"
                    f"{str(datos).strip()}\n\n"
                )
    except Exception:
        pass  # Si el brief no es YAML válido, ignorar datos_de_uso

    return template.format_map({
        "perfil_empleado": employee_profile_text,
        "perfil_comportamiento": behavior_profile_text,
        "brief_producto": brief_text,
        "departamento": dept_section,
        "datos_de_uso": datos_de_uso_section,
    })


def apply_context_window(messages: list[dict]) -> list[dict]:
    """
    Aplica la ventana deslizante al historial de mensajes.

    Mantiene solo los últimos MAX_CONTEXT_MESSAGES mensajes para evitar
    superar el límite de tokens del LLM. El system prompt se envía siempre
    independientemente del tamaño del historial.

    Args:
        messages: Lista completa de mensajes de la sesión.

    Returns:
        Lista recortada con los mensajes más recientes.
    """
    max_messages = settings.max_context_messages

    if len(messages) <= max_messages:
        return messages

    logger.info(
        f"Historial recortado: {len(messages)} → {max_messages} mensajes "
        f"(ventana deslizante MAX_CONTEXT_MESSAGES={max_messages})"
    )
    return messages[-max_messages:]


def build_questionnaire_message(questions: list[str]) -> str:
    """
    Construye el mensaje que agrupa todas las preguntas del cuestionario.

    Formatea las preguntas con instrucciones para que el LLM las responda
    todas de forma numerada y ordenada.

    Args:
        questions: Lista de preguntas del cuestionario.

    Returns:
        Mensaje formateado listo para enviar al LLM como mensaje de usuario.
    """
    numbered_questions = "\n".join(
        f"{i + 1}. {question}" for i, question in enumerate(questions)
    )
    return (
        "Por favor, responde a todas las siguientes preguntas de forma numerada, "
        "siguiendo el mismo orden. Responde cada una desde tu perspectiva como usuario.\n\n"
        f"{numbered_questions}"
    )


async def generate_response(
    messages: list[dict],
    provider_name: str,
    system_prompt: str,
) -> str:
    """
    Genera una respuesta del LLM con manejo de errores.

    Envuelve la llamada al proveedor capturando los errores comunes
    y convirtiéndolos en HTTPExceptions con mensajes amigables para el usuario.
    Los detalles técnicos del error se registran en los logs del servidor.

    Args:
        messages: Historial de mensajes de la sesión (se aplica ventana deslizante).
        provider_name: Nombre del proveedor LLM a usar.
        system_prompt: System prompt completo interpolado.

    Returns:
        Texto de la respuesta generada.

    Raises:
        HTTPException(502): Si hay error de conexión con el proveedor.
        HTTPException(504): Si el proveedor supera el timeout.
    """
    provider = get_llm_provider(provider_name)
    windowed_messages = apply_context_window(messages)

    try:
        response = await provider.chat(windowed_messages, system_prompt)
        return response

    except httpx.TimeoutException as error:
        logger.error(f"Timeout del proveedor LLM '{provider_name}': {error}")
        raise HTTPException(
            status_code=504,
            detail="El modelo tardó demasiado en responder. Inténtalo de nuevo.",
        )

    except httpx.ConnectError as error:
        logger.error(f"Error de conexión con el proveedor LLM '{provider_name}': {error}")
        raise HTTPException(
            status_code=502,
            detail="No se pudo conectar con el modelo de IA. Contacta con el administrador.",
        )

    except Exception as error:
        # Capturamos cualquier otro error del proveedor (API key inválida, etc.)
        logger.error(f"Error inesperado del proveedor LLM '{provider_name}': {error}", exc_info=True)
        raise HTTPException(
            status_code=502,
            detail="No se pudo conectar con el modelo de IA. Contacta con el administrador.",
        )
