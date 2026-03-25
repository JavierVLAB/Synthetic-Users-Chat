## 1. Configuración y dependencias

- [x] 1.1 Añadir `ACCESS_PASSWORD` al `.env` y al `.env.example` (si existe)
- [x] 1.2 Añadir `access_password: str = ""` a `Settings` en `backend/app/config.py`
- [x] 1.3 Instalar `python-jose[cryptography]` y añadirlo a `requirements.txt`

## 2. Backend — Router de autenticación

- [x] 2.1 Crear `backend/app/routers/auth.py` con el endpoint `POST /auth/login`
- [x] 2.2 Implementar la lógica de validación: comparar password con `settings.access_password` y generar JWT HS256 con `exp` de 30 días
- [x] 2.3 Registrar el router de auth en `backend/main.py`

## 3. Backend — Protección de endpoints

- [x] 3.1 Crear función de dependencia `get_current_user` en `backend/app/dependencies.py` que valida el JWT del header `Authorization`
- [x] 3.2 Añadir `get_current_user` como dependencia en el router `sessions.py`
- [x] 3.3 Añadir `get_current_user` como dependencia en el router `profiles.py`
- [x] 3.4 Añadir `get_current_user` como dependencia en el router `briefs.py`
- [x] 3.5 Verificar que `GET /health` y `POST /auth/login` no requieren el JWT

## 4. Frontend — Página de login

- [x] 4.1 Crear `frontend/app/login/page.tsx` con campo de password y botón "Acceder"
- [x] 4.2 Implementar la llamada a `POST /auth/login` al enviar el formulario
- [x] 4.3 Guardar el JWT en `localStorage` con clave `moeve-auth-token` tras login exitoso
- [x] 4.4 Setear cookie `auth-token` (sin HttpOnly) con el mismo JWT para el middleware de Next.js
- [x] 4.5 Redirigir a `/` tras login exitoso
- [x] 4.6 Mostrar mensaje de error "Password incorrecto" si el backend devuelve `401`
- [x] 4.7 Aplicar estilos del sistema de diseño Moeve (logo, tipografía, colores)

## 5. Frontend — Middleware de protección de rutas

- [x] 5.1 Crear `frontend/middleware.ts` que lea la cookie `auth-token`
- [x] 5.2 Redirigir a `/login` si la cookie no existe o el token ha expirado
- [x] 5.3 Excluir la ruta `/login`, rutas `/api/` y assets estáticos del middleware

## 6. Frontend — Inclusión del token en llamadas a la API

- [x] 6.1 Actualizar `frontend/services/api.ts` para leer el token de `localStorage` e incluirlo en el header `Authorization: Bearer <token>` en todas las llamadas
- [x] 6.2 Manejar respuestas `401` del backend: limpiar el token de localStorage y redirigir a `/login`

## 7. Docker — Proxy del endpoint de login

- [x] 7.1 Crear `frontend/app/api/auth/login/route.ts` como Route Handler de Next.js que proxea `POST /api/auth/login` al backend FastAPI interno
- [x] 7.2 Añadir `BACKEND_URL` como variable de entorno de runtime en el servicio frontend de `docker-compose.yml` para que el Route Handler pueda alcanzar al backend en la red Docker
