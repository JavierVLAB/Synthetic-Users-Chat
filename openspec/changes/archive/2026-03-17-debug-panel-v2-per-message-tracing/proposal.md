## Why

El panel de debug actual solo muestra el system prompt del último turno y no incluye los mensajes enviados a la IA — lo que hace imposible verificar si la ventana de contexto está completa o si el prompt se ha truncado. Además, algunos proveedores (Ollama) sí devuelven conteo de tokens pero no los estamos extrayendo. Por último, el investigador necesita poder ajustar el texto interpolado de cada sección del prompt (perfil, brief, departamento) sin editar los archivos fuente, para corregir el tono o el contenido en mitad de una sesión.

## What Changes

- El backend devuelve `messages_sent` (la lista de mensajes que se enviaron realmente al LLM tras aplicar la ventana deslizante) junto con `system_prompt` y `usage` en cada respuesta de chat
- `OllamaProvider` extrae `prompt_eval_count` / `eval_count` de la respuesta para poblar `TokenUsage`
- El frontend acumula un historial de debug por turno (`DebugEntry[]`), no solo el último
- El panel de debug muestra el historial de turnos: cada turno tiene el contexto completo (system prompt + mensajes enviados), los tokens y un indicador del tamaño de la ventana
- El tab "Editar datos" muestra el texto interpolado resuelto de cada sección (no el YAML) en textareas editables; los cambios se almacenan como overrides por sesión y se envían en cada mensaje posterior
- El backend acepta overrides opcionales en `POST /sessions/{id}/chat` para reemplazar el texto de cualquier sección sin modificar los archivos

## Capabilities

### New Capabilities
- `session-prompt-overrides`: Mecanismo de overrides por sesión para sustituir el texto inyectado de perfil, brief y departamento sin modificar los archivos fuente

### Modified Capabilities
- `debug-panel`: Historial de debug por turno con contexto completo (system prompt + messages_sent), tokens acumulados, y editor de secciones con texto resuelto
- `llm-engine`: `ChatResponse` incluye `messages_sent`; `OllamaProvider` reporta tokens; `ChatRequest` acepta `overrides` opcionales

## Impact

- **Backend**: `ChatRequest` añade campo `overrides`; `ChatResponse` añade `messages_sent`; `build_system_prompt_for_session()` acepta overrides; `OllamaProvider.chat()` extrae tokens
- **Frontend**: `api.ts` actualiza tipos; `page.tsx` gestiona `debugHistory[]` y `textOverrides`; `DebugPanel` rediseñado con historial por turno y editor de texto resuelto
- **Sin cambios de DB**: overrides son efímeros (estado de frontend por sesión)
