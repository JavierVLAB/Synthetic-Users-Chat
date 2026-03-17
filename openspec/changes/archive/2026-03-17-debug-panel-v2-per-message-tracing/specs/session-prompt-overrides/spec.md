## ADDED Requirements

### Requirement: Overrides de sección por sesión en el endpoint de chat

El sistema SHALL aceptar un campo opcional `overrides` en el body de `POST /sessions/{id}/chat`. Cuando se provee, el texto de cada sección especificada SHALL sustituir al texto cargado desde los archivos fuente al construir el system prompt para ese turno. Los overrides SHALL aplicarse únicamente al turno en que se envían y en todos los turnos posteriores en que el cliente los incluya; no SHALL persistir en la base de datos.

#### Scenario: Override de perfil aplicado
- **WHEN** `POST /sessions/{id}/chat` incluye `{ message: "...", overrides: { profile_text: "Texto personalizado del perfil" } }`
- **THEN** el system prompt de ese turno SHALL usar "Texto personalizado del perfil" como sección de comportamiento, ignorando el contenido del archivo de perfil

#### Scenario: Override parcial — solo una sección
- **WHEN** `overrides` incluye solo `brief_text` pero no `profile_text` ni `department_text`
- **THEN** solo el brief SHALL sustituirse; perfil y departamento SHALL cargarse desde sus archivos normalmente

#### Scenario: Sin overrides — comportamiento normal
- **WHEN** `overrides` está ausente o es `null`
- **THEN** el system prompt SHALL construirse cargando todos los archivos normalmente sin cambios

---

### Requirement: Texto resuelto de secciones devuelto en la respuesta de chat

El endpoint `POST /sessions/{id}/chat` SHALL incluir en su respuesta un objeto `sections` con el texto resuelto (ya interpolado, no el YAML crudo) de las secciones que componen el system prompt: `profile_text`, `brief_text` y opcionalmente `department_text`. Este texto SHALL corresponder exactamente al texto usado en el system prompt del turno actual.

#### Scenario: Sections en primera respuesta
- **WHEN** el investigador envía el primer mensaje de una sesión sin overrides
- **THEN** `sections.profile_text` y `sections.brief_text` SHALL contener el texto cargado desde los archivos, y `sections.department_text` SHALL estar presente solo si la sesión tiene departamento

#### Scenario: Sections reflejan overrides activos
- **WHEN** el investigador envía un mensaje con `overrides: { brief_text: "Texto editado" }`
- **THEN** `sections.brief_text` SHALL devolver "Texto editado" (el override), no el texto del archivo
