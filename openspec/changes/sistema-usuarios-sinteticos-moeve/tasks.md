# Tasks: Sistema de usuarios sintéticos Moeve

## 1. Infraestructura y scaffolding del monorepo

- [x] 1.1 Crear estructura de directorios del monorepo: `/frontend`, `/backend`, directorios de datos y prompts
- [x] 1.2 Crear `docker-compose.yml` con servicios frontend (Vite dev server) y backend (Uvicorn), volúmenes para datos y SQLite
- [x] 1.3 Crear `Dockerfile` del frontend (Node + Vite build)
- [x] 1.4 Crear `Dockerfile` del backend (Python 3.11 + dependencias de WeasyPrint: Cairo, Pango)
- [x] 1.5 Crear `.env.example` con todas las variables documentadas: `LLM_PROVIDER`, `OPENAI_API_KEY`, `ANTHROPIC_API_KEY`, `OLLAMA_BASE_URL`, `OLLAMA_MODEL`, `MAX_CONTEXT_MESSAGES`, `ADMIN_TOKEN`, `ALLOWED_ORIGINS`
- [x] 1.6 Crear `README.md` raíz con descripción, requisitos, instrucciones de arranque local y con Docker

## 2. Backend — Setup y configuración base

- [x] 2.1 Inicializar proyecto FastAPI con estructura de directorios: `app/routers/`, `app/services/`, `app/models/`, `app/providers/`, `app/db/`
- [x] 2.2 Crear `requirements.txt` con dependencias: fastapi, uvicorn, pydantic, python-dotenv, aiosqlite, databases, openai, anthropic, weasyprint, slowapi, python-multipart, PyYAML
- [x] 2.3 Configurar `main.py`: instancia FastAPI, CORS con `ALLOWED_ORIGINS`, registro de routers, startup/shutdown events
- [x] 2.4 Implementar inicialización de SQLite en startup: crear tablas `sessions` y `messages` si no existen
- [x] 2.5 Crear `app/db/queries.py` con funciones de acceso a datos: `create_session`, `get_session`, `close_session`, `save_message`, `get_messages`
- [x] 2.6 Implementar `GET /health` que devuelve `{ status: "ok", version: "1.0.0" }`
- [x] 2.7 Crear `README.md` del backend con estructura de proyecto y decisiones técnicas

## 3. Backend — Sistema de perfiles y briefs

- [x] 3.1 Crear `data/profiles/empleado.yaml` con perfil de empleado Moeve: características del puesto, contexto laboral, relación con la tecnología — sin datos personales (sin nombre, edad ni género)
- [x] 3.2 Crear dos perfiles de comportamiento placeholder: `data/profiles/explorador.yaml` y `data/profiles/conservador.yaml` — patrones de comportamiento y características profesionales, sin datos personales
- [x] 3.3 Crear brief placeholder: `data/briefs/chatbot-ingenieria.yaml` — app de chatbot IA para ingeniería; marcar claramente como placeholder hasta recibir el brief real del cliente
- [x] 3.4 Implementar `app/services/profile_service.py`: carga de `empleado.yaml` en startup, listado y lectura de perfiles de comportamiento desde directorio
- [x] 3.5 Implementar `app/services/brief_service.py`: listado y lectura de briefs desde directorio
- [x] 3.6 Implementar `app/routers/profiles.py`: `GET /profiles`, `GET /profiles/{id}`, `POST /profiles`, `PUT /profiles/{id}`, `DELETE /profiles/{id}` (escritura protegida con `X-Admin-Token`, empleado no modificable)
- [x] 3.7 Implementar `app/routers/briefs.py`: `GET /briefs`, `GET /briefs/{id}`, `POST /briefs`, `PUT /briefs/{id}`, `DELETE /briefs/{id}` (escritura protegida con `X-Admin-Token`)
- [x] 3.8 Crear `app/models/profile.py` y `app/models/brief.py` con schemas Pydantic para request/response

## 4. Backend — Motor LLM

- [x] 4.1 Crear `prompts/system_prompt_template.txt` con plantilla inicial que instruye al LLM a actuar como usuario sintético, con variables `{perfil_empleado}`, `{perfil_comportamiento}` y `{brief_producto}`
- [x] 4.2 Implementar clase base abstracta `app/providers/base.py`: `LLMProvider` con método `async chat(messages, system_prompt) -> str`
- [x] 4.3 Implementar `app/providers/openai_provider.py`: llamada a GPT-4 con `OPENAI_API_KEY`, manejo de errores y timeout
- [x] 4.4 Implementar `app/providers/anthropic_provider.py`: llamada a Claude con `ANTHROPIC_API_KEY`, manejo de errores y timeout
- [x] 4.5 Implementar `app/providers/ollama_provider.py`: llamada a Ollama con `OLLAMA_BASE_URL` y `OLLAMA_MODEL`, manejo de errores y timeout
- [x] 4.6 Implementar `app/services/llm_service.py`: factory que devuelve el provider correcto según `LLM_PROVIDER` env var o parámetro, interpolación de plantilla de prompt, ventana deslizante de historial (`MAX_CONTEXT_MESSAGES`)
- [x] 4.7 Añadir manejo de errores del LLM en `llm_service.py`: respuestas `502` y `504` con mensajes amigables, logging detallado en servidor

## 5. Backend — Sesiones y conversación

- [x] 5.1 Crear `app/models/session.py`: schemas Pydantic para `CreateSessionRequest`, `SessionResponse`, `ChatRequest`, `ChatResponse`
- [x] 5.2 Implementar `app/routers/sessions.py`: `POST /sessions`, `GET /sessions/{id}`, `DELETE /sessions/{id}`
- [x] 5.3 Implementar `POST /sessions/{id}/chat` en el router de sesiones: valida sesión activa, guarda mensaje usuario, llama `llm_service`, guarda respuesta, devuelve respuesta
- [x] 5.4 Configurar `slowapi` en `main.py`: límite 10 req/min en `POST /sessions`, 30 req/min en `POST /sessions/{id}/chat`

## 6. Backend — Cuestionarios

- [x] 6.1 Crear `app/models/questionnaire.py`: schema Pydantic para `QuestionnaireRequest` (lista de strings, max 50 items)
- [x] 6.2 Implementar `POST /sessions/{id}/questionnaire` en el router de sesiones: validación (sesión activa, lista no vacía, máx 50 preguntas), construcción del mensaje agrupado con instrucciones de formato, llamada al LLM, persistencia y respuesta
- [x] 6.3 Añadir en `llm_service.py` la construcción del prompt de cuestionario que instruye al LLM a responder cada pregunta numerada

## 7. Backend — Generación de PDF

- [x] 7.1 Crear plantilla HTML para el PDF: `backend/templates/session_report.html` con logo Moeve, colores corporativos (`#004656`, `#047dba`), tipografía fallback sans-serif (WeasyPrint no soporta `.otf` local directamente)
- [x] 7.2 Implementar `app/services/pdf_service.py`: carga de datos de sesión, mensajes e historial, renderizado de template HTML con Jinja2, generación de bytes PDF con WeasyPrint
- [x] 7.3 Implementar `GET /sessions/{id}/pdf` en el router de sesiones: genera PDF, devuelve `StreamingResponse` con `Content-Type: application/pdf` y `Content-Disposition` con nombre de archivo
- [x] 7.4 Verificar que la sección de cuestionario aparece diferenciada en el PDF

## 8. Frontend — Setup y configuración

- [x] 8.1 Inicializar proyecto Next.js 16 con `create-next-app@latest`: App Router, TypeScript, TailwindCSS
- [x] 8.2 Configurar tokens de color y tipografía extraídos de Figma (Tailwind v4: definidos en `globals.css` con `@theme inline` en lugar de `tailwind.config.ts`)
- [x] 8.3 Declarar `@font-face` en CSS global para Moeve Sans Regular, Light y Bold (`.otf`), con fallback `sans-serif`; añadir archivos de fuente en `public/fonts/`
- [x] 8.4 Crear cliente axios en `services/api.ts` con base URL configurable por variable de entorno `NEXT_PUBLIC_API_URL`
- [x] 8.5 Configurar ESLint + Prettier con reglas estándar de Next.js/React
- [x] 8.6 Crear `README.md` del frontend con estructura y decisiones técnicas

## 9. Frontend — Layout y componentes UI base

- [x] 9.1 Implementar `Header` fijo con logo Moeve a la izquierda, título "Sistema de usuarios sintéticos" y sección de usuario a la derecha, fondo `#ffffff`, borde `#9bcbe3`
- [x] 9.2 Implementar `Footer` fijo con texto izquierda/derecha, borde `#9bcbe3`
- [x] 9.3 Implementar componentes UI primitivos: `Button` (primary `#90ffbb`/`#004656`, disabled, sizes), `Alert` (error, success, info), `Select` (dropdown), `Collapse` (acordeón)
- [x] 9.4 Implementar `MainPage` como única página con layout de columna centrada: Header + Accordion + ChatArea + InputBar + Footer (sin sidebar)

## 10. Frontend — Accordion de configuración y sesión

- [x] 10.1 Implementar `SessionAccordion`: componente que alterna entre estado "configuración" (expandido, con selects) y estado "sesión activa" (colapsado, con resumen + botón cerrar sesión)
- [x] 10.2 Implementar `ProfileSelect`: dropdown que carga `GET /profiles` al montar, muestra nombre de cada perfil
- [x] 10.3 Implementar `BriefSelect`: dropdown que carga `GET /briefs` al montar
- [x] 10.4 Lógica de habilitación del botón "Iniciar sesión": activo solo cuando perfil Y brief están seleccionados
- [x] 10.5 Crear `SessionContext` (Context API) para compartir `session_id`, perfil, brief y estado de sesión en toda la app
- [x] 10.6 Al iniciar sesión: colapsar accordion automáticamente y mostrar resumen "Perfil: X · Brief: Y · LLM: Z"
- [x] 10.7 Al cerrar sesión: expandir accordion y resetear selects para nueva sesión

## 11. Frontend — Interfaz de chat

- [x] 11.1 Implementar `ChatArea`: contenedor scrollable de mensajes, auto-scroll al último mensaje, estado vacío cuando no hay sesión
- [x] 11.2 Implementar `MessageBubble` para mensajes del investigador: alineado derecha, fondo `rgba(4,125,186,0.10)`, timestamp HH:MM
- [x] 11.3 Implementar `AssistantMessage`: alineado izquierda, ancho completo, renderizado markdown con `react-markdown`, timestamp HH:MM
- [x] 11.4 Implementar `AnimatedLoader`: spinner con texto "Generando respuesta..." en posición del próximo mensaje del asistente
- [x] 11.6 Implementar `InputBar`: textarea multilinea, Enter envía / Shift+Enter salto de línea, botón enviar deshabilitado si vacío, deshabilitado durante generación, botón `+` para cuestionario

## 12. Frontend — Cuestionario

- [x] 12.1 Implementar `QuestionnaireUpload`: modal/panel activado por botón `+`, acepta archivo `.txt`, muestra preview de preguntas numeradas, botón de confirmación de envío
- [x] 12.2 Validaciones en frontend: archivo no `.txt` → Alert error, archivo vacío → Alert error
- [x] 12.3 Integrar envío de cuestionario con `POST /sessions/{id}/questionnaire` y mostrar respuesta en el chat como mensaje normal del asistente

## 13. Frontend — Cierre de sesión y PDF

- [x] 13.1 Implementar `CloseSessionModal`: resumen de sesión (perfil, brief, nº mensajes), botón "Descargar PDF", botón "Cerrar sin descargar", botón "Cancelar"
- [x] 13.2 Implementar descarga de PDF: llamada a `GET /sessions/{id}/pdf`, trigger de descarga en navegador sin cerrar el modal
- [x] 13.3 Implementar cierre de sesión: llamada a `DELETE /sessions/{id}`, reseteo de `SessionContext`, vuelta al estado inicial de selección

## 14. Tests

- [x] 14.1 Test backend: `POST /sessions` crea sesión con UUID único
- [x] 14.2 Test backend: `POST /sessions/{id}/chat` devuelve respuesta y persiste mensajes (mock del LLM provider)
- [x] 14.3 Test backend: sesión cerrada devuelve `409` en intento de chat
- [x] 14.4 Test backend: `POST /sessions/{id}/questionnaire` con lista vacía devuelve `422`
- [x] 14.5 Test backend: `POST /sessions/{id}/questionnaire` con más de 50 preguntas devuelve `400`
- [x] 14.6 Test backend: endpoints de escritura de perfiles/briefs sin `X-Admin-Token` devuelven `401`
- [x] 14.7 Test backend: `GET /profiles` lista los archivos del directorio de perfiles (excluyendo `empleado.yaml`)

## 15. Revisión final y documentación

- [ ] 15.1 Verificar que no hay credenciales hardcodeadas en ningún archivo del repositorio
- [ ] 15.2 Verificar que `.env` está en `.gitignore` y `.env.example` está en el repositorio
- [ ] 15.3 Crear archivos de perfil con comentarios explicando la estructura y campos de ejemplo
- [ ] 15.4 Crear archivos de brief con comentarios explicando la estructura y campos de ejemplo
- [ ] 15.5 Smoke test completo con Docker Compose: levantar, crear sesión, conversar, subir cuestionario, descargar PDF, cerrar sesión
- [ ] 15.6 Verificar CORS: solo los orígenes de `ALLOWED_ORIGINS` pueden hacer requests al backend
- [ ] 15.7 Revisión de legibilidad del backend: todas las funciones públicas tienen docstring, type hints en todas las funciones, nombres descriptivos sin abreviaturas, sin lógica de negocio en los routers
- [ ] 15.8 Revisión de legibilidad del frontend: JSDoc en hooks y funciones complejas, nombres de componentes y props descriptivos, sin lógica en los componentes de presentación
- [ ] 15.9 Verificar que el `README.md` raíz explica el proyecto de forma que un developer externo pueda entenderlo, levantarlo y contribuir sin preguntar nada
