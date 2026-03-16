## Why

La interfaz del chat usa texto plano en botones y etiquetas donde los iconos comunicarían la acción de forma más rápida e intuitiva. Unificar todos los iconos bajo Material Design garantiza coherencia visual y reduce la dependencia de múltiples librerías.

## What Changes

- Instalar `@mui/icons-material` (o `material-symbols`) como única librería de iconos del frontend
- Reemplazar el botón "Cuestionario" (con icono actual) por un icono de adjunto (`AttachFile`) sin texto
- Añadir icono de envío (`Send`) al botón "Enviar" del chat
- Añadir icono de play (`PlayArrow`) al botón "Iniciar chat"
- Añadir icono de stop (`Stop`) al botón "Cerrar chat"
- Reemplazar la etiqueta de hora en las burbujas del chat por un icono de reloj (`AccessTime`) junto a la hora
- Reemplazar el botón "Copiar" en las burbujas del chat por un icono de copiar (`ContentCopy`) sin texto
- Añadir icono de información/ayuda (`HelpOutline` o `InfoOutlined`) junto a las etiquetas "Perfil de comportamiento" y "Brief de producto"

## Capabilities

### New Capabilities
- `material-icons-ui`: Integración de Material Design Icons en el frontend — instalación de librería, reemplazo y adición de iconos en los componentes del chat y del sidebar

### Modified Capabilities
- ninguna

## Impact

- **Frontend únicamente** — no hay cambios en backend ni API
- Archivos afectados: componentes del chat (`ChatWindow`, `MessageBubble` o equivalentes), sidebar/formulario de configuración de sesión
- Nueva dependencia npm: `@mui/icons-material` + `@mui/material` (peer dependency) o alternativa ligera `material-symbols`
- Build size incrementa levemente por la librería de iconos (tree-shakeable)
