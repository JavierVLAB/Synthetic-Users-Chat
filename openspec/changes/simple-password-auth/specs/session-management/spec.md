# Spec: session-management (delta)

## MODIFIED Requirements

### Requirement: Creación de sesión con UUID único

El sistema SHALL crear una sesión nueva al recibir `POST /sessions` con perfil y brief seleccionados. SHALL generar un `session_id` UUID v4 único, persistirlo en SQLite y devolverlo al cliente. Todas las operaciones posteriores de esa sesión DEBEN usar ese `session_id`. El endpoint SHALL requerir autenticación JWT válida.

#### Scenario: Creación exitosa

- **WHEN** el cliente envía `POST /sessions` con `{ profile_id, brief_id, llm_provider? }` y JWT válido
- **THEN** el backend SHALL responder `201` con `{ session_id: "<uuid>", created_at: "<iso8601>" }`

#### Scenario: Perfil inexistente

- **WHEN** el cliente envía `POST /sessions` con un `profile_id` que no existe
- **THEN** el backend SHALL responder `404` con `{ error: "Profile not found" }`

#### Scenario: Brief inexistente

- **WHEN** el cliente envía `POST /sessions` con un `brief_id` que no existe
- **THEN** el backend SHALL responder `404` con `{ error: "Brief not found" }`

#### Scenario: Sesiones simultáneas aisladas

- **WHEN** dos clientes crean sesiones simultáneamente con el mismo perfil y brief
- **THEN** cada uno SHALL recibir un `session_id` distinto y sus conversaciones SHALL mantenerse completamente aisladas

#### Scenario: Request sin autenticación

- **WHEN** el cliente envía `POST /sessions` sin header `Authorization`
- **THEN** el backend SHALL responder `401`

---

### Requirement: Almacenamiento persistente de mensajes

Cada mensaje enviado y recibido durante una sesión SHALL persistirse en SQLite con `session_id`, `role` (`user` | `assistant`), `content` y `timestamp`. El historial SHALL sobrevivir reinicios del servidor. El endpoint SHALL requerir autenticación JWT válida.

#### Scenario: Persistencia del mensaje del investigador

- **WHEN** el investigador envía un mensaje en la sesión `S`
- **THEN** el mensaje SHALL guardarse en la tabla `messages` con `session_id=S`, `role='user'`, `content=<texto>`, `timestamp=<now>`

#### Scenario: Persistencia de la respuesta del asistente

- **WHEN** el LLM genera una respuesta para la sesión `S`
- **THEN** la respuesta SHALL guardarse en `messages` con `role='assistant'`

#### Scenario: Recuperación del historial tras reinicio

- **WHEN** el servidor se reinicia y el cliente consulta `GET /sessions/{id}`
- **THEN** el historial completo de mensajes SHALL estar disponible desde SQLite

---

### Requirement: Consulta del estado de sesión

El sistema SHALL exponer `GET /sessions/{id}` que devuelve el estado completo de la sesión: metadatos + historial de mensajes ordenado cronológicamente. El endpoint SHALL requerir autenticación JWT válida.

#### Scenario: Sesión existente

- **WHEN** el cliente llama `GET /sessions/{id}` con un `session_id` válido y JWT válido
- **THEN** el backend SHALL responder `200` con `{ session_id, profile_id, brief_id, llm_provider, created_at, messages: [...] }`

#### Scenario: Sesión inexistente

- **WHEN** el cliente llama `GET /sessions/{id}` con un `session_id` que no existe
- **THEN** el backend SHALL responder `404` con `{ error: "Session not found" }`

---

### Requirement: Cierre de sesión

El sistema SHALL marcar la sesión como cerrada al recibir `DELETE /sessions/{id}`, registrando el `closed_at`. Una sesión cerrada no SHALL aceptar nuevos mensajes. El endpoint SHALL requerir autenticación JWT válida.

#### Scenario: Cierre exitoso

- **WHEN** el cliente llama `DELETE /sessions/{id}` con un `session_id` válido, activo y JWT válido
- **THEN** el backend SHALL responder `200`, actualizar `closed_at` en SQLite y dejar la sesión como solo lectura

#### Scenario: Intento de chat en sesión cerrada

- **WHEN** el cliente intenta enviar `POST /sessions/{id}/chat` en una sesión cerrada
- **THEN** el backend SHALL responder `409` con `{ error: "Session is closed" }`

#### Scenario: Cierre de sesión inexistente

- **WHEN** el cliente llama `DELETE /sessions/{id}` con un `session_id` que no existe
- **THEN** el backend SHALL responder `404`

---

### Requirement: Generación de PDF de sesión

El sistema SHALL generar un PDF descargable al recibir `GET /sessions/{id}/pdf`. El endpoint SHALL requerir autenticación JWT válida.

#### Scenario: Generación exitosa

- **WHEN** el cliente llama `GET /sessions/{id}/pdf` con JWT válido
- **THEN** el backend SHALL responder `200` con `Content-Type: application/pdf` y el binario del PDF como cuerpo de respuesta

#### Scenario: Nombre del archivo descargado

- **WHEN** el PDF se descarga
- **THEN** el header SHALL incluir `Content-Disposition: attachment; filename="sesion-{session_id[:8]}-{fecha}.pdf"`

#### Scenario: PDF de sesión inexistente

- **WHEN** el cliente llama `GET /sessions/{id}/pdf` con un `session_id` que no existe
- **THEN** el backend SHALL responder `404`

#### Scenario: Contenido del PDF

- **WHEN** el PDF es generado
- **THEN** SHALL contener en este orden:
  1. **Encabezado:** logo Moeve + título "Informe de sesión"
  2. **Perfil:** nombre y contenido completo del perfil de comportamiento usado
  3. **Producto:** nombre y contenido completo del brief del producto evaluado
  4. **Conversación:** todos los mensajes en orden cronológico, cada uno identificado visualmente con la etiqueta **"Investigador"** (mensajes del usuario real) o **"Usuario sintético"** (mensajes del asistente), incluyendo el timestamp de cada mensaje
- **THEN** el PDF NO SHALL incluir metadatos técnicos como el proveedor LLM ni el session_id

---

### Requirement: Rate limiting en endpoints de sesión

El sistema SHALL aplicar rate limiting para proteger contra uso abusivo.

#### Scenario: Límite en creación de sesiones

- **WHEN** una IP hace más de 10 requests a `POST /sessions` en un minuto
- **THEN** el backend SHALL responder `429` con `{ error: "Too many requests" }` para las peticiones que excedan el límite

#### Scenario: Límite en chat

- **WHEN** una IP hace más de 30 requests a `POST /sessions/{id}/chat` en un minuto
- **THEN** el backend SHALL responder `429`
