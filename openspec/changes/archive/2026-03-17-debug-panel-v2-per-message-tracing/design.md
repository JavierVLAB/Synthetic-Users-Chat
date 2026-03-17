## Context

El panel de debug v1 almacenaba solo el último `system_prompt` y `usage` en estado de `page.tsx`. No había visibilidad de los mensajes enviados al LLM ni historial entre turnos.

## Goals / Non-Goals

**Goals:**
- Persitencia en memoria del historial de debug por turno durante la sesión activa
- Contexto completo por turno: system prompt + mensajes enviados en la ventana
- Token count funcional para Ollama
- Editor de secciones del prompt con texto resuelto (no YAML) y overrides por sesión

**Non-Goals:**
- Persistir el historial de debug en DB (efímero, solo para la sesión activa)
- Overrides que sobreviven al cierre de sesión
- Soporte de overrides en el endpoint de cuestionario (fuera de scope)

## Decisions

### 1. `messages_sent` en `ChatResponse`

**Decisión:** Añadir `messages_sent: list[dict]` a `ChatResponse` — la lista exacta de mensajes enviados al LLM tras aplicar la ventana deslizante.

**Rationale:** Es el único dato que permite al investigador verificar si la ventana está completa. El router ya tiene esta lista calculada (`llm_messages` tras `apply_context_window`); solo hay que devolverla.

### 2. `DebugEntry` acumulado en frontend

**Decisión:** `page.tsx` mantiene `debugHistory: DebugEntry[]`. Cada vez que `sendMessage` devuelve respuesta, se appends un nuevo entry. `DebugEntry = { turnIndex, systemPrompt, messagesSent, usage }`.

**Alternativa descartada:** Persistir en DB. Es información de debug temporal; añadir una tabla solo para esto es sobreingeniería. Si el investigador recarga, el historial de debug se pierde (el historial de mensajes persiste en DB, el debug no).

### 3. Overrides como campo en `ChatRequest`

**Decisión:** `ChatRequest` añade `overrides?: { profile_text?, brief_text?, department_text? }`. En `build_system_prompt_for_session()`, si se pasa un override para una sección, se usa en lugar de cargar el archivo.

**Alternativa descartada:** Endpoint `PATCH /sessions/{id}/overrides` que persiste en DB. Innecesario — los overrides son exploratorios y efímeros. El investigador los usa para ajustar el prompt dentro de una sesión sin intención de guardarlos.

### 4. Texto resuelto en "Editar datos" del panel

**Decisión:** El backend incluye `sections: { profile_text, brief_text, department_text? }` en `ChatResponse` (las cadenas ya interpoladas/resueltas). En el primer turno, el frontend inicializa los textareas con estos valores; el investigador puede editarlos y el resultado se envía como `overrides` en turnos posteriores.

**Rationale:** Mostrar el YAML crudo en un textarea ya lo hace el `ContentViewerModal`. Lo nuevo es mostrar el texto final que se inyecta en el prompt, sección por sección, y permitir editarlo inline sin salir del flujo de la conversación.

### 5. UI del panel de debug: lista de turnos

**Decisión:** El tab "Prompt" pasa de mostrar un único textarea a mostrar una lista de turnos colapsables (el más reciente expandido por defecto). Cada turno muestra: número de turno, tokens del turno, system prompt (colapsable) y mensajes enviados en la ventana.

**Alternativa descartada:** Mostrar todo en un único textarea concatenado. Dificulta la lectura y no permite comparar turnos.
