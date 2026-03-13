"""
Tests del ciclo de vida de sesiones.

Cubre:
  14.1 — POST /sessions crea sesión con UUID único
  14.2 — POST /sessions/{id}/chat devuelve respuesta y persiste mensajes
  14.3 — POST /sessions/{id}/chat en sesión cerrada devuelve 409
"""

import pytest
from httpx import AsyncClient

# Payload válido usando datos reales del sistema (perfiles y brief existentes)
_VALID_SESSION = {
    "profile_id": "early_adopter",
    "brief_id": "ingenia",
    "llm_provider": "openai",
}


async def _create_session(client: AsyncClient) -> str:
    """Crea una sesión de prueba y devuelve su session_id."""
    response = await client.post("/sessions", json=_VALID_SESSION)
    assert response.status_code == 201, response.text
    return response.json()["session_id"]


# ── Tests ─────────────────────────────────────────────────────────────────────


@pytest.mark.asyncio
async def test_create_session_generates_unique_uuids(client_with_mock_llm):
    """14.1: Cada llamada a POST /sessions produce un UUID distinto."""
    id_1 = await _create_session(client_with_mock_llm)
    id_2 = await _create_session(client_with_mock_llm)

    assert id_1 != id_2

    # Formato UUID estándar: 36 caracteres con 4 guiones
    for session_id in (id_1, id_2):
        assert len(session_id) == 36
        assert session_id.count("-") == 4


@pytest.mark.asyncio
async def test_chat_returns_response_and_persists_messages(client_with_mock_llm):
    """14.2: POST /sessions/{id}/chat devuelve respuesta y persiste ambos mensajes."""
    session_id = await _create_session(client_with_mock_llm)

    response = await client_with_mock_llm.post(
        f"/sessions/{session_id}/chat",
        json={"message": "Hola, ¿cómo estás?"},
    )

    assert response.status_code == 200
    data = response.json()

    # La respuesta contiene los dos mensajes
    assert data["session_id"] == session_id
    assert data["user_message"]["role"] == "user"
    assert data["user_message"]["content"] == "Hola, ¿cómo estás?"
    assert data["assistant_message"]["role"] == "assistant"
    assert data["assistant_message"]["content"] == "Respuesta de prueba del usuario sintético."

    # Los mensajes persisten y son recuperables por GET /sessions/{id}
    history = await client_with_mock_llm.get(f"/sessions/{session_id}")
    assert history.status_code == 200
    messages = history.json()["messages"]
    assert len(messages) == 2
    assert messages[0]["role"] == "user"
    assert messages[1]["role"] == "assistant"


@pytest.mark.asyncio
async def test_chat_on_closed_session_returns_409(client_with_mock_llm):
    """14.3: Enviar mensaje a una sesión ya cerrada devuelve 409 Conflict."""
    session_id = await _create_session(client_with_mock_llm)

    # Cerrar la sesión
    close = await client_with_mock_llm.delete(f"/sessions/{session_id}")
    assert close.status_code == 200

    # Intentar enviar un mensaje a la sesión cerrada
    chat = await client_with_mock_llm.post(
        f"/sessions/{session_id}/chat",
        json={"message": "Este mensaje no debe procesarse"},
    )
    assert chat.status_code == 409
