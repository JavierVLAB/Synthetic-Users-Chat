## MODIFIED Requirements

### Requirement: Panel de debug accesible desde sesión activa

El sistema SHALL proporcionar un panel de debug accesible únicamente durante una sesión activa (no en modo lectura). El panel SHALL abrirse y cerrarse mediante un botón discreto con icono de bug (`BugReportIcon`) situado en el área de conversación. El panel SHALL renderizarse como un drawer lateral derecho de ancho fijo `380px` en desktop y ancho completo en móvil, superpuesto al chat sin desplazar el layout.

#### Scenario: Botón de debug visible solo con sesión activa
- **WHEN** hay una sesión activa y no está en modo lectura (`isViewMode=false`)
- **THEN** SHALL mostrarse el botón de debug (icono `BugReportIcon`) en el área de conversación

#### Scenario: Botón de debug oculto sin sesión o en modo lectura
- **WHEN** no hay sesión activa O la sesión está en modo lectura (`isViewMode=true`)
- **THEN** el botón de debug NO SHALL mostrarse

#### Scenario: Toggle del panel
- **WHEN** el investigador hace click en el botón de debug
- **THEN** el drawer SHALL abrirse si estaba cerrado, o cerrarse si estaba abierto

#### Scenario: Cerrar con botón X
- **WHEN** el drawer de debug está abierto y el investigador hace click en el botón de cerrar (X)
- **THEN** el drawer SHALL cerrarse

---

### Requirement: Tab "Contexto" — historial de debug por turno

El panel de debug SHALL incluir una tab "Contexto" (anteriormente "Prompt") que muestra el historial de debug acumulado por turno. Cada turno SHALL mostrarse como un item colapsable con: número de turno, token count del turno, system prompt completo y lista de mensajes enviados al LLM en esa ventana. El turno más reciente SHALL estar expandido por defecto.

#### Scenario: Historial vacío antes del primer mensaje
- **WHEN** hay sesión activa pero aún no se ha enviado ningún mensaje
- **THEN** la tab "Contexto" SHALL mostrar "Envía el primer mensaje para ver el contexto enviado a la IA"

#### Scenario: Turno añadido tras respuesta
- **WHEN** el investigador envía un mensaje y recibe respuesta
- **THEN** un nuevo turno SHALL aparecer en la lista con el system prompt y los `messages_sent` de ese turno

#### Scenario: System prompt y mensajes visibles por turno
- **WHEN** el investigador expande un turno en el historial
- **THEN** SHALL verse el system prompt completo en un textarea de solo lectura y debajo la lista numerada de mensajes enviados al LLM (`[user] mensaje...`, `[assistant] respuesta...`)

#### Scenario: Ventana de contexto truncada — indicador visible
- **WHEN** `messages_sent.length` es menor que el total de mensajes de la sesión
- **THEN** el turno SHALL mostrar un badge o nota: "Ventana: N de M mensajes" para indicar que el historial fue truncado

---

### Requirement: Tab "Tokens" — historial de uso por turno

El panel de debug SHALL incluir una tab "Tokens" que muestra el uso de tokens de todos los turnos de la sesión en formato tabla: número de turno, prompt tokens, completion tokens, total. La última fila SHALL mostrar los totales acumulados de la sesión.

#### Scenario: Tabla de tokens tras varios turnos
- **WHEN** se han enviado 3 mensajes y todos tienen datos de tokens
- **THEN** la tabla SHALL mostrar 3 filas (una por turno) más una fila de totales

#### Scenario: Proveedor sin soporte de tokens
- **WHEN** el proveedor activo es Ollama o HuggingFace y no retorna tokens
- **THEN** las celdas de tokens SHALL mostrar "—" con un tooltip: "Este proveedor no reporta uso de tokens"

---

### Requirement: Tab "Editar datos" — editor de secciones con texto resuelto

El panel de debug SHALL incluir una tab "Editar datos" que muestra el texto resuelto (ya interpolado, listo para inyectarse en el prompt) de cada sección: perfil de comportamiento, brief de producto y departamento (si aplica). El texto SHALL mostrarse en textareas editables organizadas por sección con cabecera identificativa. Los cambios se almacenan como overrides de sesión y se aplican en todos los mensajes posteriores sin afectar los archivos fuente.

#### Scenario: Texto resuelto visible tras primer mensaje
- **WHEN** el investigador abre la tab "Editar datos" tras enviar el primer mensaje
- **THEN** cada sección SHALL mostrar el texto exacto que se inyectó en el system prompt (no el YAML crudo)

#### Scenario: Edición y aplicación en turno siguiente
- **WHEN** el investigador edita el texto del brief en la tab "Editar datos" y envía un nuevo mensaje
- **THEN** el system prompt de ese turno SHALL usar el texto editado, y el historial de debug SHALL reflejar el override en el nuevo turno

#### Scenario: Indicador de override activo
- **WHEN** una sección tiene un override activo (texto diferente al original)
- **THEN** la cabecera de esa sección SHALL mostrar un badge o indicador "Editado"

#### Scenario: Restaurar texto original
- **WHEN** el investigador hace click en "Restaurar original" de una sección
- **THEN** el override SHALL eliminarse y el texto SHALL volver al cargado desde el archivo
