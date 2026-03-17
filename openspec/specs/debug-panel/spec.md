# debug-panel Specification

## Purpose
Panel de debug lateral para investigadores. Permite inspeccionar el contexto enviado al LLM por turno (system prompt + mensajes en ventana), el uso de tokens acumulado, y editar los textos de las secciones del prompt en vivo sin modificar los archivos fuente.

## Requirements
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

El panel de debug SHALL incluir una tab "Contexto" que muestra el historial de debug acumulado por turno. Cada turno SHALL mostrarse como un item colapsable con: número de turno, token count del turno, system prompt completo y lista de mensajes enviados al LLM en esa ventana. El turno más reciente SHALL estar expandido por defecto.

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

### Requirement: Debug por mensaje — contexto colapsable en burbuja de usuario

Cada burbuja de mensaje del investigador SHALL incluir una sección de debug colapsable que muestre el contexto LLM correspondiente a ese turno: system prompt, mensajes enviados (ventana) y tokens consumidos. Esta sección SHALL estar disponible tanto en sesiones activas como en sesiones cerradas (modo solo lectura) cargadas desde el historial.

#### Scenario: Debug disponible en sesión activa
- **WHEN** el investigador ha enviado mensajes en una sesión activa
- **THEN** cada burbuja de mensaje SHALL mostrar un toggle "Debug" que al expandirse muestra: tokens (prompt + completion + total), system prompt en textarea readonly, y mensajes enviados al LLM en esa ventana

#### Scenario: Debug disponible en sesiones cerradas cargadas del historial
- **WHEN** el investigador carga una sesión cerrada desde el sidebar
- **THEN** las burbujas de sus mensajes SHALL también mostrar el toggle de debug con la misma información, cargada desde la base de datos

#### Scenario: Debug oculto si no hay datos
- **WHEN** una burbuja de mensaje no tiene datos de debug asociados (sesión anterior a la migración)
- **THEN** el toggle de debug NO SHALL mostrarse para esa burbuja

---

### Requirement: Edición de secciones del prompt desde la configuración de sesión

El investigador SHALL poder editar el texto resuelto de las secciones del system prompt (perfil, brief, departamento) desde el bloque de configuración de sesión activa, no desde el panel de debug. La edición SHALL aplicarse como override en los mensajes posteriores sin modificar los archivos fuente.

#### Scenario: Botón "Ajustar prompt" visible con sesión activa
- **WHEN** hay una sesión activa y ya se ha enviado al menos un mensaje (originalSections disponible)
- **THEN** SHALL mostrarse un botón "Ajustar prompt" (icono TuneIcon) en la barra de sesión activa

#### Scenario: Panel de edición inline colapsable
- **WHEN** el investigador hace click en "Ajustar prompt"
- **THEN** se expande un panel inline bajo la barra de sesión con textareas editables para perfil, brief y departamento (si aplica)

#### Scenario: Indicador de override activo
- **WHEN** una o más secciones tienen overrides activos
- **THEN** el botón "Ajustar prompt" SHALL mostrar un indicador visual (punto ámbar) y cada sección editada SHALL mostrar un badge "Editado"

#### Scenario: Restaurar texto original por sección
- **WHEN** el investigador hace click en "Restaurar original" de una sección
- **THEN** el override de esa sección SHALL eliminarse y el texto SHALL volver al cargado desde el archivo

