# Spec: chat-interface (delta)

## MODIFIED Requirements

### Requirement: Layout de pantalla única sin sidebar

La aplicación SHALL renderizar un layout de columna centrada compuesto por: header fijo superior, accordion de configuración/sesión, área de conversación con scroll independiente, input bar fijo inferior y footer fijo. NO SHALL existir sidebar de navegación lateral en esta versión. El acceso SHALL requerir autenticación: si el usuario no tiene JWT válido, SHALL ser redirigido a `/login`.

#### Scenario: Renderizado inicial con usuario autenticado

- **WHEN** el investigador accede a la URL raíz con JWT válido
- **THEN** SHALL mostrarse el layout completo: header con logo Moeve, accordion expandido de configuración, área de chat vacía con estado inicial, input bar y footer "Sistema de usuarios sintéticos © Moeve 2026"

#### Scenario: Acceso sin autenticación

- **WHEN** el investigador accede a la URL raíz sin JWT válido en localStorage
- **THEN** SHALL ser redirigido a `/login`

#### Scenario: Sin sidebar

- **WHEN** la aplicación está visible en cualquier estado
- **THEN** NO SHALL existir ningún panel de navegación lateral ni menú con secciones
