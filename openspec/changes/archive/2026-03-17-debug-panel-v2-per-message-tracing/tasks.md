## 1. Backend — OllamaProvider extrae tokens

- [x] 1.1 En `OllamaProvider.chat()`: leer `prompt_eval_count` y `eval_count` del JSON de respuesta y construir `TokenUsage`; si no existen devolver `usage=None`

## 2. Backend — Modelos y tipos

- [x] 2.1 Añadir `PromptSections` Pydantic model en `backend/app/models/session.py` con campos `profile_text: str`, `brief_text: str`, `department_text: str | None`
- [x] 2.2 Actualizar `ChatResponse` para añadir `messages_sent: list[dict]` y `sections: PromptSections`
- [x] 2.3 Añadir clase `OverridesRequest` (o dict inline) en `ChatRequest` con campos opcionales `profile_text`, `brief_text`, `department_text`

## 3. Backend — build_system_prompt_for_session acepta overrides

- [x] 3.1 Actualizar `build_system_prompt_for_session()` en `sessions.py` para aceptar un dict `overrides` opcional y devolver `(system_prompt, sections)` en lugar de solo `system_prompt`
- [x] 3.2 Cuando `overrides` tiene un valor para una sección, usarlo en lugar de cargar desde el archivo

## 4. Backend — send_message incluye messages_sent y sections

- [x] 4.1 En `send_message()` en `sessions.py`: capturar `messages_sent` (la lista `llm_messages` tras `apply_context_window`) y pasarla a `ChatResponse`
- [x] 4.2 Incluir `sections` (del retorno de `build_system_prompt_for_session`) en `ChatResponse`
- [x] 4.3 Leer `body.overrides` y pasarlos a `build_system_prompt_for_session()`

## 5. Frontend — Tipos en api.ts

- [x] 5.1 Añadir tipo `PromptSections` en `api.ts` con `profile_text`, `brief_text`, `department_text?`
- [x] 5.2 Actualizar `ChatResponse` en `api.ts`: añadir `messages_sent: Array<{role: string, content: string}>` y `sections: PromptSections`
- [x] 5.3 Actualizar la función `sendChatMessage()` para aceptar `overrides?: Partial<PromptSections>` y enviarlo en el body

## 6. Frontend — Estado de debug en page.tsx

- [x] 6.1 Definir tipo `DebugEntry` en `page.tsx`: `{ turnIndex, systemPrompt, messagesSent, usage, sections, totalMessages }`
- [x] 6.2 Reemplazar `lastSystemPrompt`/`lastUsage` con `debugHistory: DebugEntry[]`
- [x] 6.3 Añadir `textOverrides: Partial<PromptSections>` y `originalSections: PromptSections | null` al estado de `page.tsx`
- [x] 6.4 En `handleSendMessage`: tras respuesta, hacer append a `debugHistory` y actualizar `originalSections` (solo en primer turno si es null)
- [x] 6.5 Pasar `overrides` a `handleSendMessage` → `sendMessage()` → `sendChatMessage()`
- [x] 6.6 Actualizar la llamada a `sendMessage` en `SessionContext` para que acepte y pase el parámetro `overrides`
- [x] 6.7 Actualizar `<DebugPanel>` props: reemplazar `systemPrompt`/`usage` con `debugHistory`, añadir `textOverrides`, `originalSections`, `onOverrideChange`, `onOverrideReset`

## 7. Frontend — DebugPanel rediseño

- [x] 7.1 Renombrar tab "Prompt" → "Contexto"; rediseñar como lista de turnos colapsables (más reciente expandido)
- [x] 7.2 Cada turno muestra: número de turno, badge de tokens, system prompt en textarea readonly, lista de mensajes enviados (`[role] content`)
- [x] 7.3 Añadir indicador "Ventana: N de M mensajes" cuando `messages_sent.length < totalMessages`
- [x] 7.4 Rediseñar tab "Tokens" como tabla de todos los turnos + fila de totales acumulados
- [x] 7.5 Rediseñar tab "Editar datos": textareas editables con el texto resuelto por sección (profile, brief, department); cabecera con badge "Editado" cuando hay override activo; botón "Restaurar original" por sección
- [x] 7.6 `onOverrideChange(section, text)` actualiza `textOverrides` en `page.tsx`; `onOverrideReset(section)` elimina el override de esa sección
