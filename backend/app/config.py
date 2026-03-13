"""
Configuración central de la aplicación.

Lee las variables de entorno desde el archivo .env en la raíz del proyecto.
La ruta al .env se resuelve de forma absoluta relativa a este archivo,
para que funcione independientemente del directorio de trabajo desde el
que se arranque el servidor (backend/, raíz del proyecto, Docker, etc.).

El resto de módulos importan la instancia `settings` de aquí — nunca leen
os.environ directamente — para que la configuración esté en un único lugar.
"""

import os

from pydantic_settings import BaseSettings

# El .env vive en la raíz del monorepo: backend/app/config.py → ../../.env
_ROOT_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
_ENV_FILE = os.path.join(_ROOT_DIR, ".env")


class Settings(BaseSettings):
    """
    Configuración de la aplicación cargada desde variables de entorno.

    Los valores por defecto se usan si la variable no está definida.
    """

    # ── Motor LLM ─────────────────────────────────────────────────────────────
    llm_provider: str = "openai"
    max_context_messages: int = 20

    # ── Credenciales LLM ──────────────────────────────────────────────────────
    openai_api_key: str = ""
    anthropic_api_key: str = ""
    ollama_base_url: str = "http://localhost:11434"
    ollama_model: str = "llama3"
    hf_api_key: str = ""
    hf_model: str = "Qwen/Qwen3-4B-Instruct-2507"

    # ── Seguridad ─────────────────────────────────────────────────────────────
    admin_token: str = ""
    allowed_origins: str = "http://localhost:3000"

    # ── Base de datos ─────────────────────────────────────────────────────────
    database_url: str = "sqlite+aiosqlite:///./data/db/moeve.db"

    model_config = {
        "env_file": _ENV_FILE,
        "env_file_encoding": "utf-8",
        # Ignorar variables del .env que no corresponden al backend
        # (e.g. NEXT_PUBLIC_API_URL es del frontend pero está en el mismo .env)
        "extra": "ignore",
    }

    def get_allowed_origins(self) -> list[str]:
        """Devuelve la lista de orígenes CORS parseando la variable separada por comas."""
        return [origin.strip() for origin in self.allowed_origins.split(",")]


# Instancia global de configuración — importar desde aquí en todos los módulos
settings = Settings()
