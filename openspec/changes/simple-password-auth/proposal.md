## Why

La aplicación es una herramienta interna de Moeve accesible desde cualquier navegador, sin restricción de acceso. Cualquier persona con la URL puede entrar y usar el sistema. Se necesita una barrera de entrada mínima para que solo el equipo autorizado pueda acceder.

## What Changes

- Nueva pantalla de login que aparece al entrar si no hay sesión autenticada
- Endpoint `POST /auth/login` en el backend que valida un password contra la variable de entorno y devuelve un JWT de 30 días
- Middleware en Next.js que redirige a `/login` si no hay token válido en localStorage
- El token JWT se almacena en `localStorage` y se incluye en todas las llamadas a la API
- El backend protege todos los endpoints excepto `/health` y `/auth/login`

## Capabilities

### New Capabilities

- `simple-auth`: Autenticación de entrada única basada en password compartido. Incluye endpoint de login, generación de JWT, middleware de protección de rutas en frontend y protección de endpoints en backend.

### Modified Capabilities

- `session-management`: Las llamadas a la API de sesiones ahora requieren header de autorización con JWT válido.
- `chat-interface`: La interfaz principal solo se renderiza si el usuario está autenticado; en caso contrario redirige a `/login`.

## Impact

- **Backend**: Nuevo router `auth.py`, nuevo middleware de verificación JWT, dependencia `python-jose` o `PyJWT`
- **Frontend**: Nueva página `app/login/page.tsx`, nuevo `middleware.ts` en raíz, actualización del servicio `api.ts` para incluir el token en headers
- **Variables de entorno**: Nueva variable `ACCESS_PASSWORD` en `.env`
- **Sin cambio de base de datos**: No se crean tablas ni modelos nuevos
