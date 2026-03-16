## Capability: help-modal

Modal de ayuda reutilizable que muestra información explicativa al hacer clic en el icono `HelpOutline`.

---

## ADDED Requirements

### Requirement: help-modal-component

Crear `components/HelpModal.tsx` — componente modal con las props:
- `title: string` — título del modal
- `content: string` — texto explicativo (puede incluir saltos de línea)
- `onClose: () => void` — callback de cierre

**Comportamiento:**
- Se renderiza sobre un backdrop semitransparente (`bg-black/40`)
- Se cierra al hacer clic en el backdrop
- Se cierra al pulsar la tecla Escape
- Tiene un botón "Cerrar" explícito
- Atributos de accesibilidad: `role="dialog"`, `aria-modal="true"`, `aria-labelledby`

**Acceptance criteria:**
- Clic en backdrop → cierra el modal
- Tecla Escape → cierra el modal
- Clic dentro del modal → no cierra el modal
- El botón "Cerrar" llama a `onClose`
- El componente es reutilizable (no acoplado a ningún campo específico)

---

### Requirement: profile-help-icon-clickable

El icono `HelpOutlineIcon` en `ProfileSelect.tsx` debe ser un botón que abre `HelpModal` con el texto explicativo del campo "Perfil de comportamiento".

**Acceptance criteria:**
- El icono tiene `role="button"` / es un `<button>` con cursor pointer
- Al hacer clic abre el modal con título "Perfil de comportamiento"
- El contenido del modal es el texto explicativo del campo (**placeholder hasta recibir texto real**)
- El icono tiene `aria-label="Más información sobre Perfil de comportamiento"`

---

### Requirement: brief-help-icon-clickable

El icono `HelpOutlineIcon` en `BriefSelect.tsx` debe ser un botón que abre `HelpModal` con el texto explicativo del campo "Brief de producto".

**Acceptance criteria:**
- El icono tiene `role="button"` / es un `<button>` con cursor pointer
- Al hacer clic abre el modal con título "Brief de producto"
- El contenido del modal es el texto explicativo del campo (**placeholder hasta recibir texto real**)
- El icono tiene `aria-label="Más información sobre Brief de producto"`
