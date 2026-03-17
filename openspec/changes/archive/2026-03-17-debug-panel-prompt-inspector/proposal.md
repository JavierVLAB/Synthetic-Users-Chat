## Why

Los investigadores no tienen visibilidad de lo que realmente se le envía a la IA en cada turno de conversación — no pueden verificar si el system prompt está bien construido, ni saben cuántos tokens están consumiendo. Tampoco pueden ajustar el contenido de los perfiles o el brief desde la propia sesión si detectan algo que no les convence sin salir del flujo.

## What Changes

- Nuevo panel de debug accesible desde un botón discreto (icono de debug/código) en la interfaz de conversación activa
- El panel muestra el system prompt completo ensamblado para la sesión en curso
- El panel muestra el conteo de tokens consumidos en el último turno (prompt tokens, completion tokens, total)
- El panel permite editar inline el contenido del perfil de comportamiento, del brief de producto y del departamento asociados a la sesión activa (requiere `NEXT_PUBLIC_ADMIN_TOKEN`)
- El backend expone el system prompt ensamblado y el uso de tokens en la respuesta del endpoint de chat

## Capabilities

### New Capabilities
- `debug-panel`: Panel de debug en la UI que muestra el system prompt completo, el conteo de tokens y permite editar los datos fuente (perfil, brief, departamento) de la sesión activa

### Modified Capabilities
- `llm-engine`: El endpoint de chat deberá devolver además del texto de respuesta: el system prompt ensamblado y el conteo de tokens (prompt_tokens, completion_tokens, total_tokens) del proveedor LLM
- `chat-interface`: Añadir botón discreto de debug y el panel asociado en el estado de sesión activa

## Impact

- **Backend**: `POST /sessions/{id}/messages` pasa de devolver `{ response: string }` a `{ response, system_prompt, usage: { prompt_tokens, completion_tokens, total_tokens } }`. Los proveedores LLM (OpenAI, Anthropic) ya exponen uso de tokens en sus respuestas — hay que propagarlo.
- **Frontend**: `frontend/services/api.ts` actualiza el tipo de respuesta del endpoint de chat. Nuevo componente `DebugPanel.tsx`. La página principal gestiona el estado de visibilidad del panel.
- **Providers**: `OpenAIProvider` y `AnthropicProvider` deben retornar uso de tokens. `OllamaProvider` y `HuggingFaceProvider` retornarán `null` si no lo soportan.
- **Edición**: Reutiliza `ContentViewerModal` ya existente o el mecanismo de `updateProfile/updateBrief/updateDepartment` ya implementados en `api.ts`.
