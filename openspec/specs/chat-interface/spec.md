# Spec: chat-interface

Interfaz conversacional principal de la aplicación. Pantalla única sin navegación lateral. El investigador configura la sesión en un accordion, chatea con el usuario sintético y cierra la sesión con opción de descarga de PDF.

---

## ADDED Requirements

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

---

### Requirement: Header fijo con logo y usuario

El header SHALL estar siempre visible con el logo Moeve a la izquierda y el nombre del usuario a la derecha. El fondo del header SHALL ser `#ffffff`.

#### Scenario: Logo siempre visible
- **WHEN** el investigador está en cualquier estado de la aplicación (con o sin sesión activa)
- **THEN** el logo Moeve SHALL estar visible en la esquina superior izquierda del header

#### Scenario: Nombre de usuario visible
- **WHEN** el header está visible
- **THEN** SHALL mostrarse el nombre o identificador del investigador en la parte derecha del header

---

### Requirement: Accordion de configuración y resumen de sesión

El sistema SHALL mostrar un accordion en la parte superior del área de contenido. Su comportamiento varía según el estado de la sesión.

**Sin sesión activa:** el accordion SHALL estar expandido mostrando dos selectores (perfil de comportamiento y brief de producto) y el botón "Iniciar sesión".

**Con sesión activa:** el accordion SHALL estar colapsado por defecto mostrando en su cabecera el resumen: "Perfil: [nombre] · Brief: [nombre] · LLM: [proveedor]", más el botón "Cerrar sesión". El investigador podrá expandirlo para ver el detalle pero no podrá cambiar los valores mid-sesión.

#### Scenario: Accordion expandido sin sesión
- **WHEN** no hay sesión activa
- **THEN** el accordion SHALL estar abierto mostrando el selector de perfil, el selector de brief y el botón "Iniciar sesión" deshabilitado

#### Scenario: Accordion colapsado con sesión activa
- **WHEN** el investigador inicia una sesión
- **THEN** el accordion SHALL colapsar automáticamente y mostrar en su cabecera el resumen de la sesión activa

#### Scenario: Expandir accordion durante sesión
- **WHEN** el investigador hace click en el accordion durante una sesión activa
- **THEN** SHALL expandirse mostrando el perfil, brief y LLM seleccionados, en modo solo lectura (sin posibilidad de cambio)

#### Scenario: Botón Cerrar sesión en accordion
- **WHEN** hay una sesión activa
- **THEN** SHALL aparecer el botón "Cerrar sesión" en la cabecera del accordion, visible tanto en estado colapsado como expandido

---

### Requirement: Selección de perfil de comportamiento

El sistema SHALL mostrar un dropdown para seleccionar el perfil de comportamiento, poblado con los perfiles disponibles de `GET /profiles`.

#### Scenario: Dropdown cargado al montar
- **WHEN** el investigador abre la aplicación
- **THEN** el dropdown de perfiles SHALL estar poblado con todos los perfiles disponibles del backend, mostrando el nombre de cada perfil

#### Scenario: Perfil seleccionado
- **WHEN** el investigador selecciona un perfil del dropdown
- **THEN** el perfil SHALL quedar seleccionado y, si el brief también está seleccionado, el botón "Iniciar sesión" SHALL habilitarse

---

### Requirement: Selección de brief de producto

El sistema SHALL mostrar un dropdown para seleccionar el brief de producto, poblado con los briefs disponibles de `GET /briefs`.

#### Scenario: Dropdown cargado al montar
- **WHEN** el investigador abre la aplicación
- **THEN** el dropdown de briefs SHALL estar poblado con todos los briefs disponibles del backend

#### Scenario: Añadir nuevo brief sin redeployar
- **WHEN** se añade un archivo de brief en el backend y el servidor se reinicia
- **THEN** el nuevo brief SHALL aparecer en el dropdown en la próxima carga de la aplicación sin cambios en el código frontend

---

### Requirement: Botón de inicio habilitado solo con selección completa

El botón "Iniciar sesión" SHALL estar deshabilitado hasta que el investigador haya seleccionado tanto un perfil como un brief.

#### Scenario: Botón deshabilitado sin selección completa
- **WHEN** el investigador no ha seleccionado perfil, o no ha seleccionado brief, o ninguno de los dos
- **THEN** el botón "Iniciar sesión" SHALL estar deshabilitado visualmente y no responder a clicks

#### Scenario: Botón habilitado con ambos seleccionados
- **WHEN** el investigador ha seleccionado perfil Y brief
- **THEN** el botón "Iniciar sesión" SHALL habilitarse con el estilo de botón primario (fondo `#90ffbb`, texto `#004656`)

---

### Requirement: Área de conversación con historial de mensajes

El sistema SHALL mostrar los mensajes de la conversación en orden cronológico ascendente dentro de un contenedor con scroll independiente. Fondo `#f5f7fd`.

#### Scenario: Estado vacío sin sesión
- **WHEN** no hay sesión activa
- **THEN** el área de chat SHALL mostrar un estado vacío con una indicación para seleccionar perfil y brief

#### Scenario: Mensaje del investigador
- **WHEN** el investigador envía un mensaje
- **THEN** SHALL aparecer alineado a la derecha con fondo `rgba(4,125,186,0.10)`, Moeve Sans 14px, con timestamp HH:MM

#### Scenario: Mensaje del usuario sintético con markdown
- **WHEN** el usuario sintético responde con contenido markdown
- **THEN** el mensaje SHALL renderizarse con markdown formateado (react-markdown), alineado a la izquierda, ancho completo, con timestamp HH:MM

#### Scenario: Scroll automático al último mensaje
- **WHEN** llega un nuevo mensaje
- **THEN** el área de chat SHALL hacer scroll automático hasta el mensaje más reciente

---

### Requirement: Estado de generación con spinner

El sistema SHALL mostrar un indicador visual mientras el backend procesa la respuesta.

#### Scenario: Spinner durante generación
- **WHEN** el investigador envía un mensaje y el backend está procesando
- **THEN** SHALL aparecer el componente Animated loader con texto "Generando respuesta..." en la posición del próximo mensaje del asistente

#### Scenario: Input deshabilitado durante generación
- **WHEN** el backend está procesando
- **THEN** el input bar SHALL estar deshabilitado

#### Scenario: Spinner reemplazado por respuesta
- **WHEN** el backend devuelve la respuesta
- **THEN** el spinner SHALL desaparecer y el mensaje del asistente SHALL ocupar su lugar

---

### Requirement: Acciones sobre mensajes del asistente

Cada mensaje del usuario sintético SHALL tener un botón "Copiar" que copia el texto al portapapeles con feedback visual (✓ temporal).

#### Scenario: Copiar mensaje
- **WHEN** el investigador hace click en "Copiar"
- **THEN** el texto SHALL copiarse al portapapeles y el botón SHALL cambiar a ✓ brevemente

---

### Requirement: Input bar con envío de mensajes

El sistema SHALL proporcionar un input bar fijo en la parte inferior con: botón `+` para cuestionario, textarea multilinea y botón de envío.

#### Scenario: Envío con botón o Enter
- **WHEN** el investigador escribe texto y hace click en enviar o pulsa Enter
- **THEN** el mensaje SHALL enviarse, el input SHALL limpiarse y el mensaje aparecerá en el chat

#### Scenario: Salto de línea con Shift+Enter
- **WHEN** el investigador pulsa Shift+Enter
- **THEN** SHALL insertarse un salto de línea sin enviar

#### Scenario: Input vacío no envía
- **WHEN** el campo está vacío o solo tiene espacios
- **THEN** el botón de envío SHALL estar deshabilitado

---

### Requirement: Footer del chat con disclaimer

El sistema SHALL mostrar un disclaimer fijo debajo del input bar durante toda la sesión activa.

#### Scenario: Disclaimer visible durante sesión
- **WHEN** hay una sesión activa
- **THEN** SHALL mostrarse: "Estás hablando con una IA sintética. Sus respuestas no representan opiniones reales." en Moeve Sans 12px, color `#5a7d91`

---

### Requirement: Modal de cierre de sesión con descarga de PDF

El sistema SHALL mostrar un modal de confirmación al cerrar sesión con opción de descargar el PDF. La descarga NO es automática.

#### Scenario: Apertura del modal
- **WHEN** el investigador hace click en "Cerrar sesión"
- **THEN** SHALL abrirse un modal con: resumen de sesión (perfil, brief, nº de mensajes), botón "Descargar PDF", botón "Cerrar sin descargar" y botón "Cancelar"

#### Scenario: Descarga de PDF sin cerrar modal
- **WHEN** el investigador hace click en "Descargar PDF"
- **THEN** el navegador SHALL iniciar la descarga vía `GET /sessions/{id}/pdf` sin cerrar el modal

#### Scenario: Cierre sin descarga
- **WHEN** el investigador hace click en "Cerrar sin descargar"
- **THEN** SHALL llamarse `DELETE /sessions/{id}`, el modal SHALL cerrarse y la UI SHALL volver al estado inicial con el accordion expandido para nueva sesión

#### Scenario: Cancelar
- **WHEN** el investigador hace click en "Cancelar"
- **THEN** el modal SHALL cerrarse sin cambios en la sesión activa

---

### Requirement: Sistema de diseño Moeve aplicado consistentemente

Todos los componentes SHALL usar los tokens de color y tipografía extraídos del archivo Figma. Moeve Sans SHALL cargarse desde archivos `.otf` locales con fallback `sans-serif`.

#### Scenario: Fuente corporativa cargada
- **WHEN** la aplicación carga
- **THEN** todo el texto SHALL renderizarse en Moeve Sans

#### Scenario: Colores correctos en header y accordion
- **WHEN** el header y el accordion son visibles
- **THEN** el header SHALL tener fondo `#ffffff`, el texto SHALL ser `#004656`, y el botón primario SHALL tener fondo `#90ffbb` con texto `#004656`

---

## MODIFIED Requirements

### Requirement: Header fijo con logo y usuario

El header SHALL tener altura `64px`, fondo `#ffffff` y borde inferior `#9bcbe3` (sin sombra). A la izquierda SHALL mostrarse el logo Moeve seguido del título "Sistema de usuarios sintéticos" en Moeve Sans Light 24px color `#047dba`. A la derecha SHALL mostrarse el avatar del usuario (círculo `#1b3a5a` con icono de persona blanco), nombre completo en Moeve Sans Bold 14px `#004656`, rol en Moeve Sans Regular 14px `#004656`, y botón dropdown.

#### Scenario: Logo y título alineados a la izquierda
- **WHEN** el header está visible
- **THEN** el logo Moeve y el texto "Sistema de usuarios sintéticos" SHALL estar juntos en la parte izquierda del header, con el texto en 24px, color `#047dba`, peso Light

#### Scenario: Sección de usuario a la derecha
- **WHEN** el header está visible
- **THEN** en la parte derecha SHALL mostrarse: avatar circular con fondo `#1b3a5a`, nombre del usuario en Bold 14px, rol en Regular 14px, y flecha de dropdown — todos en color `#004656`

---

### Requirement: Footer del chat con disclaimer

El footer SHALL tener altura `65px`, borde superior `#9bcbe3`, fondo `#ffffff`, ancho completo (sin restricción de ancho máximo). SHALL mostrar en la parte izquierda "Sistema de usuarios sintéticos" en Moeve Sans Light 14px `#004656` y en la parte derecha "© Moeve 2026" en Moeve Sans Regular 14px `#004656`.

#### Scenario: Footer con texto izquierda y derecha
- **WHEN** el footer es visible
- **THEN** SHALL mostrarse "Sistema de usuarios sintéticos" alineado a la izquierda y "© Moeve 2026" alineado a la derecha, ambos en color `#004656`

---

### Requirement: Accordion de configuración y resumen de sesión

#### Scenario: Accordion expandido sin sesión — layout inline
- **WHEN** no hay sesión activa y el accordion está expandido
- **THEN** el selector de perfil, el selector de brief y el botón "Iniciar sesión" SHALL estar en la misma fila horizontal, con el botón alineado al borde inferior de los selectores (no al centro del bloque label+select)

---

### Requirement: Área de conversación con historial de mensajes

#### Scenario: Mensaje del asistente sin tarjeta blanca
- **WHEN** el usuario sintético responde
- **THEN** el texto SHALL renderizarse directamente sobre el fondo `#f5f7fd` de la conversación, sin tarjeta blanca ni borde, en Moeve Sans Light 16px color `#004656`

---

### Requirement: Input bar con envío de mensajes

El input bar SHALL mostrar un contenedor con fondo `#f2f6f7`, bordes redondeados `8px`, sin borde exterior visible. El texto del textarea SHALL ser Moeve Sans Light 16px `#004656`.

#### Scenario: Estilo del contenedor del input
- **WHEN** el input bar es visible
- **THEN** el textarea SHALL estar sobre un fondo `#f2f6f7` sin borde, con placeholder en color `#6b7280`

---

### Requirement: Bloque de preguntas sugeridas en el layout

El layout de la pantalla de chat SHALL incluir el bloque de preguntas sugeridas entre el accordion de configuración y el área de conversación. Este bloque SHALL seguir las mismas condiciones de visibilidad que el input bar (solo visible con sesión activa).

#### Scenario: Bloque integrado en el layout con sesión activa

- **WHEN** el investigador tiene una sesión activa
- **THEN** el layout SHALL mostrar: header → accordion (colapsado) → bloque de píldoras → área de conversación → input bar → footer, en ese orden vertical
