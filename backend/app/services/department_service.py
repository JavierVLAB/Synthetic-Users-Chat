"""
Servicio para gestión de departamentos de Moeve.

Los departamentos son archivos YAML en data/departments/ con estructura libre.
Este servicio los lee del sistema de archivos y los expone al resto
de la aplicación. Añadir un departamento nuevo = añadir un archivo YAML.
"""

import logging
import os
from typing import Any, Optional

import yaml

logger = logging.getLogger(__name__)

# Directorio donde residen los archivos de departamentos
DEPARTMENTS_DIR = os.path.join(os.path.dirname(__file__), "..", "..", "data", "departments")


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


def list_departments() -> list[dict[str, Any]]:
    """
    Lista todos los departamentos disponibles en el directorio de departamentos.

    Los archivos no válidos se ignoran con un warning en lugar de
    romper la aplicación, para que un archivo mal formado no bloquee
    el acceso a los demás departamentos.

    Returns:
        Lista de diccionarios con 'id', 'name' y opcionalmente 'descripcion'.
    """
    departments = []

    if not os.path.exists(DEPARTMENTS_DIR):
        logger.warning(f"Directorio de departamentos no encontrado: {DEPARTMENTS_DIR}")
        return []

    for filename in sorted(os.listdir(DEPARTMENTS_DIR)):
        if not (filename.endswith(".yaml") or filename.endswith(".json")):
            continue
        if filename.startswith("_"):
            continue

        dept_id = os.path.splitext(filename)[0]
        filepath = os.path.join(DEPARTMENTS_DIR, filename)

        try:
            content = _load_yaml_file(filepath)
            departments.append({
                "id": dept_id,
                "name": content.get("name", dept_id),
                "descripcion": content.get("descripcion"),
            })
        except Exception as e:
            logger.warning(f"No se pudo cargar el departamento '{filename}': {e}")

    return departments


def get_department(dept_id: str) -> Optional[dict[str, Any]]:
    """
    Obtiene el contenido completo de un departamento.

    Args:
        dept_id: Nombre del archivo sin extensión (e.g. 'operaciones').

    Returns:
        Diccionario con 'id' y 'content', o None si no existe.
    """
    for extension in (".yaml", ".json"):
        filepath = os.path.join(DEPARTMENTS_DIR, f"{dept_id}{extension}")
        if os.path.exists(filepath):
            content = _load_yaml_file(filepath)
            return {"id": dept_id, "content": content}

    return None


def get_department_as_text(dept_id: str) -> Optional[str]:
    """
    Obtiene el contenido completo de un departamento como texto plano.

    Se usa para pasar el departamento al system prompt del LLM.

    Args:
        dept_id: Nombre del archivo sin extensión.

    Returns:
        Contenido del archivo como string, o None si no existe.
    """
    for extension in (".yaml", ".json"):
        filepath = os.path.join(DEPARTMENTS_DIR, f"{dept_id}{extension}")
        if os.path.exists(filepath):
            with open(filepath, "r", encoding="utf-8") as f:
                return f.read()

    return None


def save_department(dept_id: str, content: dict[str, Any]) -> None:
    """
    Guarda o actualiza un departamento en disco.

    Solo para uso en endpoints de administración.

    Args:
        dept_id: Identificador del departamento (nombre del archivo sin extensión).
        content: Contenido del departamento como diccionario.
    """
    os.makedirs(DEPARTMENTS_DIR, exist_ok=True)
    filepath = os.path.join(DEPARTMENTS_DIR, f"{dept_id}.yaml")
    with open(filepath, "w", encoding="utf-8") as f:
        yaml.dump(content, f, allow_unicode=True, default_flow_style=False)

    logger.info(f"Departamento guardado: {dept_id}")


def delete_department(dept_id: str) -> bool:
    """
    Elimina un departamento del sistema de archivos.

    Args:
        dept_id: Identificador del departamento a eliminar.

    Returns:
        True si se eliminó, False si no existía.
    """
    for extension in (".yaml", ".json"):
        filepath = os.path.join(DEPARTMENTS_DIR, f"{dept_id}{extension}")
        if os.path.exists(filepath):
            os.remove(filepath)
            logger.info(f"Departamento eliminado: {dept_id}")
            return True

    return False
