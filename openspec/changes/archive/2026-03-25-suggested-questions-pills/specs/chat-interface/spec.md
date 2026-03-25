# Spec: chat-interface (delta)

---

## ADDED Requirements

### Requirement: Bloque de preguntas sugeridas en el layout

El layout de la pantalla de chat SHALL incluir el bloque de preguntas sugeridas entre el accordion de configuración y el área de conversación. Este bloque SHALL seguir las mismas condiciones de visibilidad que el input bar (solo visible con sesión activa).

#### Scenario: Bloque integrado en el layout con sesión activa

- **WHEN** el investigador tiene una sesión activa
- **THEN** el layout SHALL mostrar: header → accordion (colapsado) → bloque de píldoras → área de conversación → input bar → footer, en ese orden vertical
