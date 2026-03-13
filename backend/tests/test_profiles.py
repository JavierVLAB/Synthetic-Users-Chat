"""
Tests de los endpoints de perfiles y briefs.

Cubre:
  14.6 — Endpoints de escritura sin X-Admin-Token válido devuelven 401
  14.7 — GET /profiles lista perfiles disponibles excluyendo empleado.yaml
"""

import pytest

# Token inválido para provocar el rechazo de autorización
_WRONG_TOKEN = {"X-Admin-Token": "token-incorrecto"}


# ── Tests ─────────────────────────────────────────────────────────────────────


@pytest.mark.asyncio
async def test_write_endpoints_require_valid_admin_token(client):
    """14.6: Los endpoints de escritura de perfiles y briefs rechazan tokens inválidos."""
    # POST /profiles
    r = await client.post(
        "/profiles",
        json={"content": {"name": "perfil_test"}},
        headers=_WRONG_TOKEN,
    )
    assert r.status_code == 401

    # PUT /profiles/{id}
    r = await client.put(
        "/profiles/early_adopter",
        json={"content": {"name": "Early Adopter"}},
        headers=_WRONG_TOKEN,
    )
    assert r.status_code == 401

    # DELETE /profiles/{id}
    r = await client.delete("/profiles/early_adopter", headers=_WRONG_TOKEN)
    assert r.status_code == 401

    # POST /briefs
    r = await client.post(
        "/briefs",
        json={"content": {"name": "brief_test"}},
        headers=_WRONG_TOKEN,
    )
    assert r.status_code == 401

    # PUT /briefs/{id}
    r = await client.put(
        "/briefs/ingenia",
        json={"content": {"name": "Ingenia"}},
        headers=_WRONG_TOKEN,
    )
    assert r.status_code == 401

    # DELETE /briefs/{id}
    r = await client.delete("/briefs/ingenia", headers=_WRONG_TOKEN)
    assert r.status_code == 401


@pytest.mark.asyncio
async def test_list_profiles_excludes_empleado(client):
    """14.7: GET /profiles lista los perfiles de comportamiento sin incluir empleado.yaml."""
    response = await client.get("/profiles")

    assert response.status_code == 200
    profiles = response.json()

    # Hay al menos un perfil de comportamiento disponible
    assert isinstance(profiles, list)
    assert len(profiles) > 0

    # El perfil de empleado (perfil fijo del sistema) no aparece en la lista
    ids = [p["id"] for p in profiles]
    assert "empleado" not in ids

    # Cada perfil expone los campos mínimos esperados
    for profile in profiles:
        assert "id" in profile
        assert "name" in profile
