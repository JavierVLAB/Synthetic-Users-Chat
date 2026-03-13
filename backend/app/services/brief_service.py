"""
Servicio para gestión de briefs de producto.

Los briefs son archivos YAML en data/briefs/ con estructura libre.
Este servicio los lee del sistema de archivos y los expone al resto
de la aplicación. Añadir un brief nuevo = añadir un archivo YAML.
"""

import logging
import os
from typing import Any, Optional

import yaml

logger = logging.getLogger(__name__)

# Directorio donde residen los archivos de briefs
BRIEFS_DIR = os.path.join(os.path.dirname(__file__), "..", "..", "data", "briefs")


def _load_yaml_file(filepath: str) -> dict[str, Any]:
    """
    Lee y parsea un archivo YAML.

    Args:
        filepath: Ruta absoluta al archivo.

    Returns:
        Contenido del archivo como diccionario.
    """
    with open(filepath, "r", encoding="utf-8") as f:
        content = yaml.safe_load(f)
    return content or {}


def list_briefs() -> list[dict[str, Any]]:
    """
    Lista todos los briefs disponibles en el directorio de briefs.

    Los archivos no válidos se ignoran con un warning en lugar de
    romper la aplicación, para que un archivo mal formado no bloquee
    el acceso a los demás briefs.

    Returns:
        Lista de diccionarios con 'id', 'name' y opcionalmente 'descripcion'.
    """
    briefs = []

    if not os.path.exists(BRIEFS_DIR):
        logger.warning(f"Directorio de briefs no encontrado: {BRIEFS_DIR}")
        return []

    for filename in sorted(os.listdir(BRIEFS_DIR)):
        if not (filename.endswith(".yaml") or filename.endswith(".json")):
            continue
        if filename.startswith("_"):
            continue

        brief_id = os.path.splitext(filename)[0]
        filepath = os.path.join(BRIEFS_DIR, filename)

        try:
            content = _load_yaml_file(filepath)
            briefs.append({
                "id": brief_id,
                "name": content.get("name", brief_id),
                "descripcion": content.get("descripcion"),
            })
        except Exception as e:
            logger.warning(f"No se pudo cargar el brief '{filename}': {e}")

    return briefs


def get_brief(brief_id: str) -> Optional[dict[str, Any]]:
    """
    Obtiene el contenido completo de un brief.

    Args:
        brief_id: Nombre del archivo sin extensión (e.g. 'chatbot-ingenieria').

    Returns:
        Diccionario con 'id' y 'content', o None si no existe.
    """
    for extension in (".yaml", ".json"):
        filepath = os.path.join(BRIEFS_DIR, f"{brief_id}{extension}")
        if os.path.exists(filepath):
            content = _load_yaml_file(filepath)
            return {"id": brief_id, "content": content}

    return None


def get_brief_as_text(brief_id: str) -> Optional[str]:
    """
    Obtiene el contenido completo de un brief como texto plano.

    Se usa para pasar el brief al system prompt del LLM.

    Args:
        brief_id: Nombre del archivo sin extensión.

    Returns:
        Contenido del archivo como string, o None si no existe.
    """
    for extension in (".yaml", ".json"):
        filepath = os.path.join(BRIEFS_DIR, f"{brief_id}{extension}")
        if os.path.exists(filepath):
            with open(filepath, "r", encoding="utf-8") as f:
                return f.read()

    return None


def save_brief(brief_id: str, content: dict[str, Any]) -> None:
    """
    Guarda o actualiza un brief en disco.

    Solo para uso en endpoints de administración.

    Args:
        brief_id: Identificador del brief (nombre del archivo sin extensión).
        content: Contenido del brief como diccionario.
    """
    filepath = os.path.join(BRIEFS_DIR, f"{brief_id}.yaml")
    with open(filepath, "w", encoding="utf-8") as f:
        yaml.dump(content, f, allow_unicode=True, default_flow_style=False)

    logger.info(f"Brief guardado: {brief_id}")


def delete_brief(brief_id: str) -> bool:
    """
    Elimina un brief del sistema de archivos.

    Args:
        brief_id: Identificador del brief a eliminar.

    Returns:
        True si se eliminó, False si no existía.
    """
    for extension in (".yaml", ".json"):
        filepath = os.path.join(BRIEFS_DIR, f"{brief_id}{extension}")
        if os.path.exists(filepath):
            os.remove(filepath)
            logger.info(f"Brief eliminado: {brief_id}")
            return True

    return False
