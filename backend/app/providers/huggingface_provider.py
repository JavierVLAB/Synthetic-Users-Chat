"""
Proveedor LLM para HuggingFace Inference API (router nscale).

Usa la API compatible con OpenAI disponible en el router de HuggingFace.
El modelo y la API key se configuran por variables de entorno.

Endpoint: https://router.huggingface.co/nscale/v1/chat/completions
"""

import logging

import httpx

from app.config import settings
from app.providers.base import LLMProvider

logger = logging.getLogger(__name__)

HF_ROUTER_URL = "https://router.huggingface.co/nscale/v1/chat/completions"
REQUEST_TIMEOUT_SECONDS = 120


class HuggingFaceProvider(LLMProvider):
    """
    Proveedor que conecta con el router de inferencia de HuggingFace (nscale).

    Usa la API compatible con OpenAI, por lo que el formato de mensajes
    es idéntico al de OpenAIProvider.
    """

    def __init__(self) -> None:
        self.api_key = settings.hf_api_key
        # El nombre puede incluir el sufijo ":nscale" para identificar el proveedor,
        # pero la API solo acepta el nombre del modelo sin ese sufijo.
        self.model = settings.hf_model.split(":")[0]

    async def chat(self, messages: list[dict], system_prompt: str) -> str:
        """
        Envía la conversación al router de HuggingFace y devuelve la respuesta.

        Args:
            messages: Historial de mensajes en formato {"role", "content"}.
            system_prompt: System prompt construido con perfiles y brief.

        Returns:
            Texto de la respuesta generada por el modelo.

        Raises:
            httpx.ConnectError: Si el router de HF no está disponible.
            httpx.TimeoutException: Si el modelo supera el timeout configurado.
        """
        full_messages = [{"role": "system", "content": system_prompt}] + messages

        logger.info(f"Enviando {len(messages)} mensajes a HuggingFace ({self.model})")

        async with httpx.AsyncClient(timeout=REQUEST_TIMEOUT_SECONDS) as client:
            response = await client.post(
                HF_ROUTER_URL,
                headers={
                    "Authorization": f"Bearer {self.api_key}",
                    "Content-Type": "application/json",
                },
                json={
                    "model": self.model,
                    "messages": full_messages,
                },
            )
            response.raise_for_status()

        data = response.json()
        return data["choices"][0]["message"]["content"]
