# Spec: profile-system

Sistema de perfiles de dos capas: perfil de empleado fijo (siempre presente, no seleccionable en UI) y perfiles de comportamiento seleccionables. Ambos son archivos de datos — no contienen prompts ni instrucciones al LLM.

---

## Requirements

### Requirement: Perfil de empleado fijo cargado automáticamente

El sistema SHALL cargar automáticamente el perfil de empleado desde `backend/data/profiles/empleado.yaml` al iniciar el servidor. Este perfil SHALL estar siempre presente en el system prompt sin necesidad de selección en la UI. NO SHALL existir ningún endpoint público para seleccionar o cambiar el perfil de empleado.

#### Scenario: Carga al arrancar
- **WHEN** el servidor FastAPI arranca
- **THEN** el contenido de `empleado.yaml` SHALL cargarse en memoria y estar disponible para todos los requests de conversación

#### Scenario: Archivo ausente bloquea arranque
- **WHEN** `empleado.yaml` no existe en la ruta esperada
- **THEN** el servidor SHALL fallar al arrancar con un error explícito: `"Employee profile not found at data/profiles/empleado.yaml"`

#### Scenario: No expuesto en la UI
- **WHEN** el investigador usa la interfaz
- **THEN** NO SHALL aparecer ningún control para seleccionar ni modificar el perfil de empleado

---

### Requirement: Perfiles de comportamiento extensibles por archivos

El sistema SHALL leer todos los archivos `.yaml` y `.json` presentes en `backend/data/profiles/` (excepto `empleado.yaml`) como perfiles de comportamiento disponibles. Añadir un nuevo perfil SHALL requerir únicamente añadir un archivo en ese directorio, sin modificar código.

#### Scenario: Listado de perfiles disponibles
- **WHEN** el cliente llama `GET /profiles`
- **THEN** el backend SHALL responder `200` con la lista de perfiles: `[{ id, name, description? }]` donde `id` es el nombre del archivo sin extensión

#### Scenario: Nuevo perfil añadido en caliente
- **WHEN** se añade un archivo `innovador.yaml` al directorio de perfiles y el servidor se reinicia
- **THEN** `GET /profiles` SHALL incluir `{ id: "innovador", name: "..." }` en la respuesta

#### Scenario: Detalle de perfil
- **WHEN** el cliente llama `GET /profiles/{id}` con un id válido
- **THEN** el backend SHALL responder `200` con el contenido completo del archivo como objeto

#### Scenario: Perfil inexistente
- **WHEN** el cliente llama `GET /profiles/{id}` con un id que no corresponde a ningún archivo
- **THEN** el backend SHALL responder `404` con `{ error: "Profile not found" }`

---

### Requirement: Estructura de archivos de perfil flexible centrada en comportamiento y rol profesional

Los archivos de perfil son datos libres. El sistema SHALL leer el contenido completo y pasarlo al prompt como texto, sin depender de campos específicos. Los perfiles describen patrones de comportamiento y características de puesto de trabajo. Los perfiles NO SHALL incluir datos personales identificables como nombre propio, edad, género o información biográfica.

#### Scenario: Perfil con campos de comportamiento y rol
- **WHEN** un archivo de perfil contiene campos como patrones de comportamiento, características del puesto, forma de tomar decisiones, relación con la tecnología, contexto laboral, etc.
- **THEN** el sistema SHALL leerlo correctamente y usarlo en el system prompt sin filtrar ningún campo

#### Scenario: Perfil sin datos personales
- **WHEN** se revisa cualquier archivo de perfil del sistema
- **THEN** NO SHALL contener nombre propio, edad, género ni información biográfica personal — solo características conductuales y profesionales

---

### Requirement: Endpoints de administración de perfiles protegidos

El sistema SHALL exponer endpoints CRUD para gestión de perfiles (`POST /profiles`, `PUT /profiles/{id}`, `DELETE /profiles/{id}`) protegidos con `X-Admin-Token` header. Estos endpoints NO tienen UI asociada en esta fase.

#### Scenario: Crear perfil con token válido
- **WHEN** el cliente envía `POST /profiles` con header `X-Admin-Token: <valor correcto>` y un body con contenido YAML/JSON
- **THEN** el backend SHALL guardar el archivo en `data/profiles/` y responder `201` con `{ id, name }`

#### Scenario: Actualizar perfil con token válido
- **WHEN** el cliente envía `PUT /profiles/{id}` con token válido y nuevo contenido
- **THEN** el archivo SHALL actualizarse y el backend SHALL responder `200`

#### Scenario: Eliminar perfil con token válido
- **WHEN** el cliente envía `DELETE /profiles/{id}` con token válido
- **THEN** el archivo SHALL eliminarse y el backend SHALL responder `200`

#### Scenario: Acceso sin token rechazado
- **WHEN** el cliente envía cualquier request de escritura (`POST/PUT/DELETE`) a `/profiles` sin el header `X-Admin-Token` o con valor incorrecto
- **THEN** el backend SHALL responder `401` con `{ error: "Unauthorized" }`

#### Scenario: El perfil de empleado no se puede eliminar ni modificar vía API
- **WHEN** el cliente intenta `DELETE /profiles/empleado` o `PUT /profiles/empleado` con token válido
- **THEN** el backend SHALL responder `403` con `{ error: "Employee profile cannot be modified via API" }`
