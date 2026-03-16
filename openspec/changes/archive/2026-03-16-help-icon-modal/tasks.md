## 1. Componente HelpModal

- [x] 1.1 Crear `frontend/components/HelpModal.tsx` con props `title`, `content` y `onClose`
- [x] 1.2 Implementar cierre por backdrop click
- [x] 1.3 Implementar cierre por tecla Escape (`useEffect` con `keydown`)
- [x] 1.4 Añadir atributos de accesibilidad: `role="dialog"`, `aria-modal="true"`, `aria-labelledby`

## 2. ProfileSelect — icono clicable

- [x] 2.1 Añadir `useState<boolean>` para controlar apertura del modal en `ProfileSelect.tsx`
- [x] 2.2 Convertir el `HelpOutlineIcon` en un `<button>` con `onClick` y `aria-label`
- [x] 2.3 Renderizar `<HelpModal>` cuando el estado sea `true`, con placeholder de contenido

## 3. BriefSelect — icono clicable

- [x] 3.1 Añadir `useState<boolean>` para controlar apertura del modal en `BriefSelect.tsx`
- [x] 3.2 Convertir el `HelpOutlineIcon` en un `<button>` con `onClick` y `aria-label`
- [x] 3.3 Renderizar `<HelpModal>` cuando el estado sea `true`, con placeholder de contenido

## 4. Contenido real del modal

- [x] 4.1 Reemplazar placeholder de "Perfil de comportamiento" con el texto proporcionado por el equipo
- [x] 4.2 Reemplazar placeholder de "Brief de producto" con el texto proporcionado por el equipo
