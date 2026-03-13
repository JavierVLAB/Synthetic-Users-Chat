"""
Tests de validación del endpoint de cuestionarios.

Cubre:
  14.4 — POST /sessions/{id}/questionnaire con lista vacía devuelve 422
  14.5 — POST /sessions/{id}/questionnaire con más de 50 preguntas devuelve 422

Nota: ambas validaciones se realizan en el modelo Pydantic (field_validator),
por lo que FastAPI devuelve 422 Unprocessable Entity en lugar de 400.
"""

import pytest
from httpx import AsyncClient

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
async def test_questionnaire_with_empty_list_returns_422(client_with_mock_llm):
    """14.4: Una lista de preguntas vacía es rechazada con 422."""
    session_id = await _create_session(client_with_mock_llm)

    response = await client_with_mock_llm.post(
        f"/sessions/{session_id}/questionnaire",
        json={"questions": []},
    )
    assert response.status_code == 422


@pytest.mark.asyncio
async def test_questionnaire_exceeding_limit_returns_422(client_with_mock_llm):
    """14.5: Más de 50 preguntas son rechazadas con 422 (validación Pydantic)."""
    session_id = await _create_session(client_with_mock_llm)

    too_many = [f"Pregunta número {i + 1}" for i in range(51)]

    response = await client_with_mock_llm.post(
        f"/sessions/{session_id}/questionnaire",
        json={"questions": too_many},
    )
    assert response.status_code == 422
