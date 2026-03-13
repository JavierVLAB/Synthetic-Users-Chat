"""
Interfaz base para todos los proveedores LLM.

Cada proveedor (OpenAI, Anthropic, Ollama) implementa esta clase.
El servicio de conversación solo conoce esta interfaz — no sabe
ni le importa qué proveedor está usando por debajo.
"""

from abc import ABC, abstractmethod


class LLMProvider(ABC):
    """
    Interfaz abstracta que deben implementar todos los proveedores LLM.

    El único método requerido es `chat`, que recibe el historial de mensajes
    y el system prompt, y devuelve la respuesta del modelo como string.
    """

    @abstractmethod
    async def chat(self, messages: list[dict], system_prompt: str) -> str:
        """
        Envía una conversación al LLM y devuelve la respuesta.

        Args:
            messages: Lista de mensajes en formato {"role": "user"|"assistant", "content": str}.
                      El orden es cronológico — el más antiguo primero.
            system_prompt: Instrucciones de sistema construidas desde la plantilla
                           con los perfiles y el brief interpolados.

        Returns:
            Texto de la respuesta generada por el modelo.

        Raises:
            LLMConnectionError: Si no se puede conectar con el proveedor.
            LLMTimeoutError: Si el proveedor no responde en el tiempo configurado.
        """
        ...
