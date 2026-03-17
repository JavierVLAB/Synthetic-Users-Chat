## ADDED Requirements

### Requirement: ChatResponse incluye mensajes enviados al LLM y secciones resueltas

El endpoint `POST /sessions/{id}/chat` SHALL devolver `messages_sent: list[dict]` — la lista exacta de mensajes (en formato `{role, content}`) enviados al LLM tras aplicar la ventana deslizante. También SHALL devolver `sections: { profile_text, brief_text, department_text? }` con el texto resuelto de cada sección del system prompt. Estos campos permiten al investigador verificar la ventana de contexto activa y los textos inyectados turno a turno.

#### Scenario: messages_sent refleja la ventana deslizante
- **WHEN** la sesión tiene 30 mensajes y `MAX_CONTEXT_MESSAGES=20`
- **THEN** `messages_sent` SHALL contener exactamente los últimos 20 mensajes (los que realmente se enviaron al LLM), no los 30

#### Scenario: messages_sent en sesión corta
- **WHEN** la sesión tiene 5 mensajes (todos dentro de la ventana)
- **THEN** `messages_sent` SHALL contener los 5 mensajes completos

#### Scenario: sections siempre presentes
- **WHEN** el endpoint procesa un mensaje exitosamente
- **THEN** `sections.profile_text` y `sections.brief_text` SHALL estar siempre presentes; `sections.department_text` SHALL estar presente solo si la sesión tiene departamento asociado

### Requirement: OllamaProvider reporta uso de tokens

`OllamaProvider` SHALL extraer el conteo de tokens de la respuesta de la API de Ollama y devolverlo en `ChatResult.usage`. La API de Ollama devuelve `prompt_eval_count` (tokens del prompt) y `eval_count` (tokens generados) en el body de la respuesta.

#### Scenario: Tokens extraídos de respuesta Ollama
- **WHEN** el proveedor activo es Ollama y el endpoint devuelve `prompt_eval_count: 150` y `eval_count: 80`
- **THEN** `ChatResult.usage` SHALL ser `TokenUsage(prompt_tokens=150, completion_tokens=80, total_tokens=230)`

#### Scenario: Ollama sin datos de tokens
- **WHEN** la respuesta de Ollama no incluye `prompt_eval_count` o `eval_count`
- **THEN** `ChatResult.usage` SHALL ser `None` sin error
