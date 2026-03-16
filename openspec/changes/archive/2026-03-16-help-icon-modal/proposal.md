## Why

Los iconos `HelpOutline` junto a "Perfil de comportamiento" y "Brief de producto" son actualmente decorativos. Los investigadores que usan la herramienta por primera vez no saben qué significa cada campo ni cómo elegirlo. Hacerlos clicables y mostrar una explicación en modal resuelve esta fricción sin añadir ruido visual permanente.

## What Changes

- El icono `HelpOutline` de `ProfileSelect` y `BriefSelect` se convierte en un botón clicable
- Al hacer clic abre un modal con título y texto explicativo para ese campo
- El modal se cierra con un botón "Cerrar" o pulsando fuera (backdrop click) o tecla Escape
- El contenido del modal (título + texto) se define por campo — será proporcionado por el equipo
- Se crea un componente reutilizable `HelpModal` para no duplicar lógica

## Capabilities

### New Capabilities
- `help-modal`: Componente modal de ayuda reutilizable con título, texto y cierre por botón/backdrop/Escape

### Modified Capabilities
- ninguna

## Impact

- **Frontend únicamente**
- Archivos afectados: `ProfileSelect.tsx`, `BriefSelect.tsx`
- Nuevo componente: `components/HelpModal.tsx`
- Sin cambios en backend ni API
- Sin nuevas dependencias (usa la librería MUI ya instalada o solo HTML/Tailwind)
