## Context

El frontend usa Next.js 14 con TailwindCSS. Los botones actuales son componentes propios (`Button.tsx`, `QuestionnaireUpload.tsx`) con texto plano o emojis (`📋`). No hay librería de iconos instalada. Los componentes afectados son:

- `QuestionnaireUpload.tsx` — botón "📋 Cuestionario"
- `InputBar.tsx` — botón "Enviar"
- `SessionAccordion.tsx` — botones "Iniciar chat" y "Cerrar sesión"
- `AssistantMessage.tsx` — hora + `AnswerActions` (botón "Copiar")
- `MessageBubble.tsx` — hora del mensaje de usuario
- `ProfileSelect.tsx` — label "Perfil de comportamiento"
- `BriefSelect.tsx` — label "Brief de producto"

## Goals / Non-Goals

**Goals:**
- Instalar una única librería de iconos Material Design
- Sustituir texto/emojis por iconos en los 8 puntos identificados
- Los iconos deben ser accesibles (`aria-label` / `title` donde corresponda)
- Mantener el comportamiento y los estilos de color/tamaño existentes

**Non-Goals:**
- Rediseñar la UI más allá de los puntos listados
- Añadir iconos a otras partes de la interfaz no mencionadas
- Cambiar el sistema de diseño (Tailwind, tokens de color)

## Decisions

### Librería: `@mui/icons-material` vs `material-symbols` vs SVG inline

**Decisión**: usar `@mui/icons-material` con `@mui/material` como peer.

**Rationale**:
- Tree-shakeable: solo se importa el icono usado, el bundle final no crece significativamente
- Tipado completo en TypeScript, props estándar (`sx`, `fontSize`, `className`)
- Es la fuente oficial de Material Icons con mantenimiento activo
- Alternativa `material-symbols` requiere configuración de fuente web o paquete propio; más complejo sin ventaja real para este caso

**Alternativas consideradas**:
- `react-icons/md` — ligera pero con tipos menos precisos y menor cobertura de variantes
- SVG inline — sin dependencia pero sin consistencia de tamaño/color automática

### Icono de información en labels (`HelpOutline` vs `InfoOutlined`)

**Decisión**: `HelpOutline` — comunica mejor "más información sobre este campo" que `InfoOutlined`.

### Botón Copiar: solo icono vs icono + texto

**Decisión**: solo icono (`ContentCopy`) con `title="Copiar respuesta"`. El icono es universalmente reconocido y ahorra espacio en la burbuja. El estado "copiado" mostrará `Check` brevemente.

### Hora en burbujas: solo icono + hora vs solo hora

**Decisión**: icono `AccessTime` pequeño (`fontSize="inherit"`) seguido de la hora formateada. Mantiene legibilidad y añade contexto visual.

## Risks / Trade-offs

- **Tamaño del bundle**: `@mui/material` es un peer dependency grande. Mitigación: importar solo desde `@mui/icons-material` (no importar componentes de MUI), que es independiente en bundle.
- **Peer dependency `@emotion`**: `@mui/icons-material` no requiere emotion por sí solo si se importa solo el SVG. No se añade `@mui/material` como dependencia explícita.

## Migration Plan

1. `npm install @mui/icons-material @mui/material @emotion/react @emotion/styled` en `frontend/`
2. Editar componentes uno a uno (sin romper props existentes)
3. Verificar visualmente en local con `npm run dev`
4. Build de producción para comprobar bundle

## Open Questions

- ¿Se quiere que el icono de información en los labels abra un tooltip con texto explicativo, o es solo decorativo? → Tratar como decorativo (`aria-hidden`) por ahora.
