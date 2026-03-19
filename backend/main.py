"""
Punto de entrada de la aplicación FastAPI.

Configura CORS, rate limiting, registra los routers y gestiona
los eventos de startup/shutdown (inicialización de la base de datos
y carga de perfiles y briefs).

Ejecutar en desarrollo:
    uvicorn main:app --reload --port 8000

Documentación automática disponible en:
    http://localhost:8000/docs  (Swagger UI)
    http://localhost:8000/redoc (ReDoc)
"""

import logging

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded
from slowapi.util import get_remote_address

from app.config import settings
from app.db.database import init_database
from app.routers import auth, briefs, profiles, sessions

# ── Logging ───────────────────────────────────────────────────────────────────

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s — %(name)s — %(levelname)s — %(message)s",
)
logger = logging.getLogger(__name__)

# ── Rate limiter ──────────────────────────────────────────────────────────────

# El limiter se instancia aquí y se pasa a los routers que lo necesiten.
# Usamos la IP remota como clave de identificación.
limiter = Limiter(key_func=get_remote_address)

# ── Aplicación FastAPI ────────────────────────────────────────────────────────

app = FastAPI(
    title="Sistema de usuarios sintéticos — Moeve",
    description=(
        "API para generar usuarios sintéticos basados en perfiles psicológicos "
        "y profesionales, e interactuar con ellos mediante conversación."
    ),
    version="1.0.0",
)

# Rate limiting: devuelve 429 cuando se supera el límite
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# ── CORS ──────────────────────────────────────────────────────────────────────

# Solo los orígenes definidos en ALLOWED_ORIGINS pueden hacer requests.
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.get_allowed_origins(),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Eventos de ciclo de vida ──────────────────────────────────────────────────


@app.on_event("startup")
async def on_startup() -> None:
    """
    Se ejecuta una vez cuando arranca el servidor.

    Inicializa la base de datos (crea tablas si no existen) y
    verifica que los archivos críticos del sistema están presentes.
    """
    logger.info("Iniciando sistema de usuarios sintéticos Moeve...")
    await init_database()
    logger.info("Sistema listo.")


# ── Routers ───────────────────────────────────────────────────────────────────

app.include_router(auth.router)
app.include_router(sessions.router)
app.include_router(profiles.router)
app.include_router(briefs.router)

# ── Health check ──────────────────────────────────────────────────────────────


@app.get("/health", tags=["Sistema"])
async def health_check() -> dict:
    """
    Verifica que el servidor está operativo.

    Usado por Docker Compose para determinar si el contenedor
    está listo para recibir tráfico.
    """
    return {"status": "ok", "version": "1.0.0"}
