"""
Proveedor LLM para OpenAI (GPT-4).

Usa la librería oficial openai. La API key se toma de la configuración
central — nunca se hardcodea aquí.
"""

import logging

import httpx
from openai import AsyncOpenAI, APIConnectionError, APITimeoutError

from app.config import settings
from app.models.session import TokenUsage
from app.providers.base import ChatResult, LLMProvider

logger = logging.getLogger(__name__)

# Tiempo máximo de espera para una respuesta del modelo (segundos)
REQUEST_TIMEOUT_SECONDS = 60


class OpenAIProvider(LLMProvider):
    """
    Proveedor que conecta con la API de OpenAI para generar respuestas.

    Usa GPT-4 por defecto. El cliente se inicializa con la API key
    configurada en las variables de entorno.
    """

    def __init__(self) -> None:
        """Inicializa el cliente AsyncOpenAI con la API key y timeout configurados."""
        self.client = AsyncOpenAI(
            api_key=settings.openai_api_key,
            timeout=REQUEST_TIMEOUT_SECONDS,
        )
        self.model = "gpt-4o"

    async def chat(self, messages: list[dict], system_prompt: str) -> ChatResult:
        """
        Envía la conversación a OpenAI y devuelve la respuesta del modelo.

        Args:
            messages: Historial de mensajes en formato OpenAI
                      [{"role": "user"|"assistant", "content": str}].
            system_prompt: System prompt construido con perfiles y brief.

        Returns:
            ChatResult con el texto de la respuesta y el uso de tokens.

        Raises:
            APIConnectionError: Si no hay conexión con la API de OpenAI.
            APITimeoutError: Si la respuesta supera el timeout configurado.
        """
        full_messages = [{"role": "system", "content": system_prompt}] + messages

        logger.info(f"Enviando {len(messages)} mensajes a OpenAI ({self.model})")

        response = await self.client.chat.completions.create(
            model=self.model,
            messages=full_messages,
        )

        usage = None
        if response.usage:
            usage = TokenUsage(
                prompt_tokens=response.usage.prompt_tokens,
                completion_tokens=response.usage.completion_tokens,
                total_tokens=response.usage.total_tokens,
            )

        return ChatResult(response=response.choices[0].message.content, usage=usage)
