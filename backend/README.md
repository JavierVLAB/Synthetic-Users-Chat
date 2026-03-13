# Backend — Sistema de usuarios sintéticos Moeve

API REST construida con FastAPI que gestiona sesiones de investigación UX,
conversa con modelos LLM actuando como usuarios sintéticos, y genera
informes PDF de las sesiones.

## Estructura del proyecto

```
backend/
├── app/
│   ├── config.py          # Configuración central (lee variables de entorno)
│   ├── routers/
│   │   ├── sessions.py    # Sesiones, chat, cuestionarios y PDF
│   │   ├── profiles.py    # Gestión de perfiles de comportamiento
│   │   └── briefs.py      # Gestión de briefs de producto
│   ├── services/
│   │   ├── llm_service.py     # Motor LLM: factory, system prompt, ventana de contexto
│   │   ├── profile_service.py # Lectura de perfiles desde archivos YAML
│   │   ├── brief_service.py   # Lectura de briefs desde archivos YAML
│   │   └── pdf_service.py     # Generación de PDF con WeasyPrint
│   ├── providers/
│   │   ├── base.py            # Interfaz abstracta LLMProvider
│   │   ├── openai_provider.py # Implementación para OpenAI GPT-4
│   │   ├── anthropic_provider.py # Implementación para Anthropic Claude
│   │   └── ollama_provider.py # Implementación para Ollama (local)
│   ├── models/
│   │   ├── session.py         # Schemas Pydantic para sesiones y chat
│   │   ├── questionnaire.py   # Schema para cuestionarios
│   │   ├── profile.py         # Schemas para perfiles
│   │   └── brief.py           # Schemas para briefs
│   └── db/
│       ├── database.py        # Inicialización de SQLite
│       └── queries.py         # Funciones de acceso a datos
├── data/
│   ├── profiles/              # Archivos YAML de perfiles
│   │   ├── empleado.yaml      # Perfil fijo de empleado (siempre presente)
│   │   └── *.yaml             # Perfiles de comportamiento (seleccionables)
│   └── briefs/
│       └── *.yaml             # Briefs de producto (seleccionables)
├── prompts/
│   └── system_prompt_template.txt  # Plantilla del system prompt (editable)
├── templates/
│   └── session_report.html    # Plantilla HTML del informe PDF
├── tests/                     # Tests del flujo principal
├── main.py                    # Punto de entrada FastAPI
└── requirements.txt
```

## Decisiones técnicas relevantes

**¿Por qué archivos YAML para perfiles y briefs?**
Para que investigadores puedan añadir o modificar perfiles sin tocar código.
Añadir un perfil = añadir un archivo `.yaml` en `data/profiles/`.

**¿Por qué SQLite?**
El prototipo está pensado para pocos usuarios simultáneos. SQLite elimina la
necesidad de un servidor de base de datos externo. La migración a PostgreSQL
es directa gracias al uso de `aiosqlite` como capa de abstracción.

**¿Por qué el system prompt está en un archivo .txt?**
Para que pueda editarse sin modificar código Python ni reiniciar el servidor
(se lee en cada request). El prompt está completamente desacoplado de los
perfiles y briefs — ninguno de los tres conoce la estructura interna del otro.

**¿Por qué Strategy Pattern para los LLMs?**
Para poder añadir nuevos proveedores implementando una sola clase, sin tocar
la lógica de conversación. El servicio llm_service.py no sabe qué proveedor
usa — solo conoce la interfaz `LLMProvider.chat()`.

## Añadir un nuevo perfil o brief

1. Crea un archivo `.yaml` en `data/profiles/` o `data/briefs/`
2. El archivo puede tener cualquier estructura — el sistema lee el contenido completo
3. Solo es obligatorio el campo `name`
4. El perfil/brief aparecerá en el dropdown de la UI tras reiniciar el servidor

## Variables de entorno

Ver `.env.example` en la raíz del proyecto para la lista completa documentada.

## Arranque en desarrollo (venv)

El venv vive en la **raíz del monorepo** (no dentro de `/backend`).

```bash
# Desde la raíz del proyecto:
source venv/bin/activate

# Instalar dependencias
pip install -r backend/requirements.txt

# Configurar variables de entorno (si no existe aún)
cp .env.example .env
# Editar .env con tus API keys

# Arrancar desde el directorio backend con hot-reload
cd backend
uvicorn main:app --reload --port 8000
```

> El venv se crea una sola vez. Para sesiones siguientes:
> `source venv/bin/activate` → `cd backend` → `uvicorn main:app --reload`

API disponible en `http://localhost:8000`
Documentación interactiva en `http://localhost:8000/docs`
