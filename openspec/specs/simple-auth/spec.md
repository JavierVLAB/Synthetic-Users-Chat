# Spec: simple-auth

Autenticación de entrada única basada en password compartido. Protege toda la aplicación con un JWT de 30 días almacenado en localStorage. No hay cuentas de usuario ni registro.

---

## ADDED Requirements

### Requirement: Endpoint de login

El sistema SHALL exponer `POST /auth/login` que acepta un password en el body, lo compara con `ACCESS_PASSWORD` del `.env`, y devuelve un JWT firmado con HS256 y expiración de 30 días si el password es correcto.

#### Scenario: Login exitoso

- **WHEN** el cliente envía `POST /auth/login` con `{ "password": "<correcto>" }`
- **THEN** el backend SHALL responder `200` con `{ "access_token": "<jwt>", "token_type": "bearer" }`

#### Scenario: Password incorrecto

- **WHEN** el cliente envía `POST /auth/login` con un password que no coincide con `ACCESS_PASSWORD`
- **THEN** el backend SHALL responder `401` con `{ "detail": "Password incorrecto" }`

#### Scenario: Token con expiración de 30 días

- **WHEN** se genera un token tras login exitoso
- **THEN** el JWT SHALL incluir `exp` con un valor 30 días en el futuro desde el momento de emisión

---

### Requirement: Protección de endpoints con JWT

Todos los endpoints del backend, excepto `GET /health` y `POST /auth/login`, SHALL requerir un header `Authorization: Bearer <token>` con un JWT válido. Requests sin token o con token inválido/expirado SHALL ser rechazados.

#### Scenario: Request autenticado correctamente

- **WHEN** el cliente envía una request con `Authorization: Bearer <jwt-válido>`
- **THEN** el backend SHALL procesar la request normalmente

#### Scenario: Request sin token

- **WHEN** el cliente envía una request sin header `Authorization`
- **THEN** el backend SHALL responder `401` con `{ "detail": "No autenticado" }`

#### Scenario: Token expirado

- **WHEN** el cliente envía una request con un JWT cuya fecha `exp` ya pasó
- **THEN** el backend SHALL responder `401` con `{ "detail": "Token expirado" }`

#### Scenario: Token con firma inválida

- **WHEN** el cliente envía una request con un JWT que no fue firmado con el `ACCESS_PASSWORD` actual
- **THEN** el backend SHALL responder `401` con `{ "detail": "Token inválido" }`

#### Scenario: Endpoints públicos no requieren token

- **WHEN** el cliente llama a `GET /health` o `POST /auth/login` sin header de autorización
- **THEN** el backend SHALL procesar la request normalmente sin exigir JWT

---

### Requirement: Pantalla de login en el frontend

El sistema SHALL mostrar una pantalla de login en la ruta `/login` con un campo de password y un botón de acceso. Tras login exitoso, SHALL redirigir a la ruta raíz `/`.

#### Scenario: Renderizado de la pantalla de login

- **WHEN** el usuario accede a `/login` sin estar autenticado
- **THEN** SHALL mostrarse el logo Moeve, un campo de password y el botón "Acceder"

#### Scenario: Login exitoso desde el frontend

- **WHEN** el usuario introduce el password correcto y hace click en "Acceder"
- **THEN** el frontend SHALL llamar a `POST /api/auth/login` (proxeado por el Route Handler de Next.js al backend), guardar el JWT en `localStorage` con clave `moeve-auth-token`, setear una cookie `auth-token` con el mismo valor para el middleware de Next.js, y redirigir a `/`

#### Scenario: Password incorrecto en el frontend

- **WHEN** el usuario introduce un password incorrecto y hace click en "Acceder"
- **THEN** SHALL mostrarse un mensaje de error "Password incorrecto" sin redirigir

#### Scenario: Envío con Enter

- **WHEN** el usuario está en el campo de password y pulsa Enter
- **THEN** SHALL ejecutarse el mismo comportamiento que hacer click en "Acceder"

---

### Requirement: Persistencia del token y redirección automática

El token JWT SHALL persistir en localStorage 30 días. El middleware de Next.js SHALL verificar la presencia del token en cada navegación y redirigir a `/login` si no existe o ha expirado.

#### Scenario: Usuario ya autenticado abre la app

- **WHEN** el usuario abre la aplicación y tiene un token válido en localStorage
- **THEN** SHALL acceder directamente a `/` sin ver la pantalla de login

#### Scenario: Token expirado al abrir la app

- **WHEN** el usuario abre la aplicación y el token en localStorage ha expirado
- **THEN** el middleware SHALL redirigir a `/login`

#### Scenario: Acceso directo a ruta protegida sin token

- **WHEN** el usuario intenta acceder a `/` sin token
- **THEN** el middleware SHALL redirigir a `/login`

---

### Requirement: Inclusión automática del token en llamadas a la API

El cliente de API del frontend SHALL incluir automáticamente el header `Authorization: Bearer <token>` en todas las llamadas al backend, leyendo el token de localStorage.

#### Scenario: Token incluido en todas las requests

- **WHEN** el frontend realiza cualquier llamada a la API del backend
- **THEN** SHALL incluir el header `Authorization: Bearer <token>` con el JWT almacenado en localStorage

#### Scenario: Token ausente al hacer request

- **WHEN** el frontend intenta hacer una request sin token en localStorage
- **THEN** la llamada SHALL enviarse sin header de autorización y el backend responderá `401`

---

### Requirement: Route Handler de Next.js para el login en Docker

El sistema SHALL exponer `POST /api/auth/login` como Route Handler de Next.js que proxea la llamada al backend FastAPI por la red interna Docker. Esto permite al browser hacer llamadas relativas (`/api/auth/login`) sin exponer el backend directamente.

#### Scenario: Proxy de login en producción Docker

- **WHEN** el browser llama a `POST /api/auth/login`
- **THEN** el servidor Next.js SHALL reenviar la request a `http://synthetic-user-chat-backend:8000/auth/login` y devolver la respuesta al browser
