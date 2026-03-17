## ADDED Requirements

### Requirement: Botón discreto de debug en la interfaz de conversación

La interfaz SHALL incluir un botón de debug visible únicamente durante una sesión activa no en modo lectura. El botón SHALL usar el icono `BugReportIcon` (MUI), tener apariencia discreta (texto secundario, sin fondo) y posicionarse en el área de conversación (esquina superior derecha del área de chat o junto al input bar).

#### Scenario: Botón visible con sesión activa
- **WHEN** hay una sesión activa (`session !== null`) y no está en modo lectura (`isViewMode === false`)
- **THEN** el botón de debug SHALL mostrarse con `BugReportIcon` y etiqueta "Debug" o solo icono con tooltip

#### Scenario: Botón oculto sin sesión o en modo lectura
- **WHEN** no hay sesión activa O `isViewMode === true`
- **THEN** el botón de debug NO SHALL renderizarse en el DOM

#### Scenario: Estado del prompt y tokens en la página
- **WHEN** el backend responde a un mensaje con `system_prompt` y `usage`
- **THEN** `page.tsx` SHALL almacenar `lastSystemPrompt` y `lastUsage` en estado local y pasarlos al `DebugPanel` como props
