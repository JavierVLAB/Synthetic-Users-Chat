## ADDED Requirements

### Requirement: Respuesta del endpoint de chat incluye system prompt y uso de tokens

El endpoint `POST /sessions/{id}/messages` SHALL devolver además de los mensajes: el `system_prompt` completo ensamblado para ese turno y el objeto `usage` con el conteo de tokens. Los proveedores LLM SHALL retornar el uso de tokens cuando su API lo soporte; cuando no lo soporten, SHALL retornar `null` sin error.

El modelo interno `LLMProvider.chat()` SHALL retornar un objeto `ChatResult` con `response: str` y `usage: TokenUsage | None` en lugar de devolver solo `str`. `TokenUsage` contiene `prompt_tokens: int`, `completion_tokens: int`, `total_tokens: int`.

#### Scenario: Respuesta con tokens — proveedor OpenAI
- **WHEN** el investigador envía un mensaje con proveedor OpenAI activo
- **THEN** el endpoint SHALL responder con `{ researcher_message, assistant_message, system_prompt: "<texto completo>", usage: { prompt_tokens: N, completion_tokens: M, total_tokens: N+M } }`

#### Scenario: Respuesta con tokens — proveedor Anthropic
- **WHEN** el investigador envía un mensaje con proveedor Anthropic activo
- **THEN** el endpoint SHALL responder con `usage` poblado desde `response.usage.input_tokens` y `response.usage.output_tokens`

#### Scenario: Respuesta sin tokens — proveedores Ollama y HuggingFace
- **WHEN** el investigador envía un mensaje con proveedor Ollama o HuggingFace activo
- **THEN** el endpoint SHALL responder con `usage: null` sin error

#### Scenario: System prompt siempre presente en la respuesta
- **WHEN** el endpoint `POST /sessions/{id}/messages` procesa un mensaje exitosamente
- **THEN** `system_prompt` SHALL estar siempre presente en la respuesta (nunca `null`), conteniendo el texto completo del prompt ensamblado para ese turno
