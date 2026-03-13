# Sistema de usuarios sintéticos — Moeve

![Version](https://img.shields.io/badge/version-2.0-004656?style=flat-square)
![Next.js](https://img.shields.io/badge/Next.js-16-black?style=flat-square&logo=next.js)
![Python](https://img.shields.io/badge/Python-3.11-3776AB?style=flat-square&logo=python&logoColor=white)
![FastAPI](https://img.shields.io/badge/FastAPI-0.115-009688?style=flat-square&logo=fastapi&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-4-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-Compose-2496ED?style=flat-square&logo=docker&logoColor=white)
![SQLite](https://img.shields.io/badge/SQLite-aiosqlite-003B57?style=flat-square&logo=sqlite&logoColor=white)

Herramienta web para investigación de UX que permite generar usuarios sintéticos basados en perfiles psicológicos y profesionales, e interactuar con ellos mediante conversación. El usuario sintético es una IA que actúa según un perfil predefinido, permitiendo evaluar cómo percibe un producto digital determinado.

## Cómo funciona

1. El investigador selecciona un **perfil de comportamiento** y un **brief de producto**
2. Inicia la sesión y conversa con el usuario sintético en modo chat libre
3. Opcionalmente sube un **cuestionario** (lista de preguntas) para obtener respuestas conjuntas
4. Al finalizar, cierra la sesión y descarga un **PDF** con el informe completo

## Stack tecnológico

| Capa | Tecnología |
|---|---|
| Frontend | Next.js 16 (App Router) + TailwindCSS + TypeScript |
| Backend | Python 3.11 + FastAPI + Uvicorn |
| Base de datos | SQLite (via aiosqlite) |
| Motor LLM | OpenAI GPT-4 / Anthropic Claude / Ollama (configurable) |
| Generación PDF | WeasyPrint |
| Infraestructura | Docker + Docker Compose |

## Requisitos

- [Docker](https://www.docker.com/) y Docker Compose
- O bien, para desarrollo local sin Docker:
  - Node.js 20+
  - Python 3.11+
  - **venv** — el backend usa un entorno virtual Python. Siempre actívalo antes de trabajar con el backend.

## Arranque con Docker (recomendado)

```bash
# 1. Clona el repositorio
git clone <repo-url>
cd 202603-Moeve-Synthetic-Users-Chat

# 2. Configura las variables de entorno
cp .env.example .env
# Edita .env y añade tu API key (OPENAI_API_KEY, ANTHROPIC_API_KEY, etc.)

# 3. Levanta los servicios
docker-compose up --build

# 4. Abre la aplicación
# Frontend: http://localhost:3010
# Backend API: http://localhost:8010
# Documentación API: http://localhost:8000/docs
```

## Arranque en desarrollo local

> **⚠️ Importante — usa siempre el venv**
>
> El backend usa un entorno virtual Python ubicado en `venv/` en la raíz del proyecto.
> **Actívalo antes de cualquier comando Python** para asegurarte de usar las dependencias correctas y no contaminar el entorno global de tu sistema.
>
> ```bash
> # Activar el venv (hacerlo una vez por sesión de terminal)
> source venv/bin/activate     # macOS / Linux
> .\venv\Scripts\activate      # Windows
>
> # Para salir del venv cuando termines
> deactivate
> ```

### Backend

```bash
# 1. Activa el venv (desde la raíz del proyecto)
source venv/bin/activate

# 2. Instala dependencias (solo la primera vez o cuando cambien)
pip install -r backend/requirements.txt

# 3. Configura variables de entorno
cp .env.example .env
# Edita .env con tus valores (mínimo: OPENAI_API_KEY o ANTHROPIC_API_KEY)

# 4. Arranca el servidor con hot-reload
cd backend
uvicorn main:app --reload --port 8000
```

### Frontend

```bash
cd frontend

# Instala dependencias
npm install

# Configura la URL del backend
echo "NEXT_PUBLIC_API_URL=http://localhost:8000" > .env.local

# Arranca el servidor de desarrollo
npm run dev
# Disponible en http://localhost:3000
```

## Estructura del proyecto

```
/
├── backend/               # API FastAPI
│   ├── app/
│   │   ├── routers/       # Endpoints HTTP
│   │   ├── services/      # Lógica de negocio
│   │   ├── models/        # Schemas Pydantic
│   │   ├── providers/     # Proveedores LLM (OpenAI, Anthropic, Ollama)
│   │   └── db/            # Acceso a SQLite
│   ├── data/
│   │   ├── profiles/      # Perfiles de comportamiento (archivos YAML)
│   │   └── briefs/        # Briefs de producto (archivos YAML)
│   └── prompts/           # Plantilla del system prompt
│
├── frontend/              # Aplicación Next.js
│   ├── app/               # App Router (layout + page)
│   ├── components/        # Componentes React
│   ├── hooks/             # Custom hooks
│   ├── services/          # Cliente HTTP (axios)
│   └── context/           # Estado global (React Context)
│
├── docker-compose.yml
├── .env.example           # Plantilla de variables de entorno
└── README.md
```

## Tests

Los tests del backend se ejecutan con pytest usando el venv del proyecto:

```bash
# Desde la raíz del proyecto (con el venv activado)
source venv/bin/activate

# Instala pytest si no está ya instalado
pip install pytest pytest-asyncio

# Ejecuta los tests
venv/bin/python -m pytest backend/tests/ -v
```

Los tests usan una base de datos SQLite temporal por test — no modifican datos reales.
El LLM está mockeado, por lo que no se realizan llamadas a APIs externas.

## Añadir perfiles y briefs

Para añadir un nuevo perfil de comportamiento, crea un archivo YAML en `backend/data/profiles/`:

```yaml
# backend/data/profiles/mi-perfil.yaml
name: Nombre del perfil
descripcion: Descripción general del perfil

patron_comportamiento: |
  Descripción detallada del patrón de comportamiento...

caracteristicas_profesionales: |
  Características del puesto de trabajo...

relacion_tecnologia: |
  Cómo se relaciona este perfil con la tecnología...
```

El perfil aparecerá automáticamente en el dropdown de la aplicación sin reiniciar ni cambiar código.

Lo mismo aplica para los briefs en `backend/data/briefs/`.

## Variables de entorno

Ver `.env.example` para la lista completa documentada.

## Documentación adicional

- [Backend — arquitectura y decisiones](backend/README.md)
- [Frontend — estructura y componentes](frontend/README.md)
- [Specs del sistema](openspec/changes/sistema-usuarios-sinteticos-moeve/)
