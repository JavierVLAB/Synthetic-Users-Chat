# Proposal: Sistema de usuarios sintéticos Moeve

## Why

Los equipos de investigación UX de Moeve necesitan evaluar productos digitales desde la perspectiva de distintos perfiles de usuario sin depender de la disponibilidad de participantes reales. Esta herramienta permite generar usuarios sintéticos basados en perfiles psicológicos y conversar con ellos mediante IA, acelerando ciclos de investigación y reduciendo costes de reclutamiento.

## What Changes

Este es un proyecto nuevo desde cero. Se construye como monorepo con:

- **Frontend React + Vite + TailwindCSS** — interfaz conversacional con diseño de sistema Moeve extraído de Figma
- **Backend Python + FastAPI** — motor multi-LLM, gestión de sesiones, generación de PDF
- **Docker Compose** — orquestación de servicios para desarrollo y despliegue
- **Sistema de perfiles y briefs basado en archivos** — extensible sin tocar código
- **Sistema de prompts desacoplado** — plantilla independiente de perfiles y briefs
- **Endpoints de administración preparados** para futura UI (aunque la UI no existe aún)

No hay cambios en capabilities existentes (proyecto desde cero).

## Capabilities

### New Capabilities

- `chat-interface`: Interfaz conversacional completa — selección de perfil/brief, panel de sesión colapsable, área de chat con burbujas, markdown, timestamps, acciones por mensaje (👍👎 regenerar, copiar, descargar), spinner de generación, input bar con upload de cuestionario, footer con disclaimer, modal de cierre con descarga PDF.

- `session-management`: Ciclo de vida de sesión — creación con UUID único, almacenamiento de conversación completa, cierre de sesión, generación y descarga de PDF con perfil + brief + conversación. Soporte de sesiones simultáneas aisladas por session_id.

- `profile-system`: Sistema de perfiles de dos capas — perfil de empleado fijo (archivo único en backend) + perfiles de comportamiento seleccionables (archivos añadibles sin tocar código). Los perfiles son solo datos: el sistema lee el contenido completo y lo pasa al prompt. Endpoints CRUD preparados para futura UI de administración.

- `brief-system`: Gestión de briefs de producto — archivos de datos extensibles sin tocar código. El sistema lee el contenido completo y lo pasa al prompt. Endpoints CRUD preparados para futura UI de administración.

- `llm-engine`: Motor conversacional multi-LLM — OpenAI GPT-4 (default), Anthropic Claude, Ollama (local). Configurable por variable de entorno o parámetro de sesión. Sistema de prompts con plantilla desacoplada (`system_prompt_template.txt`) que recibe `{perfil_empleado}`, `{perfil_comportamiento}` y `{brief_producto}` como variables en tiempo de ejecución.

- `questionnaire`: Procesamiento de cuestionarios — el investigador sube una lista de preguntas (archivo o texto), el backend las envía al LLM para respuesta conjunta en una sola llamada, y el resultado se integra en el flujo de chat normal con posibilidad de continuar conversación libre después.

### Modified Capabilities

_(ninguna — proyecto desde cero)_

## Impact

**Código nuevo:**
- `/frontend/` — aplicación React completa con sistema de diseño Moeve
- `/backend/` — API FastAPI con routers, servicios y modelos separados
- `/docker-compose.yml` — orquestación frontend + backend + volúmenes
- `/backend/data/profiles/` — perfiles de empleado y comportamiento (YAML/JSON)
- `/backend/data/briefs/` — briefs de producto (YAML/JSON)
- `/backend/prompts/system_prompt_template.txt` — plantilla de prompt desacoplada

**Dependencias externas:**
- Frontend: React 18, Vite, TailwindCSS, react-markdown, axios
- Backend: FastAPI, Uvicorn, Pydantic, openai, anthropic, WeasyPrint/ReportLab, python-dotenv
- Infraestructura: Docker, docker-compose

**Seguridad:**
- CORS configurado (origins restringidos)
- Rate limiting en endpoints de conversación
- Secrets exclusivamente por variables de entorno (`.env`, nunca en código)
- Sin credenciales hardcodeadas
