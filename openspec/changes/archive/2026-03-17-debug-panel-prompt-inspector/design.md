## Context

El endpoint `POST /sessions/{id}/messages` devuelve actualmente `{ researcher_message, assistant_message }`. Los proveedores LLM (OpenAI, Anthropic) ya retornan el conteo de tokens en su respuesta, pero ese dato se descarta. El system prompt ensamblado también se pierde tras cada llamada. El investigador no tiene forma de inspeccionar qué se envió a la IA ni cuánto consumió sin revisar logs del servidor.

La edición de perfiles/briefs/departamentos ya está implementada vía `ContentViewerModal` + `updateProfile/updateBrief/updateDepartment` en `api.ts` — solo falta un punto de entrada desde la sesión activa.

## Goals / Non-Goals

**Goals:**
- Exponer `system_prompt` y `usage` (tokens) en la respuesta del endpoint de chat
- Adaptar los providers OpenAI y Anthropic para retornar uso de tokens
- Nuevo componente `DebugPanel` en el frontend con tres tabs: "Prompt", "Tokens", "Editar datos"
- Botón discreto (icono `BugReportIcon`) en el área de conversación activa que abre/cierra el panel
- Reutilizar `ContentViewerModal` para la edición de perfil/brief/departamento

**Non-Goals:**
- Historial de tokens acumulado entre turnos (solo el turno más reciente)
- Soporte de token count para Ollama y HuggingFace (se muestra `null` sin error)
- Panel de debug visible en modo lectura (solo sesión activa)
- Cifrado o restricción del system prompt (visible a todos los usuarios de la herramienta)

## Decisions

### 1. Cambio de firma de `LLMProvider.chat()` — devuelve objeto en lugar de str

**Decisión:** Cambiar `chat()` de retornar `str` a retornar `ChatResult(response: str, usage: TokenUsage | None)`.

**Alternativa descartada:** Añadir un método separado `chat_with_usage()`. Mantener dos métodos duplica la lógica en cada provider y complica `llm_service.generate_response()`.

**Rationale:** Un único método que siempre devuelve el objeto simplifica el contrato. Los providers que no soportan tokens (Ollama, HuggingFace) retornan `usage=None` — no hay error, simplemente se muestra `--` en el panel.

### 2. `system_prompt` y `usage` en la respuesta del endpoint de chat

**Decisión:** Añadir campos opcionales a `ChatResponse`:
```python
class ChatResponse(BaseModel):
    researcher_message: MessageResponse
    assistant_message: MessageResponse
    system_prompt: str          # siempre presente
    usage: TokenUsage | None    # None si el provider no lo soporta
```

**Alternativa descartada:** Endpoint separado `GET /sessions/{id}/debug` que devuelva el último system prompt. Requeriría persistir el system prompt por sesión en DB, añadiendo complejidad de almacenamiento innecesaria.

**Rationale:** El system prompt se construye en cada llamada de todos modos — añadirlo a la respuesta tiene coste cero. El cliente lo almacena en estado React local.

### 3. UI: drawer lateral vs panel flotante vs modal

**Decisión:** Panel deslizante lateral derecho (drawer) que se abre sobre el área de chat sin desplazar el layout. Ancho fijo `380px` en desktop, full-width en móvil.

**Alternativa descartada:** Modal centrado — interrumpe demasiado el flujo. Panel que desplaza el layout — rompe el responsive en pantallas medianas.

**Rationale:** El investigador quiere ver el panel mientras recuerda el contexto de la conversación — un drawer no oculta el chat.

### 4. Tabs del panel de debug

**Decisión:** Tres tabs con MUI `Tabs`:
- **Prompt** — textarea read-only con el system prompt del último turno (o el inicial si aún no hay mensajes)
- **Tokens** — tabla simple: prompt tokens / completion tokens / total del último turno
- **Editar datos** — tres acordeones (perfil, brief, departamento) que abren `ContentViewerModal` en modo edición

**Rationale:** Separa la lectura (Prompt, Tokens) de la escritura (Editar datos) visualmente, y reutiliza `ContentViewerModal` que ya implementa la lógica de edición + PUT calls.

### 5. Persistencia del system prompt en el cliente

**Decisión:** El frontend almacena `lastSystemPrompt` y `lastUsage` en el estado del componente `page.tsx` (o un contexto local al chat). Se actualiza con cada respuesta exitosa del chat.

**Alternativa descartada:** Persistir en `SessionContext` global. No es información global de la sesión, es debug temporal — no tiene sentido contaminar el contexto principal.

## Risks / Trade-offs

- **Tamaño de respuesta:** El system prompt puede ser largo (~3–5 KB). Añadirlo a cada respuesta del chat aumenta el payload. → Aceptable para una herramienta interna de investigación con tráfico bajo.
- **Breaking change en providers:** Cambiar la firma de `chat()` afecta los 4 providers. → Se hace en una pasada; los tests de providers deben actualizarse.
- **Ollama/HuggingFace sin tokens:** Mostrar `--` o `No disponible` en el panel. → Documentado en la UI con tooltip explicativo.
