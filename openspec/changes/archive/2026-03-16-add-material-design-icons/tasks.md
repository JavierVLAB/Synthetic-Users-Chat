## 1. Instalación de dependencias

- [x] 1.1 Instalar `@mui/icons-material`, `@mui/material`, `@emotion/react` y `@emotion/styled` en `frontend/`

## 2. Botón Cuestionario — solo icono

- [x] 2.1 Importar `AttachFileIcon` de `@mui/icons-material` en `QuestionnaireUpload.tsx`
- [x] 2.2 Reemplazar el contenido del botón (`📋 Cuestionario` / `📋 ${fileName}`) por solo `<AttachFileIcon />`

## 3. Botón Enviar — icono + texto

- [x] 3.1 Importar `SendIcon` de `@mui/icons-material` en `InputBar.tsx`
- [x] 3.2 Añadir `<SendIcon />` antes del texto "Enviar" en el botón

## 4. Botón Iniciar chat — icono + texto

- [x] 4.1 Importar `PlayArrowIcon` de `@mui/icons-material` en `SessionAccordion.tsx`
- [x] 4.2 Añadir `<PlayArrowIcon />` antes del texto "Iniciar chat"

## 5. Botón Cerrar sesión — icono + texto

- [x] 5.1 Importar `StopIcon` de `@mui/icons-material` en `SessionAccordion.tsx`
- [x] 5.2 Añadir `<StopIcon />` antes del texto "Cerrar sesión"

## 6. Hora con icono reloj en burbujas

- [x] 6.1 Importar `AccessTimeIcon` en `AssistantMessage.tsx`
- [x] 6.2 Envolver el timestamp de `AssistantMessage.tsx` en `inline-flex items-center gap-0.5` y añadir `<AccessTimeIcon fontSize="inherit" />`
- [x] 6.3 Importar `AccessTimeIcon` en `MessageBubble.tsx`
- [x] 6.4 Aplicar el mismo patrón de icono + hora en `MessageBubble.tsx`

## 7. Botón Copiar — solo icono

- [x] 7.1 Importar `ContentCopyIcon` y `CheckIcon` de `@mui/icons-material` en `AnswerActions.tsx`
- [x] 7.2 Reemplazar el texto "Copiar" / "✓ Copiado" por `<ContentCopyIcon fontSize="small" />` / `<CheckIcon fontSize="small" />`
- [x] 7.3 Añadir `title="Copiar respuesta"` al botón para accesibilidad

## 8. Icono de ayuda en labels

- [x] 8.1 Importar `HelpOutlineIcon` de `@mui/icons-material` en `ProfileSelect.tsx`
- [x] 8.2 Añadir `<HelpOutlineIcon fontSize="inherit" aria-hidden="true" />` en la label "Perfil de comportamiento" con layout `inline-flex items-center gap-1`
- [x] 8.3 Importar `HelpOutlineIcon` en `BriefSelect.tsx`
- [x] 8.4 Aplicar el mismo patrón en la label "Brief de producto"
