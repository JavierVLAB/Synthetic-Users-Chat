# Spec: suggested-questions

Bloque de preguntas sugeridas en formato píldora para acelerar el flujo del investigador. Las píldoras aparecen en la pantalla de chat con sesión activa y rellenan el input al hacer click.

---

## ADDED Requirements

### Requirement: Píldoras de preguntas sugeridas visibles con sesión activa

El sistema SHALL mostrar un bloque horizontal de 3 botones en formato píldora debajo del accordion de configuración, únicamente cuando hay una sesión activa. Las preguntas son: "¿Qué te parece la interfaz?", "¿Qué barreras encuentras al producto?" y "¿Qué le cambiarías?".

#### Scenario: Píldoras visibles con sesión activa

- **WHEN** el investigador tiene una sesión activa
- **THEN** SHALL mostrarse 3 botones en forma de píldora con las preguntas sugeridas, dispuestos en fila horizontal

#### Scenario: Píldoras ocultas sin sesión

- **WHEN** no hay sesión activa
- **THEN** el bloque de píldoras NO SHALL ser visible

#### Scenario: Click en píldora rellena el input

- **WHEN** el investigador hace click en una píldora
- **THEN** el texto de esa pregunta SHALL insertarse en el textarea del input bar, sin enviar el mensaje automáticamente

#### Scenario: Estilo con tokens Moeve

- **WHEN** las píldoras son visibles
- **THEN** SHALL renderizarse con fondo `#f0f5ff`, texto `#047dba` (accent), borde `#047dba/30`, bordes redondeados (forma píldora), en Moeve Sans 14px
