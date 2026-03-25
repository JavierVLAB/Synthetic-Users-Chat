## Context

Cambio exclusivamente frontend. El chat ya tiene un input bar con textarea; las píldoras simplemente inyectan texto en ese textarea. No hay cambios en backend, API ni base de datos.

## Goals / Non-Goals

**Goals:**
- Mostrar 3 píldoras de preguntas sugeridas en la interfaz de chat cuando hay sesión activa
- Al hacer click, insertar el texto de la pregunta en el textarea del input bar
- Usar tokens de color Moeve existentes (`#9bcbe3` azul claro)

**Non-Goals:**
- Envío automático al hacer click (el usuario decide cuándo enviar)
- Preguntas dinámicas desde backend
- Personalización de las preguntas por perfil o brief

## Decisions

**Componente inline vs. separado**
Las píldoras van directamente en la página principal del chat, sin extraerlas a un componente separado. Son solo 3 botones estáticos — un componente propio sería over-engineering. Si en el futuro se vuelven dinámicas, se extrae entonces.

**Posición: debajo del accordion, encima del chat**
Visible solo con sesión activa (mismas condiciones que el input bar). Se ocultan sin sesión porque no hay con quién hablar aún.

**Interacción: llenar textarea, no enviar**
El investigador puede revisar o editar la pregunta antes de enviar. Esto da más control y evita envíos accidentales.

## Risks / Trade-offs

- Las preguntas son hardcoded en el frontend. Si se quieren cambiar, hay que tocar código. Aceptable para esta fase.
