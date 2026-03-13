"""
Servicio para gestión de perfiles de comportamiento.

Los perfiles son archivos YAML en data/profiles/. Este servicio
los lee del sistema de archivos y los expone al resto de la aplicación.

Dos tipos de perfiles:
  - empleado.yaml: perfil fijo siempre presente, se carga en startup
  - resto de archivos: perfiles de comportamiento seleccionables en la UI
"""

import logging
import os
from typing import Any, Optional

import yaml

logger = logging.getLogger(__name__)

# Directorio donde residen los archivos de perfiles
PROFILES_DIR = os.path.join(os.path.dirname(__file__), "..", "..", "data", "profiles")

# Nombre reservado para el perfil fijo de empleado
EMPLOYEE_PROFILE_FILENAME = "empleado.yaml"


def _load_yaml_file(filepath: str) -> dict[str, Any]:
    """
    Lee y parsea un archivo YAML.

    Args:
        filepath: Ruta absoluta al archivo YAML.

    Returns:
        Contenido del archivo como diccionario.

    Raises:
        FileNotFoundError: Si el archivo no existe.
        ValueError: Si el archivo no es YAML válido.
    """
    with open(filepath, "r", encoding="utf-8") as f:
        content = yaml.safe_load(f)
    return content or {}


def load_employee_profile() -> str:
    """
    Carga el perfil de empleado fijo desde disco.

    Este perfil siempre está presente en el system prompt, independientemente
    del perfil de comportamiento seleccionado por el investigador.

    Returns:
        Contenido completo del perfil como texto YAML formateado.

    Raises:
        FileNotFoundError: Si empleado.yaml no existe — el servidor no debe arrancar sin él.
    """
    filepath = os.path.join(PROFILES_DIR, EMPLOYEE_PROFILE_FILENAME)

    if not os.path.exists(filepath):
        raise FileNotFoundError(
            f"Employee profile not found at data/profiles/{EMPLOYEE_PROFILE_FILENAME}. "
            "This file is required for the system to work."
        )

    with open(filepath, "r", encoding="utf-8") as f:
        content = f.read()

    logger.info("Perfil de empleado cargado correctamente.")
    return content


def list_behavior_profiles() -> list[dict[str, Any]]:
    """
    Lista todos los perfiles de comportamiento disponibles.

    Excluye empleado.yaml — ese perfil es fijo y no se muestra en la UI.
    Los archivos que no son .yaml o .json válidos se ignoran con un warning.

    Returns:
        Lista de diccionarios con 'id', 'name' y opcionalmente 'descripcion'.
    """
    profiles = []

    if not os.path.exists(PROFILES_DIR):
        logger.warning(f"Directorio de perfiles no encontrado: {PROFILES_DIR}")
        return []

    for filename in sorted(os.listdir(PROFILES_DIR)):
        # Ignorar el perfil fijo de empleado, plantillas (_) y archivos no YAML/JSON
        if filename == EMPLOYEE_PROFILE_FILENAME:
            continue
        if filename.startswith("_"):
            continue
        if not (filename.endswith(".yaml") or filename.endswith(".json")):
            continue

        profile_id = os.path.splitext(filename)[0]
        filepath = os.path.join(PROFILES_DIR, filename)

        try:
            content = _load_yaml_file(filepath)
            profiles.append({
                "id": profile_id,
                "name": content.get("name", profile_id),
                "descripcion": content.get("descripcion"),
            })
        except Exception as e:
            logger.warning(f"No se pudo cargar el perfil '{filename}': {e}")

    return profiles


def get_behavior_profile(profile_id: str) -> Optional[dict[str, Any]]:
    """
    Obtiene el contenido completo de un perfil de comportamiento.

    Args:
        profile_id: Nombre del archivo sin extensión (e.g. 'explorador').

    Returns:
        Diccionario con 'id' y 'content' (contenido completo del YAML),
        o None si el perfil no existe.
    """
    # Intentamos primero .yaml, luego .json
    for extension in (".yaml", ".json"):
        filepath = os.path.join(PROFILES_DIR, f"{profile_id}{extension}")
        if os.path.exists(filepath):
            content = _load_yaml_file(filepath)
            return {"id": profile_id, "content": content}

    return None


def get_behavior_profile_as_text(profile_id: str) -> Optional[str]:
    """
    Obtiene el contenido completo de un perfil como texto plano.

    Se usa para pasar el perfil al system prompt del LLM.

    Args:
        profile_id: Nombre del archivo sin extensión.

    Returns:
        Contenido del archivo como string, o None si no existe.
    """
    for extension in (".yaml", ".json"):
        filepath = os.path.join(PROFILES_DIR, f"{profile_id}{extension}")
        if os.path.exists(filepath):
            with open(filepath, "r", encoding="utf-8") as f:
                return f.read()

    return None


def save_behavior_profile(profile_id: str, content: dict[str, Any]) -> None:
    """
    Guarda o actualiza un perfil de comportamiento en disco.

    Solo para uso en endpoints de administración.

    Args:
        profile_id: Identificador del perfil (nombre del archivo sin extensión).
        content: Contenido del perfil como diccionario.

    Raises:
        ValueError: Si se intenta modificar el perfil de empleado.
    """
    if profile_id == "empleado":
        raise ValueError("El perfil de empleado no puede modificarse mediante la API.")

    filepath = os.path.join(PROFILES_DIR, f"{profile_id}.yaml")
    with open(filepath, "w", encoding="utf-8") as f:
        yaml.dump(content, f, allow_unicode=True, default_flow_style=False)

    logger.info(f"Perfil guardado: {profile_id}")


def delete_behavior_profile(profile_id: str) -> bool:
    """
    Elimina un perfil de comportamiento del sistema de archivos.

    Args:
        profile_id: Identificador del perfil a eliminar.

    Returns:
        True si se eliminó, False si no existía.

    Raises:
        ValueError: Si se intenta eliminar el perfil de empleado.
    """
    if profile_id == "empleado":
        raise ValueError("El perfil de empleado no puede eliminarse mediante la API.")

    for extension in (".yaml", ".json"):
        filepath = os.path.join(PROFILES_DIR, f"{profile_id}{extension}")
        if os.path.exists(filepath):
            os.remove(filepath)
            logger.info(f"Perfil eliminado: {profile_id}")
            return True

    return False
