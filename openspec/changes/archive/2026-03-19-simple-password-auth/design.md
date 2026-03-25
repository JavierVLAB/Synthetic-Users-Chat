## Context

La aplicación Moeve de usuarios sintéticos está accesible desde cualquier navegador sin control de acceso. El backend es FastAPI con autenticación admin_token ya definida en config pero sin uso activo. El frontend es Next.js App Router. La configuración centralizada usa pydantic-settings con `.env`.

No existe base de datos de usuarios. El requisito es una sola barrera de entrada: una password compartida para el equipo.

## Goals / Non-Goals

**Goals:**
- Una sola password de entrada que protege toda la aplicación
- El token persiste 30 días en localStorage (el usuario no necesita volver a autenticarse)
- Todos los endpoints de la API quedan protegidos por JWT
- Si el token expira o no existe, el usuario es redirigido a `/login`

**Non-Goals:**
- Cuentas de usuario individuales
- Registro o recuperación de password
- Roles ni permisos
- Protección de la password en tránsito más allá de HTTPS (se asume HTTPS en producción)
- Invalidación de tokens individuales (cambiar la password en `.env` invalida todos)

## Decisions

### 1. JWT firmado con secret derivado de la password

La password se almacena en `.env` como `ACCESS_PASSWORD`. El backend no guarda estado de sesiones de auth: verifica el JWT con `python-jose` usando `ACCESS_PASSWORD` como secret de firma (HS256). Cambiar la password en `.env` invalida todos los tokens existentes automáticamente.

**Alternativa considerada:** comparar directamente la password en cada request. Descartado porque requeriría enviar la password en cada llamada.

### 2. Token en localStorage, no en cookie HttpOnly

Para este tool interno `localStorage` es suficiente y más simple de implementar en Next.js App Router. Una cookie HttpOnly requeriría un endpoint adicional en Next.js para leerla server-side o configurar el dominio correctamente con el backend.

**Trade-off aceptado:** localStorage es vulnerable a XSS, pero dado que es un tool interno sin datos de usuarios finales, el riesgo es aceptable.

### 3. Protección en middleware de Next.js + dependencia en FastAPI

Dos capas:
- **Frontend**: `middleware.ts` de Next.js intercepta todas las rutas y redirige a `/login` si no hay token válido en `localStorage` (vía cookie de sesión de corta duración que el cliente setea tras login).
- **Backend**: dependencia `get_current_user` en FastAPI que verifica el JWT en el header `Authorization: Bearer <token>`. Devuelve `401` si inválido o ausente.

**Nota sobre localStorage en middleware Next.js**: el middleware corre en el Edge Runtime y no tiene acceso a localStorage. La solución es que tras el login el frontend guarda el token en localStorage Y también lo setea en una cookie accesible (no HttpOnly) para que el middleware pueda leerla.

### 4. Expiración de 30 días

JWT con `exp` de 30 días desde emisión. No hay refresh automático. Cuando expira, el usuario vuelve a ver la pantalla de login.

### 5. Variable de entorno `ACCESS_PASSWORD`

Se reutiliza el campo `admin_token` existente en `config.py` renombrándolo a `access_password`, manteniendo compatibilidad con `.env` actual si ya tiene `ADMIN_TOKEN` definido. Si no, se añade `ACCESS_PASSWORD` al `.env`.

## Risks / Trade-offs

- **Password en texto plano en `.env`** → Mitigation: `.env` no debe committearse (ya en `.gitignore`)
- **localStorage vulnerable a XSS** → Mitigation: el proyecto no renderiza contenido de terceros ni tiene inputs que ejecuten scripts; riesgo mínimo en tool interno
- **Sin invalidación por token** → Mitigation: cambiar `ACCESS_PASSWORD` en `.env` y reiniciar el servidor invalida todos los tokens
- **Middleware Next.js necesita cookie temporal** → Mitigation: cookie con nombre `auth-token`, `SameSite=Strict`, sin HttpOnly, misma vida que el JWT

## Migration Plan

1. Añadir `ACCESS_PASSWORD` al `.env` (y `.env.example`)
2. Deploy del backend con el nuevo router de auth y middleware JWT
3. Deploy del frontend con la página `/login` y el middleware
4. Los usuarios ven la pantalla de login en su próxima visita
5. Rollback: revertir middleware de FastAPI a pass-through y eliminar `middleware.ts`

## Open Questions

~~- ¿Hay un `.env.example` o equivalente donde documentar la nueva variable? → Verificar al implementar~~
→ Resuelto: el `.env` actúa como plantilla. Se añadió `ACCESS_PASSWORD` con comentario explicativo.

## Decisiones tomadas durante la implementación

### 6. Route Handler para el login en Docker

En el entorno Docker, el frontend tiene `NEXT_PUBLIC_API_URL=/api` compilado en el build. El browser llama a `POST /api/auth/login` que llega al servidor Next.js. El middleware de Next.js interceptaba esa request (sin cookie todavía) y redirigía a `/login` con un 307, que preserva el método POST, causando `POST /login → 405`.

**Solución implementada:**
- Excluir rutas `/api/` del matcher del middleware
- Crear `frontend/app/api/auth/login/route.ts` como Route Handler de Next.js que proxea la llamada al backend FastAPI por la red interna Docker (`http://synthetic-user-chat-backend:8000`). Esto es necesario porque el browser no puede alcanzar el backend directamente en producción — solo puede pasar por el servidor Next.js
- El Route Handler lee `BACKEND_URL` en runtime (no en build). Se añadió `BACKEND_URL=http://synthetic-user-chat-backend:8000` al `environment` del servicio frontend en `docker-compose.yml` para que esté disponible en el contenedor runner (el Dockerfile solo lo tenía como build ARG en la etapa builder, no en la etapa runner)

**Por qué no bastó con el rewrite de `next.config.ts`:**
El rewrite `/api/:path*` tiene menor prioridad que los Route Handlers (filesystem routes). Una vez creado el Route Handler, el rewrite ya no procesa `/api/auth/login`. El Route Handler necesita `BACKEND_URL` en runtime, de ahí el cambio en `docker-compose.yml`.
