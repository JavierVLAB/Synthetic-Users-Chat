# Spec: brief-system

Gestión de briefs de producto. Los briefs describen el producto digital que el usuario sintético evaluará. Son archivos de datos libres — extensibles sin tocar código.

---

## ADDED Requirements

### Requirement: Briefs de producto extensibles por archivos

El sistema SHALL leer todos los archivos `.yaml` y `.json` presentes en `backend/data/briefs/` como briefs disponibles. Añadir un nuevo brief SHALL requerir únicamente añadir un archivo en ese directorio, sin modificar código.

#### Scenario: Listado de briefs disponibles
- **WHEN** el cliente llama `GET /briefs`
- **THEN** el backend SHALL responder `200` con `[{ id, name, description? }]` donde `id` es el nombre del archivo sin extensión

#### Scenario: Al menos un brief disponible en el sistema
- **WHEN** el servidor arranca
- **THEN** SHALL existir al menos un archivo de brief de ejemplo en `data/briefs/`

#### Scenario: Nuevo brief añadido tras reinicio
- **WHEN** se añade un archivo `ecommerce.yaml` al directorio de briefs y el servidor se reinicia
- **THEN** `GET /briefs` SHALL incluir `{ id: "ecommerce", name: "..." }` en la respuesta

#### Scenario: Detalle de brief
- **WHEN** el cliente llama `GET /briefs/{id}` con un id válido
- **THEN** el backend SHALL responder `200` con el contenido completo del archivo como objeto

#### Scenario: Brief inexistente
- **WHEN** el cliente llama `GET /briefs/{id}` con un id que no existe
- **THEN** el backend SHALL responder `404` con `{ error: "Brief not found" }`

---

### Requirement: Estructura de archivos de brief flexible

Los archivos de brief son datos libres. El sistema SHALL leer el contenido completo y pasarlo al prompt como texto, sin depender de campos específicos. La estructura es orientativa.

#### Scenario: Brief con campos básicos
- **WHEN** un brief contiene únicamente `name`, `producto` y `descripcion`
- **THEN** el sistema SHALL leerlo y usarlo correctamente en el system prompt

#### Scenario: Brief con campos detallados
- **WHEN** un brief contiene campos adicionales (audiencia objetivo, funcionalidades, propuesta de valor, competidores, KPIs, etc.)
- **THEN** el sistema SHALL incluir todo el contenido en el prompt sin filtrar campos

---

### Requirement: Endpoints de administración de briefs protegidos

El sistema SHALL exponer endpoints CRUD para gestión de briefs (`POST /briefs`, `PUT /briefs/{id}`, `DELETE /briefs/{id}`) protegidos con `X-Admin-Token` header. Estos endpoints NO tienen UI asociada en esta fase.

#### Scenario: Crear brief con token válido
- **WHEN** el cliente envía `POST /briefs` con header `X-Admin-Token: <valor correcto>` y contenido YAML/JSON válido
- **THEN** el backend SHALL guardar el archivo en `data/briefs/` y responder `201` con `{ id, name }`

#### Scenario: Actualizar brief con token válido
- **WHEN** el cliente envía `PUT /briefs/{id}` con token válido y nuevo contenido
- **THEN** el archivo SHALL actualizarse y el backend SHALL responder `200`

#### Scenario: Eliminar brief con token válido
- **WHEN** el cliente envía `DELETE /briefs/{id}` con token válido
- **THEN** el archivo SHALL eliminarse y el backend SHALL responder `200`

#### Scenario: Acceso sin token rechazado
- **WHEN** el cliente envía cualquier request de escritura a `/briefs` sin `X-Admin-Token` o con valor incorrecto
- **THEN** el backend SHALL responder `401` con `{ error: "Unauthorized" }`

---

### Requirement: Brief seleccionado se refleja en el panel de sesión

El nombre del brief activo SHALL mostrarse en el acordeón de sesión de la UI durante toda la conversación.

#### Scenario: Brief visible en panel de sesión
- **WHEN** el investigador inicia una sesión con el brief "App Móvil de Moeve"
- **THEN** el acordeón SHALL mostrar "Brief: App Móvil de Moeve" mientras dure la sesión
