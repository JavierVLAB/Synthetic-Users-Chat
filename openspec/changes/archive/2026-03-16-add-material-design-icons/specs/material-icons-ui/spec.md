## Capability: material-icons-ui

Integración de Material Design Icons en el frontend del chat de usuarios sintéticos.

---

## ADDED Requirements

### Requirement: install-mui-icons

La librería `@mui/icons-material` debe instalarse como dependencia de producción en `frontend/package.json`. También se instalan sus peer dependencies: `@mui/material`, `@emotion/react`, `@emotion/styled`.

**Acceptance criteria:**
- `@mui/icons-material` aparece en `dependencies` de `package.json`
- El proyecto compila sin errores con `npm run build`

---

### Requirement: questionnaire-button-icon-only

El botón de subir cuestionario (`QuestionnaireUpload.tsx`) debe mostrar únicamente el icono `AttachFile` de Material Icons, sin texto. El comportamiento de carga de archivo no cambia.

**Acceptance criteria:**
- El botón muestra solo `<AttachFileIcon />`, sin texto "Cuestionario" ni emoji
- El atributo `title="Subir cuestionario (.txt)"` se mantiene para accesibilidad
- Al seleccionar un archivo, el botón sigue mostrando solo el icono (sin nombre de archivo)
- La funcionalidad de carga y envío de preguntas no cambia

---

### Requirement: send-button-icon

El botón "Enviar" de `InputBar.tsx` debe incluir el icono `Send` de Material Icons junto al texto "Enviar".

**Acceptance criteria:**
- El botón muestra `<SendIcon />` seguido del texto "Enviar"
- El icono se alinea verticalmente con el texto
- El estado de carga (`loading`) y deshabilitado (`disabled`) siguen funcionando igual

---

### Requirement: start-session-button-icon

El botón "Iniciar chat" de `SessionAccordion.tsx` debe incluir el icono `PlayArrow` de Material Icons junto al texto "Iniciar chat".

**Acceptance criteria:**
- El botón muestra `<PlayArrowIcon />` seguido del texto "Iniciar chat"
- El estado de carga y deshabilitado siguen funcionando

---

### Requirement: close-session-button-icon

El botón "Cerrar sesión" de `SessionAccordion.tsx` debe incluir el icono `Stop` de Material Icons junto al texto "Cerrar sesión".

**Acceptance criteria:**
- El botón muestra `<StopIcon />` seguido del texto "Cerrar sesión"
- El estilo `variant="danger"` se mantiene

---

### Requirement: message-timestamp-icon

La hora mostrada en las burbujas de mensajes (tanto `AssistantMessage.tsx` como `MessageBubble.tsx`) debe incluir el icono `AccessTime` antes del texto de la hora.

**Acceptance criteria:**
- Aparece `<AccessTimeIcon fontSize="inherit" />` inmediatamente antes de la hora formateada
- El icono usa el mismo color y tamaño que el texto de la hora (`text-xs text-text-secondary`)
- La alineación es `inline-flex items-center gap-0.5`

---

### Requirement: copy-button-icon-only

El botón "Copiar" de `AnswerActions.tsx` debe mostrar únicamente el icono `ContentCopy` sin texto. Al copiar correctamente, cambia temporalmente al icono `Check`.

**Acceptance criteria:**
- Estado por defecto: muestra `<ContentCopyIcon fontSize="small" />`
- Estado copiado (2 segundos): muestra `<CheckIcon fontSize="small" />`
- El atributo `title="Copiar respuesta"` se mantiene
- No se muestra texto en ningún estado

---

### Requirement: label-info-icon

Las etiquetas "Perfil de comportamiento" (`ProfileSelect.tsx`) y "Brief de producto" (`BriefSelect.tsx`) deben incluir el icono `HelpOutline` al final del texto de la label.

**Acceptance criteria:**
- Aparece `<HelpOutlineIcon fontSize="inherit" aria-hidden="true" />` a la derecha del texto de la label
- El icono es decorativo (`aria-hidden="true"`)
- El icono usa el color `text-text-secondary`
- El layout de la label es `inline-flex items-center gap-1`
