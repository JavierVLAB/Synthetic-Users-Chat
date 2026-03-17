"""
Inicialización y configuración de la base de datos SQLite.

Usa aiosqlite para operaciones asíncronas. Las tablas se crean
automáticamente en el startup de la aplicación si no existen.

Esquema:
  sessions  — metadatos de cada sesión de investigación
  messages  — mensajes individuales de cada conversación
"""

import logging
import os

import aiosqlite

logger = logging.getLogger(__name__)

# Ruta al archivo SQLite. Se crea el directorio si no existe.
DB_PATH = os.path.join(os.path.dirname(__file__), "..", "..", "data", "db", "moeve.db")


CREATE_SESSIONS_TABLE = """
CREATE TABLE IF NOT EXISTS sessions (
    session_id   TEXT PRIMARY KEY,
    profile_id   TEXT NOT NULL,
    brief_id     TEXT NOT NULL,
    llm_provider TEXT NOT NULL,
    created_at   TEXT NOT NULL,
    closed_at    TEXT
);
"""

CREATE_MESSAGES_TABLE = """
CREATE TABLE IF NOT EXISTS messages (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    session_id  TEXT    NOT NULL,
    role        TEXT    NOT NULL CHECK(role IN ('user', 'assistant')),
    content     TEXT    NOT NULL,
    timestamp   TEXT    NOT NULL,
    FOREIGN KEY (session_id) REFERENCES sessions(session_id)
);
"""


async def init_database() -> None:
    """
    Crea las tablas de la base de datos si no existen.

    Se llama una vez en el evento startup de FastAPI. Es seguro ejecutarlo
    múltiples veces gracias a 'CREATE TABLE IF NOT EXISTS'.
    """
    os.makedirs(os.path.dirname(DB_PATH), exist_ok=True)
    logger.info(f"Inicializando base de datos en: {DB_PATH}")

    async with aiosqlite.connect(DB_PATH) as db:
        await db.execute(CREATE_SESSIONS_TABLE)
        await db.execute(CREATE_MESSAGES_TABLE)
        # Migración: añadir department_id si no existe (seguro ejecutar varias veces)
        try:
            await db.execute("ALTER TABLE sessions ADD COLUMN department_id TEXT;")
            logger.info("Migración aplicada: columna department_id añadida a sessions.")
        except Exception:
            pass  # La columna ya existe — ignorar
        await db.commit()

    logger.info("Base de datos inicializada correctamente.")


def get_db_path() -> str:
    """Devuelve la ruta absoluta al archivo de base de datos."""
    return os.path.abspath(DB_PATH)
