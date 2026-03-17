# Spec: llm-engine

Motor conversacional multi-LLM. Gestiona la construcción del system prompt, el historial de conversación, la selección de proveedor y el envío de mensajes al LLM activo.

---
## Requirements
### Requirement: Selección de proveedor LLM configurable

El sistema SHALL soportar tres proveedores: `openai` (GPT-4, default), `anthropic` (Claude) y `ollama` (local). El proveedor SHALL seleccionarse por variable de entorno `LLM_PROVIDER` o por parámetro `llm_provider` en el body de `POST /sessions`. El parámetro de sesión SHALL tener precedencia sobre la variable de entorno.

#### Scenario: Proveedor por defecto
- **WHEN** `LLM_PROVIDER` no está definida y la sesión no especifica `llm_provider`
- **THEN** el sistema SHALL usar `openai` como proveedor

#### Scenario: Proveedor por variable de entorno
- **WHEN** `LLM_PROVIDER=anthropic` está definida en el entorno
- **THEN** todas las sesiones que no especifiquen `llm_provider` SHALL usar Anthropic

#### Scenario: Proveedor por parámetro de sesión
- **WHEN** `POST /sessions` incluye `{ llm_provider: "ollama" }`
- **THEN** esa sesión SHALL usar Ollama independientemente de `LLM_PROVIDER`

#### Scenario: Proveedor inválido rechazado
- **WHEN** `POST /sessions` incluye `{ llm_provider: "gemini" }`
- **THEN** el backend SHALL responder `400` con `{ error: "Unsupported LLM provider. Use: openai, anthropic, ollama" }`

---

### Requirement: System prompt construido desde plantilla desacoplada

El system prompt SHALL construirse en tiempo de ejecución interpolando el contenido de los tres archivos de datos en la plantilla `backend/prompts/system_prompt_template.txt`. Las variables SHALL ser `{perfil_empleado}`, `{perfil_comportamiento}` y `{brief_producto}`.

#### Scenario: Interpolación correcta
- **WHEN** se procesa un mensaje de la sesión con perfil "explorador" y brief "app-movil"
- **THEN** el system prompt enviado al LLM SHALL contener el contenido completo de `empleado.yaml`, `explorador.yaml` y `app-movil.yaml` en las posiciones correspondientes de la plantilla

#### Scenario: Plantilla ausente bloquea arranque
- **WHEN** `system_prompt_template.txt` no existe en la ruta esperada
- **THEN** el servidor SHALL fallar al arrancar con error: `"System prompt template not found at prompts/system_prompt_template.txt"`

#### Scenario: Editar plantilla sin reiniciar (hot reload)
- **WHEN** se modifica `system_prompt_template.txt` mientras el servidor está corriendo
- **THEN** la nueva plantilla SHALL usarse a partir del siguiente mensaje (la plantilla SHALL leerse en cada request, no cachearse indefinidamente)

---

### Requirement: Historial de conversación con ventana deslizante

El sistema SHALL mantener el historial de mensajes de la sesión como contexto para el LLM. Para evitar superar el límite de tokens, SHALL aplicar una ventana deslizante: se envían como máximo los últimos `MAX_CONTEXT_MESSAGES` mensajes (configurable por env var, default: 20). El system prompt SHALL enviarse siempre, independientemente del tamaño del historial.

#### Scenario: Historial dentro del límite
- **WHEN** la sesión tiene 10 mensajes y `MAX_CONTEXT_MESSAGES=20`
- **THEN** los 10 mensajes SHALL enviarse completos al LLM junto con el system prompt

#### Scenario: Historial excede el límite
- **WHEN** la sesión tiene 30 mensajes y `MAX_CONTEXT_MESSAGES=20`
- **THEN** SHALL enviarse al LLM solo los últimos 20 mensajes (los más recientes) más el system prompt

#### Scenario: System prompt siempre presente
- **WHEN** se envía cualquier mensaje al LLM, independientemente del tamaño del historial
- **THEN** el system prompt completo (plantilla interpolada) SHALL estar incluido como mensaje de sistema

---

### Requirement: Manejo de errores del LLM con respuesta al usuario

Si el LLM devuelve un error o la llamada falla, el sistema SHALL responder con un mensaje de error amigable sin exponer detalles internos. El error SHALL registrarse en los logs del servidor.

#### Scenario: Error de API key inválida
- **WHEN** la API key del proveedor LLM es inválida o ha expirado
- **THEN** el endpoint `POST /sessions/{id}/chat` SHALL responder `502` con `{ error: "No se pudo conectar con el modelo de IA. Contacta con el administrador." }`

#### Scenario: Timeout del LLM
- **WHEN** el LLM no responde en 60 segundos
- **THEN** el backend SHALL cancelar la request y responder `504` con `{ error: "El modelo tardó demasiado en responder. Inténtalo de nuevo." }`

#### Scenario: Error registrado en logs
- **WHEN** ocurre cualquier error del proveedor LLM
- **THEN** el detalle técnico completo del error SHALL registrarse en los logs del servidor (no en la respuesta al cliente)

---

### Requirement: Configuración de credenciales por variables de entorno

Las API keys de cada proveedor SHALL configurarse exclusivamente por variables de entorno. No SHALL existir ninguna credencial hardcodeada en el código.

#### Scenario: API keys por entorno
- **WHEN** `OPENAI_API_KEY`, `ANTHROPIC_API_KEY` están definidas en `.env`
- **THEN** los proveedores correspondientes SHALL usarlas automáticamente al inicializarse

#### Scenario: Arranque sin API key del proveedor activo
- **WHEN** `LLM_PROVIDER=openai` pero `OPENAI_API_KEY` no está definida
- **THEN** el servidor SHALL arrancar pero SHALL responder `502` con mensaje descriptivo en el primer intento de conversación (no falla silenciosamente)

#### Scenario: Variables en .env.example documentadas
- **WHEN** se revisa el archivo `.env.example` del proyecto
- **THEN** SHALL estar documentadas todas las variables: `LLM_PROVIDER`, `OPENAI_API_KEY`, `ANTHROPIC_API_KEY`, `OLLAMA_BASE_URL`, `MAX_CONTEXT_MESSAGES`, `ADMIN_TOKEN`, `ALLOWED_ORIGINS`

---

### Requirement: Proveedor Ollama con URL configurable

El proveedor Ollama SHALL conectarse a la URL base configurada en `OLLAMA_BASE_URL` (default: `http://localhost:11434`). El modelo SHALL configurarse en `OLLAMA_MODEL` (default: `llama3`).

#### Scenario: Ollama local funcionando
- **WHEN** `LLM_PROVIDER=ollama`, Ollama está corriendo localmente y `OLLAMA_BASE_URL=http://localhost:11434`
- **THEN** las conversaciones SHALL procesarse usando el modelo local configurado en `OLLAMA_MODEL`

#### Scenario: Ollama no disponible
- **WHEN** `LLM_PROVIDER=ollama` pero el servidor Ollama no está accesible
- **THEN** el backend SHALL responder `502` con mensaje de error amigable

### Requirement: System prompt con instrucciones anti-alucinación y anti-complacencia
El system prompt template SHALL incluir una sección de instrucciones explícitas que prevengan que el usuario sintético invente datos, métricas o ejemplos. La IA SHALL expresar incertidumbre cuando no tenga información, y SHALL manifestar escepticismo o crítica cuando el perfil de comportamiento lo sugiera.

#### Scenario: IA no inventa métricas
- **WHEN** el investigador pregunta al usuario sintético por datos de uso concretos (tasas de adopción, tiempo de uso, NPS, etc.)
- **THEN** el usuario sintético SHALL responder indicando que no tiene esos datos concretos en lugar de inventar cifras

#### Scenario: IA expresa opinión crítica si el perfil lo indica
- **WHEN** el perfil de comportamiento describe un usuario escéptico o crítico con la tecnología
- **THEN** el usuario sintético SHALL poder expresar dudas, críticas o reservas sobre el producto de forma consistente con ese perfil

#### Scenario: IA redirige si se le pregunta si es IA
- **WHEN** el investigador pregunta directamente "¿eres una IA?" o "¿eres un modelo de lenguaje?"
- **THEN** el usuario sintético SHALL negar serlo con naturalidad y redirigir la conversación al tema del producto

### Requirement: Datos de uso reales del brief inyectados en el prompt
Cuando el brief activo contiene el campo `datos_de_uso`, el LLM engine SHALL incluir esos datos en el system prompt como referencia factual de uso. La IA SHALL usar esos datos cuando el investigador pregunte por métricas, en lugar de inventar valores.

#### Scenario: Sección de datos reales en el prompt
- **WHEN** el brief tiene campo `datos_de_uso` no vacío
- **THEN** el system prompt SHALL incluir una sección "DATOS REALES DE USO" con el contenido de ese campo, con instrucción explícita de usarlos como referencia

#### Scenario: Prompt sin sección de datos si campo vacío
- **WHEN** el brief no tiene campo `datos_de_uso` o está vacío
- **THEN** el system prompt NO SHALL incluir ninguna sección de datos de uso

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

---

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

---

### Requirement: OllamaProvider reporta uso de tokens

`OllamaProvider` SHALL extraer el conteo de tokens de la respuesta de la API de Ollama y devolverlo en `ChatResult.usage`. La API de Ollama devuelve `prompt_eval_count` (tokens del prompt) y `eval_count` (tokens generados) en el body de la respuesta.

#### Scenario: Tokens extraídos de respuesta Ollama
- **WHEN** el proveedor activo es Ollama y el endpoint devuelve `prompt_eval_count: 150` y `eval_count: 80`
- **THEN** `ChatResult.usage` SHALL ser `TokenUsage(prompt_tokens=150, completion_tokens=80, total_tokens=230)`

#### Scenario: Ollama sin datos de tokens
- **WHEN** la respuesta de Ollama no incluye `prompt_eval_count` o `eval_count`
- **THEN** `ChatResult.usage` SHALL ser `None` sin error

---

### Requirement: Debug por turno persistido en base de datos

El backend SHALL persistir los datos de debug de cada turno de conversación en la tabla `messages`. Los datos SHALL almacenarse en las columnas `system_prompt TEXT`, `messages_sent TEXT` (JSON), `prompt_tokens INTEGER`, `completion_tokens INTEGER` y `total_tokens INTEGER` de la fila del mensaje assistant. Esto permite recuperar el contexto exacto enviado al LLM para cualquier turno, incluso en sesiones cerradas.

#### Scenario: Debug guardado con cada respuesta del asistente
- **WHEN** el LLM genera una respuesta para un mensaje del investigador
- **THEN** la fila del mensaje assistant en la tabla `messages` SHALL contener el system_prompt, messages_sent (JSON), y los token counts de ese turno

#### Scenario: Debug recuperado al cargar sesión del historial
- **WHEN** el investigador carga una sesión cerrada desde el sidebar
- **THEN** los mensajes devueltos SHALL incluir los datos de debug para cada mensaje assistant, permitiendo al frontend mostrarlos en las burbujas de usuario correspondientes

