## Context

El frontend usa Next.js + TailwindCSS. Ya existe `CloseSessionModal.tsx` como referencia de modal en el proyecto. No se usa MUI Dialog — los modales son HTML puro con Tailwind. El icono `HelpOutlineIcon` ya está importado en `ProfileSelect` y `BriefSelect` tras el change anterior.

## Goals / Non-Goals

**Goals:**
- Modal reutilizable con título + cuerpo de texto
- Cierre por botón, clic en backdrop y tecla Escape
- Accesible: foco atrapado en el modal, `role="dialog"`, `aria-modal="true"`

**Non-Goals:**
- Contenido dinámico desde API — el texto es estático por campo
- Tooltip (el modal permite textos largos y es más accesible en móvil)
- Animaciones elaboradas

## Decisions

### Componente propio vs MUI Dialog

**Decisión**: componente propio `HelpModal.tsx` con Tailwind, mismo patrón que `CloseSessionModal.tsx`.

**Rationale**: consistencia con el resto del proyecto, sin añadir complejidad de MUI Dialog/Portal. El modal existente ya demuestra que el patrón funciona.

### Contenido del modal: props vs config externa

**Decisión**: props `title` y `content` en `HelpModal`. Cada componente (`ProfileSelect`, `BriefSelect`) define sus propios textos inline como constantes.

**Rationale**: simple, tipado, sin sobre-ingeniería. Si en el futuro se quieren cargar desde CMS o i18n, se refactoriza la fuente de las constantes, no el componente.

### Apertura: estado local en cada Select

**Decisión**: cada `ProfileSelect` y `BriefSelect` gestiona su propio `useState<boolean>` para abrir/cerrar el modal.

**Rationale**: los dos campos son independientes, no necesitan estado compartido.

## Risks / Trade-offs

- **Contenido pendiente**: los textos explicativos serán proporcionados por el equipo. La implementación usa placeholders hasta recibirlos.
- **Scroll del body**: al abrir el modal se puede añadir `overflow-hidden` al body para evitar scroll doble. Mitigación: aplicar la misma técnica que `CloseSessionModal`.

## Migration Plan

1. Crear `HelpModal.tsx`
2. Actualizar `ProfileSelect.tsx` y `BriefSelect.tsx`
3. Reemplazar placeholders con textos reales cuando los proporcione el equipo

## Open Questions

- ¿Cuál es el texto explicativo de "Perfil de comportamiento"? → **Pendiente de usuario**
- ¿Cuál es el texto explicativo de "Brief de producto"? → **Pendiente de usuario**
