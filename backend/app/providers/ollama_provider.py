"""
Proveedor LLM para Ollama (modelos locales).

Usa httpx para llamar a la API REST de Ollama directamente.
La URL base y el modelo se configuran por variables de entorno,
lo que permite apuntar a Ollama en local o en otra máquina.
"""

import logging

import httpx

from app.config import settings
from app.models.session import TokenUsage
from app.providers.base import ChatResult, LLMProvider

logger = logging.getLogger(__name__)

REQUEST_TIMEOUT_SECONDS = 120  # Los modelos locales pueden ser más lentos


class OllamaProvider(LLMProvider):
    """
    Proveedor que conecta con un servidor Ollama para inferencia local.

    Ollama expone una API compatible con el formato de OpenAI en /api/chat,
    lo que hace la integración directa y sencilla.
    """

    def __init__(self) -> None:
        """Inicializa el proveedor con la URL base y modelo configurados en el entorno."""
        self.base_url = settings.ollama_base_url.rstrip("/")
        self.model = settings.ollama_model

    async def chat(self, messages: list[dict], system_prompt: str) -> ChatResult:
        """
        Envía la conversación al servidor Ollama y devuelve la respuesta.

        Args:
            messages: Historial de mensajes en formato {"role", "content"}.
            system_prompt: System prompt construido con perfiles y brief.

        Returns:
            Texto de la respuesta generada por el modelo local.

        Raises:
            httpx.ConnectError: Si Ollama no está disponible en la URL configurada.
            httpx.TimeoutException: Si el modelo tarda más del timeout configurado.
        """
        full_messages = [{"role": "system", "content": system_prompt}] + messages

        logger.info(f"Enviando {len(messages)} mensajes a Ollama ({self.model}) en {self.base_url}")

        async with httpx.AsyncClient(timeout=REQUEST_TIMEOUT_SECONDS) as client:
            response = await client.post(
                f"{self.base_url}/api/chat",
                json={
                    "model": self.model,
                    "messages": full_messages,
                    "stream": False,
                },
            )
            response.raise_for_status()

        data = response.json()
        usage = None
        prompt_tokens = data.get("prompt_eval_count")
        completion_tokens = data.get("eval_count")
        if prompt_tokens is not None and completion_tokens is not None:
            usage = TokenUsage(
                prompt_tokens=prompt_tokens,
                completion_tokens=completion_tokens,
                total_tokens=prompt_tokens + completion_tokens,
            )
        return ChatResult(response=data["message"]["content"], usage=usage)
