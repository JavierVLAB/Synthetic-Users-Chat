## 1. Backend — Modelo de datos y tipos compartidos

- [x] 1.1 Crear `TokenUsage` Pydantic model en `backend/app/models/session.py` con campos `prompt_tokens: int`, `completion_tokens: int`, `total_tokens: int`
- [x] 1.2 Crear dataclass/namedtuple `ChatResult` en `backend/app/providers/base.py` con campos `response: str` y `usage: TokenUsage | None`
- [x] 1.3 Actualizar `ChatResponse` en `backend/app/models/session.py` para añadir `system_prompt: str` y `usage: TokenUsage | None`

## 2. Backend — Adaptar providers LLM

- [x] 2.1 Cambiar la firma de `LLMProvider.chat()` en `backend/app/providers/base.py` para retornar `ChatResult` en lugar de `str`
- [x] 2.2 Actualizar `OpenAIProvider.chat()` en `backend/app/providers/openai_provider.py`: retornar `ChatResult` con `usage` extraído de `response.usage.prompt_tokens` / `completion_tokens` / `total_tokens`
- [x] 2.3 Actualizar `AnthropicProvider.chat()` en `backend/app/providers/anthropic_provider.py`: retornar `ChatResult` con `usage` extraído de `response.usage.input_tokens` (prompt) y `output_tokens` (completion)
- [x] 2.4 Actualizar `OllamaProvider.chat()` en `backend/app/providers/ollama_provider.py`: retornar `ChatResult` con `usage=None`
- [x] 2.5 Actualizar `HuggingFaceProvider.chat()` en `backend/app/providers/huggingface_provider.py`: retornar `ChatResult` con `usage=None`

## 3. Backend — Propagación en llm_service y router

- [x] 3.1 Actualizar `generate_response()` en `backend/app/services/llm_service.py`: recibir `ChatResult` del provider y retornar `ChatResult` (cambiar tipo de retorno de `str` a `ChatResult`)
- [x] 3.2 Actualizar `send_message()` en `backend/app/routers/sessions.py`: usar el `ChatResult` retornado para incluir `system_prompt` y `usage` en la respuesta `ChatResponse`

## 4. Frontend — Tipos y API client

- [x] 4.1 Añadir tipos `TokenUsage` y actualizar `ChatResponse` en `frontend/services/api.ts` para incluir `system_prompt: string` y `usage: TokenUsage | null`

## 5. Frontend — Componente DebugPanel

- [x] 5.1 Crear `frontend/components/DebugPanel.tsx` con estructura de drawer lateral derecho (380px desktop, full-width móvil) y cabecera con título "Debug" y botón de cerrar
- [x] 5.2 Implementar tab "Prompt": textarea read-only con fuente monospace mostrando `systemPrompt` prop; estado vacío si no hay prompt aún
- [x] 5.3 Implementar tab "Tokens": tabla con filas "Prompt tokens", "Completion tokens", "Total"; mostrar `—` con tooltip cuando `usage` es `null`
- [x] 5.4 Implementar tab "Editar datos": tres secciones (Perfil, Brief, Departamento) que abren `ContentViewerModal` al hacer click en "Ver / Editar"; ocultar sección Departamento si la sesión no tiene departamento; respetar `editable` según `NEXT_PUBLIC_ADMIN_TOKEN`
- [x] 5.5 Props del componente: `systemPrompt: string | null`, `usage: TokenUsage | null`, `session: ActiveSession | null`, `isOpen: boolean`, `onClose: () => void`

## 6. Frontend — Integración en page.tsx

- [x] 6.1 Añadir estado local en `frontend/app/page.tsx`: `lastSystemPrompt: string | null` y `lastUsage: TokenUsage | null`, inicializados a `null`
- [x] 6.2 Actualizar el handler de envío de mensajes para leer `system_prompt` y `usage` de la respuesta y actualizar el estado local
- [x] 6.3 Añadir estado `debugOpen: boolean` y botón `BugReportIcon` (MUI) visible solo cuando `session && !isViewMode`; el botón hace toggle de `debugOpen`
- [x] 6.4 Renderizar `<DebugPanel>` en `page.tsx` pasando `systemPrompt`, `usage`, `session`, `isOpen={debugOpen}` y `onClose`
