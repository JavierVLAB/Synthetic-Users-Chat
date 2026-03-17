"""
Proveedor LLM para Anthropic (Claude).

Usa la librería oficial anthropic. La API key se toma de la configuración
central. La integración sigue el patrón messages API de Anthropic donde
el system prompt va como parámetro separado, no como mensaje.
"""

import logging

from anthropic import AsyncAnthropic, APIConnectionError, APITimeoutError

from app.config import settings
from app.models.session import TokenUsage
from app.providers.base import ChatResult, LLMProvider

logger = logging.getLogger(__name__)

REQUEST_TIMEOUT_SECONDS = 60


class AnthropicProvider(LLMProvider):
    """
    Proveedor que conecta con la API de Anthropic para generar respuestas.

    Usa claude-3-5-sonnet por defecto. En la API de Anthropic el system
    prompt va como parámetro independiente (no como mensaje de sistema),
    por lo que lo separamos del historial.
    """

    def __init__(self) -> None:
        """Inicializa el cliente AsyncAnthropic con la API key y timeout configurados."""
        self.client = AsyncAnthropic(
            api_key=settings.anthropic_api_key,
            timeout=REQUEST_TIMEOUT_SECONDS,
        )
        self.model = "claude-sonnet-4-6"

    async def chat(self, messages: list[dict], system_prompt: str) -> ChatResult:
        """
        Envía la conversación a Anthropic y devuelve la respuesta del modelo.

        Args:
            messages: Historial de mensajes. Anthropic requiere que el primer
                      mensaje sea siempre de rol 'user'.
            system_prompt: System prompt construido con perfiles y brief.

        Returns:
            ChatResult con el texto de la respuesta y el uso de tokens.
        """
        logger.info(f"Enviando {len(messages)} mensajes a Anthropic ({self.model})")

        response = await self.client.messages.create(
            model=self.model,
            max_tokens=4096,
            system=system_prompt,
            messages=messages,
        )

        usage = None
        if response.usage:
            prompt_tokens = response.usage.input_tokens
            completion_tokens = response.usage.output_tokens
            usage = TokenUsage(
                prompt_tokens=prompt_tokens,
                completion_tokens=completion_tokens,
                total_tokens=prompt_tokens + completion_tokens,
            )

        return ChatResult(response=response.content[0].text, usage=usage)
