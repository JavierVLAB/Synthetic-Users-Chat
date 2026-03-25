# Cómo interactuar con el backend (para sesiones de análisis)

Usar la API directamente es más eficiente que el frontend cuando el objetivo es
conversar con un usuario sintético y analizar sus respuestas. Evita la sobrecarga
de browser automation y da acceso directo a los datos JSON.

---

## Credenciales

Están en `.env` en la raíz del proyecto:

- `ACCESS_PASSWORD` — contraseña para login de usuario
- `ADMIN_TOKEN` — header `X-Admin-Token` para endpoints de administración (perfiles, briefs)

## Flujo completo

### 1. Login → obtener JWT

```bash
curl -s -X POST http://localhost:8000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"password": "<ACCESS_PASSWORD>"}' | python3 -c "import sys,json; print(json.load(sys.stdin)['access_token'])"
```

Guardar el token en una variable de shell para reutilizarlo:

```bash
TOKEN=$(curl -s -X POST http://localhost:8000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"password": "<ACCESS_PASSWORD>"}' | python3 -c "import sys,json; print(json.load(sys.stdin)['access_token'])")
```

### 2. Ver perfiles disponibles

```bash
curl -s http://localhost:8000/profiles \
  -H "Authorization: Bearer $TOKEN" | python3 -m json.tool
```

Cada perfil tiene un `id` (ej. `early_adopter`, `pragmatic_expert`) que se usa al crear la sesión.

### 3. Ver briefs disponibles

```bash
curl -s http://localhost:8000/briefs \
  -H "Authorization: Bearer $TOKEN" | python3 -m json.tool
```

### 4. Crear sesión

```bash
SESSION=$(curl -s -X POST http://localhost:8000/sessions \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"profile_id": "<id_perfil>", "brief_id": "<id_brief>"}')

SESSION_ID=$(echo $SESSION | python3 -c "import sys,json; print(json.load(sys.stdin)['id'])")
```

### 5. Enviar mensaje y leer respuesta

```bash
curl -s -X POST http://localhost:8000/sessions/$SESSION_ID/chat \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"message": "Tu pregunta aquí"}' | python3 -m json.tool
```

La respuesta incluye el campo `response` con el texto del usuario sintético.

### 6. Cerrar sesión (opcional)

```bash
curl -s -X DELETE http://localhost:8000/sessions/$SESSION_ID \
  -H "Authorization: Bearer $TOKEN"
```

---

## Notas

- El JWT no tiene expiración corta (30 días según config), así que el token de una sesión
  de análisis puede reutilizarse dentro de la misma conversación con Claude.
- Los IDs de perfil y brief que existen actualmente: ver `/profiles` y `/briefs`.
- El endpoint `/sessions/{id}/questionnaire` permite subir un cuestionario en texto plano
  para hacer preguntas en bloque.
