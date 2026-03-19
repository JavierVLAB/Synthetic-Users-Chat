# Spec: llm-engine

Motor conversacional multi-LLM. Gestiona la construcción del system prompt, el historial de conversación, la selección de proveedor y el envío de mensajes al LLM activo.

---

## ADDED Requirements

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
