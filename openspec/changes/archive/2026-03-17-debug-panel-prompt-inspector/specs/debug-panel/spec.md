## ADDED Requirements

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

### Requirement: Tab "Prompt" — system prompt del turno actual

El panel de debug SHALL incluir una tab "Prompt" que muestra el system prompt completo ensamblado que fue enviado al LLM en el último turno de conversación. Si aún no se ha enviado ningún mensaje, SHALL mostrarse el estado vacío con indicación de que el prompt aparecerá tras el primer mensaje.

#### Scenario: System prompt tras primer mensaje
- **WHEN** el investigador envía el primer mensaje y recibe respuesta
- **THEN** la tab "Prompt" SHALL mostrar el system prompt completo en un textarea de solo lectura con fuente monospace

#### Scenario: System prompt se actualiza por turno
- **WHEN** el investigador envía un mensaje adicional
- **THEN** la tab "Prompt" SHALL reflejar el system prompt del último turno (puede variar si se editan los datos fuente entre turnos)

#### Scenario: Estado vacío antes del primer mensaje
- **WHEN** hay sesión activa pero aún no se ha enviado ningún mensaje
- **THEN** la tab "Prompt" SHALL mostrar el texto "Envía el primer mensaje para ver el prompt ensamblado"

---

### Requirement: Tab "Tokens" — conteo de uso del último turno

El panel de debug SHALL incluir una tab "Tokens" que muestra el uso de tokens del último turno: prompt tokens, completion tokens y total. Los valores SHALL actualizarse con cada turno de conversación.

#### Scenario: Tokens mostrados tras respuesta
- **WHEN** el backend devuelve una respuesta con datos de uso
- **THEN** la tab "Tokens" SHALL mostrar tres filas: "Prompt tokens", "Completion tokens", "Total" con sus valores numéricos

#### Scenario: Proveedor sin soporte de tokens
- **WHEN** el proveedor LLM activo es Ollama o HuggingFace y no retorna datos de uso
- **THEN** la tab "Tokens" SHALL mostrar "—" en los tres valores con un tooltip: "Este proveedor no reporta uso de tokens"

#### Scenario: Estado vacío antes del primer mensaje
- **WHEN** hay sesión activa pero aún no se ha enviado ningún mensaje
- **THEN** la tab "Tokens" SHALL mostrar el texto "Envía el primer mensaje para ver el uso de tokens"

---

### Requirement: Tab "Editar datos" — edición inline de fuentes del prompt

El panel de debug SHALL incluir una tab "Editar datos" que permite al investigador ver y editar el contenido del perfil de comportamiento, el brief de producto y el departamento asociados a la sesión activa. La edición SHALL requerir que `NEXT_PUBLIC_ADMIN_TOKEN` esté configurado; si no lo está, los datos se muestran en modo solo lectura.

#### Scenario: Tres secciones de edición visibles
- **WHEN** el investigador abre la tab "Editar datos"
- **THEN** SHALL mostrarse tres secciones: "Perfil de comportamiento", "Brief de producto" y "Departamento" (la última solo si la sesión tiene departamento asociado)

#### Scenario: Edición habilitada con admin token
- **WHEN** `NEXT_PUBLIC_ADMIN_TOKEN` está configurado y el investigador hace click en "Editar" de una sección
- **THEN** SHALL abrirse el `ContentViewerModal` en modo edición para ese ítem

#### Scenario: Solo lectura sin admin token
- **WHEN** `NEXT_PUBLIC_ADMIN_TOKEN` no está configurado
- **THEN** las secciones SHALL mostrarse en modo solo lectura y el botón de edición SHALL estar oculto o deshabilitado

#### Scenario: Sin departamento en la sesión
- **WHEN** la sesión activa no tiene departamento asociado
- **THEN** la sección "Departamento" NO SHALL mostrarse en la tab "Editar datos"
