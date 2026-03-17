## Context

El proyecto usa Next.js 16 + FastAPI con estado global gestionado via React Context + useReducer. Los selectores de perfil, brief y departamento son componentes independientes que solo exponen `value` + `onChange`. El contenido de cada ítem (perfiles, briefs, departamentos) vive en archivos YAML servidos por endpoints `GET /profiles/{id}`, `GET /briefs/{id}`, `GET /departments/{id}` que ya existen. Los endpoints de escritura (`PUT`) también existen y requieren `X-Admin-Token`.

El `SessionAccordion` tiene dos estados: (a) sin sesión → panel de configuración colapsable, (b) con sesión → barra de estado. El bug existe porque `isViewMode=true` muestra la barra de estado sin ningún control para salir.

El system prompt se construye en `llm_service.build_system_prompt()` con `format_map()` sobre una plantilla de texto plano. Los briefs son dicts YAML con schema libre que se serializan como texto al prompt.

## Goals / Non-Goals

**Goals:**
- Permitir salir del modo lectura (historial) para configurar y lanzar una nueva sesión
- Ver el contenido completo de cualquier ítem seleccionado en un modal, sin salir del flujo
- Editar ese contenido si `NEXT_PUBLIC_ADMIN_TOKEN` está disponible
- Reducir alucinaciones y complacencia en el usuario sintético via instrucciones en el prompt + datos reales del brief

**Non-Goals:**
- Editor de la plantilla base del system prompt desde la UI
- Gestión completa de ficheros YAML (crear desde cero, renombrar, eliminar) — ya existe
- Versionado de contenido o historial de cambios de perfiles/briefs
- Internacionalización del editor

## Decisions

### D1: Botón "Nueva sesión" en isViewMode
Añadir un único botón "Nueva sesión" en la barra de estado de `SessionAccordion` cuando `isViewMode=true`. Al hacer clic llama a `closeSession()` (ya disponible en contexto), que despacha `SESSION_CLOSED` y resetea todo el estado. No se necesita un nuevo action ni lógica adicional.

**Alternativa descartada:** Crear un action `RESET_TO_CONFIG` separado. Innecesario — `closeSession()` ya hace exactamente lo que necesitamos.

### D2: Icono ⓘ junto a cada selector → ContentViewerModal
Un único componente `ContentViewerModal` genérico que acepta `title`, `content` (objeto), `onClose`, `itemId`, `itemType` (`"profile"|"brief"|"department"`), y `editable` (bool). En modo lectura muestra el contenido como YAML formateado con resaltado de campos. En modo edición usa un `<textarea>` con el YAML raw y un botón "Guardar" que llama al endpoint correspondiente.

**Alternativa descartada:** Tres modales separados (ProfileViewerModal, BriefViewerModal, DepartmentViewerModal). Duplicación innecesaria — el comportamiento es idéntico.

### D3: Obtención del contenido desde el frontend
El icono ⓘ solo se habilita cuando hay un ítem seleccionado (value !== ""). Al hacer clic, el componente padre llama a `GET /profiles/{id}` / `GET /briefs/{id}` / `GET /departments/{id}` y pasa el resultado a `ContentViewerModal`. No se pre-carga — fetch on demand para no impactar el tiempo de carga inicial.

### D4: Campo `datos_de_uso` en briefs
Campo opcional de texto libre en el schema de briefs. No se valida su estructura — el investigador puede escribir lo que quiera (CSV, bullet points, prosa). En `build_system_prompt()` se detecta si el brief contiene `datos_de_uso` y si es así se añade una sección especial al prompt indicando que son datos reales que la IA debe usar como referencia.

**Alternativa descartada:** Campo estructurado (nombre_metrica, valor, fuente). Demasiado fricción para el investigador; el LLM puede interpretar texto libre perfectamente.

### D5: Instrucciones anti-complacencia en el system prompt
Añadir una sección "IMPORTANTE — SOBRE LOS DATOS Y TU CRITERIO" al final del template con reglas explícitas: no inventar números, expresar escepticismo cuando el perfil lo indique, usar `datos_de_uso` del brief cuando existan, decir "no tengo datos" en lugar de especular.

## Risks / Trade-offs

- [Editor de YAML via textarea] → Si el usuario guarda YAML inválido el servidor lo rechazará silenciosamente (el endpoint actual no valida estructura, solo que `name` existe). Mitigación: mostrar el error de la API en el modal.
- [Fetch on demand del contenido] → Un clic lento si el servidor está tardando. Mitigación: mostrar spinner en el modal mientras carga.
- [Instrucciones anti-complacencia] → Pueden hacer el usuario sintético demasiado evasivo si están mal calibradas. Mitigación: instrucciones condicionales ("cuando no tengas datos reales disponibles, di que no lo sabes") en lugar de absolutas.

## Migration Plan

Sin migraciones de base de datos. El campo `datos_de_uso` en briefs es opcional — los briefs existentes sin ese campo funcionan sin cambios. El system prompt se lee del disco en cada request, por lo que el cambio de plantilla es inmediato al reiniciar el backend.
