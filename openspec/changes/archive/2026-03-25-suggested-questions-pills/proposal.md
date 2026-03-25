## Why

El investigador necesita una forma rápida de enviar preguntas frecuentes sin tener que escribirlas manualmente cada vez. Las píldoras de preguntas sugeridas reducen la fricción en el flujo de investigación.

## What Changes

- Añadir un bloque de 3 botones en formato píldora debajo del accordion de configuración (visible solo cuando hay sesión activa)
- Al hacer click en una píldora, su texto se inserta en el textarea del input bar (no se envía automáticamente)
- Las píldoras usan el sistema de diseño Moeve (azul claro: `#9bcbe3`)

## Capabilities

### New Capabilities

- `suggested-questions`: Componente de píldoras de preguntas sugeridas en la interfaz de chat

### Modified Capabilities

- `chat-interface`: Se añade el bloque de píldoras al layout de la pantalla de chat (nuevo elemento visual debajo del accordion)

## Impact

- Frontend únicamente: nuevo componente React + modificación del layout en la página principal
- Sin cambios en backend ni en API
- Sin nuevas dependencias
