## Why

Tres problemas detectados en la versión actual: (1) al cargar una sesión del historial en modo lectura no hay forma de volver a la pantalla de configuración para iniciar una nueva sesión; (2) los investigadores no pueden ver ni editar el contenido de perfiles, briefs y departamentos desde la UI, lo que dificulta ajustar los prompts; (3) el usuario sintético genera respuestas demasiado complacientes e inventa métricas y datos que no existen, reduciendo la credibilidad de la investigación.

## What Changes

- **Bug fix**: Añadir botón "Nueva sesión" en el estado `isViewMode` del `SessionAccordion` para que el investigador pueda salir de una sesión del historial y configurar una nueva.
- **Editor de contenido**: Icono ⓘ junto a cada selector (perfil, brief, departamento) que abre un modal con el contenido YAML formateado. Si `NEXT_PUBLIC_ADMIN_TOKEN` está configurado, permite editar y guardar el contenido vía API.
- **Campo `datos_de_uso` en briefs**: Nuevo campo opcional en el schema de briefs donde el investigador puede incluir métricas reales de uso (tasas de adopción, frecuencia, NPS, etc.) que se inyectan en el prompt.
- **System prompt anti-complacencia**: Instrucciones explícitas para que la IA no invente números, exprese opiniones críticas cuando el perfil lo sugiera, y diga "no sé" o "no tengo datos" en lugar de alucicar.

## Capabilities

### New Capabilities
- `content-editor`: Vista y edición inline del contenido de perfiles, briefs y departamentos desde la UI sin salir del flujo principal.

### Modified Capabilities
- `brief-system`: Añadir campo opcional `datos_de_uso` al schema de briefs para incluir métricas reales que influyen en el comportamiento del usuario sintético.
- `chat-interface`: Añadir botón "Nueva sesión" en el estado de solo lectura del `SessionAccordion`.
- `llm-engine`: Actualizar el system prompt template con instrucciones anti-alucinación y anti-complacencia; incorporar `datos_de_uso` del brief al contexto del LLM.

## Impact

- Frontend: `SessionAccordion.tsx`, `ProfileSelect.tsx`, `BriefSelect.tsx`, `DepartmentSelect.tsx`, nuevos componentes `ContentViewerModal.tsx`
- Backend: `system_prompt_template.txt`, schema de briefs (campo `datos_de_uso`), endpoints existentes `PUT /profiles/{id}`, `PUT /briefs/{id}`, `PUT /departments/{id}` (ya implementados)
- API: Sin cambios en los endpoints — se reutilizan los CRUD existentes con admin token
- Sin breaking changes
