"""
Fixtures compartidos para los tests del backend.

Cada test obtiene una base de datos SQLite vacía en un directorio temporal,
garantizando aislamiento total entre tests y sin tocar datos reales.

Para tests que ejercitan el chat o cuestionarios, se usa client_with_mock_llm
para evitar llamadas reales a APIs externas (OpenAI, Anthropic, etc.).
"""

import os
import sys

# Asegurar que el directorio backend/ está en sys.path para que
# los módulos de la aplicación sean importables desde los tests.
_BACKEND_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if _BACKEND_DIR not in sys.path:
    sys.path.insert(0, _BACKEND_DIR)

# Pre-importar los módulos que se van a parchear. Necesario en Python 3.12+
# donde unittest.mock usa pkgutil.resolve_name, que no auto-importa submódulos.
import app.db.database  # noqa: E402
import app.services.llm_service  # noqa: E402

import pytest_asyncio
from unittest.mock import AsyncMock, patch
from httpx import AsyncClient, ASGITransport


# ── Fixture base: cliente con DB temporal ─────────────────────────────────────


@pytest_asyncio.fixture
async def client(tmp_path):
    """
    Cliente HTTP de prueba con base de datos SQLite temporal.

    Parchea DB_PATH para que todas las operaciones de base de datos
    usen un archivo temporal que se elimina automáticamente al terminar el test.
    """
    db_path = str(tmp_path / "test.db")

    with patch("app.db.database.DB_PATH", db_path):
        import main
        from app.db.database import init_database

        await init_database()

        async with AsyncClient(
            transport=ASGITransport(app=main.app),
            base_url="http://test",
        ) as ac:
            yield ac


# ── Fixture con LLM mockeado ──────────────────────────────────────────────────


@pytest_asyncio.fixture
async def client_with_mock_llm(tmp_path):
    """
    Cliente HTTP con base de datos temporal y LLM mockeado.

    Parchea generate_response para que los tests de chat y cuestionario
    no realicen llamadas reales a APIs externas.
    """
    db_path = str(tmp_path / "test.db")

    with patch("app.db.database.DB_PATH", db_path), patch(
        "app.services.llm_service.generate_response",
        new=AsyncMock(return_value="Respuesta de prueba del usuario sintético."),
    ):
        import main
        from app.db.database import init_database

        await init_database()

        async with AsyncClient(
            transport=ASGITransport(app=main.app),
            base_url="http://test",
        ) as ac:
            yield ac
