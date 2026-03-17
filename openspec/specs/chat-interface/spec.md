# Spec: chat-interface

Interfaz conversacional principal de la aplicación. Pantalla única sin navegación lateral. El investigador configura la sesión en un accordion, chatea con el usuario sintético y cierra la sesión con opción de descarga de PDF.

---
## Requirements
### Requirement: Layout de pantalla única sin sidebar

La aplicación SHALL renderizar un layout de columna centrada compuesto por: header fijo superior, accordion de configuración/sesión, área de conversación con scroll independiente, input bar fijo inferior y footer fijo. NO SHALL existir sidebar de navegación lateral en esta versión.

#### Scenario: Renderizado inicial
- **WHEN** el investigador accede a la URL raíz
- **THEN** SHALL mostrarse el layout completo: header con logo Moeve, accordion expandido de configuración, área de chat vacía con estado inicial, input bar y footer "Sistema de usuarios sintéticos © Moeve 2026"

#### Scenario: Sin sidebar
- **WHEN** la aplicación está visible en cualquier estado
- **THEN** NO SHALL existir ningún panel de navegación lateral ni menú con secciones

---

### Requirement: Header fijo con logo y usuario

El header SHALL tener altura `64px`, fondo `#ffffff` y borde inferior `#9bcbe3` (sin sombra). A la izquierda SHALL mostrarse el logo Moeve seguido del título "Sistema de usuarios sintéticos" en Moeve Sans Light 24px color `#047dba`. A la derecha SHALL mostrarse el avatar del usuario (círculo `#1b3a5a` con icono de persona blanco), nombre completo en Moeve Sans Bold 14px `#004656`, rol en Moeve Sans Regular 14px `#004656`, y botón dropdown.

#### Scenario: Logo y título alineados a la izquierda
- **WHEN** el header está visible
- **THEN** el logo Moeve y el texto "Sistema de usuarios sintéticos" SHALL estar juntos en la parte izquierda del header, con el texto en 24px, color `#047dba`, peso Light

#### Scenario: Sección de usuario a la derecha
- **WHEN** el header está visible
- **THEN** en la parte derecha SHALL mostrarse: avatar circular con fondo `#1b3a5a`, nombre del usuario en Bold 14px, rol en Regular 14px, y flecha de dropdown — todos en color `#004656`

---

### Requirement: Accordion de configuración y resumen de sesión
El sistema SHALL mostrar un accordion en la parte superior del área de contenido. Su comportamiento varía según el estado de la sesión.

**Sin sesión activa:** el accordion SHALL estar expandido mostrando tres selectores (perfil de comportamiento, brief de producto y departamento opcional) y el botón "Iniciar sesión". Junto a cada selector SHALL aparecer un icono ⓘ que permite ver el contenido del ítem seleccionado.

**Con sesión activa (modo normal):** el accordion SHALL colapsar automáticamente mostrando en su cabecera el resumen: "Perfil: [nombre] · Brief: [nombre] · (Depto: [nombre] si aplica)", más el botón "Cerrar sesión".

**Con sesión cargada en modo lectura (isViewMode=true):** el accordion SHALL mostrar la barra de resumen de sesión con badge "Solo lectura", los datos de la sesión, y el botón "Nueva sesión" que al pulsarse limpia el estado y vuelve al panel de configuración. NO SHALL aparecer el botón "Cerrar sesión" en modo lectura.

#### Scenario: Accordion expandido sin sesión
- **WHEN** no hay sesión activa
- **THEN** el accordion SHALL estar abierto mostrando el selector de perfil, el selector de brief, el selector de departamento (opcional) y el botón "Iniciar sesión" deshabilitado hasta que perfil y brief estén seleccionados

#### Scenario: Botón Nueva sesión en modo lectura
- **WHEN** `isViewMode=true` (sesión cerrada cargada desde historial)
- **THEN** SHALL mostrarse el botón "Nueva sesión" en la barra de estado que al pulsarse llama a `closeSession()` y restablece el estado inicial

#### Scenario: Accordion colapsado con sesión activa
- **WHEN** el investigador inicia una sesión
- **THEN** el accordion SHALL colapsar automáticamente y mostrar en su cabecera el resumen de la sesión activa

#### Scenario: Botón Cerrar sesión solo en modo activo
- **WHEN** hay una sesión activa (`isViewMode=false`)
- **THEN** SHALL aparecer el botón "Cerrar sesión" en la cabecera; cuando `isViewMode=true` ese botón NO SHALL mostrarse

#### Scenario: Icono ⓘ junto a selectores
- **WHEN** el accordion está expandido sin sesión activa
- **THEN** cada selector SHALL mostrar un icono ⓘ que se activa cuando hay un ítem seleccionado

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
- **THEN** SHALL aparecer alineado a la derecha con fondo `rgba(4,125,186,0.10)`, esquinas redondeadas en tl/tr/bl (sin br), Moeve Sans Light 16px `#004656`, con timestamp HH:MM

#### Scenario: Mensaje del asistente sin tarjeta blanca
- **WHEN** el usuario sintético responde
- **THEN** el texto SHALL renderizarse directamente sobre el fondo `#f5f7fd` de la conversación, sin tarjeta blanca ni borde, en Moeve Sans Light 16px `#004656`, con markdown formateado (react-markdown)

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

El sistema SHALL proporcionar un input bar con contenedor fondo `#f2f6f7`, bordes redondeados `8px`, sin borde exterior visible. Incluye: botón `+` para cuestionario, textarea multilinea Moeve Sans Light 16px `#004656`, y botón de envío.

#### Scenario: Envío con botón o Enter
- **WHEN** el investigador escribe texto y hace click en enviar o pulsa Enter
- **THEN** el mensaje SHALL enviarse, el input SHALL limpiarse y el mensaje aparecerá en el chat

#### Scenario: Salto de línea con Shift+Enter
- **WHEN** el investigador pulsa Shift+Enter
- **THEN** SHALL insertarse un salto de línea sin enviar

#### Scenario: Input vacío no envía
- **WHEN** el campo está vacío o solo tiene espacios
- **THEN** el botón de envío SHALL estar deshabilitado

#### Scenario: Estilo del contenedor del input
- **WHEN** el input bar es visible
- **THEN** el textarea SHALL estar sobre un fondo `#f2f6f7` sin borde, con placeholder en color `#6b7280`

---

### Requirement: Footer del chat con disclaimer

El footer SHALL tener altura `65px`, borde superior `#9bcbe3`, fondo `#ffffff`, ancho completo (sin restricción de ancho máximo). SHALL mostrar en la parte izquierda "Sistema de usuarios sintéticos" en Moeve Sans Light 14px `#004656` y en la parte derecha "© Moeve 2026" en Moeve Sans Regular 14px `#004656`.

#### Scenario: Footer con texto izquierda y derecha
- **WHEN** el footer es visible
- **THEN** SHALL mostrarse "Sistema de usuarios sintéticos" alineado a la izquierda y "© Moeve 2026" alineado a la derecha, ambos en color `#004656`

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

Todos los componentes SHALL usar los tokens de color y tipografía del sistema Moeve. Moeve Sans SHALL cargarse desde archivos `.otf` locales. Los pesos disponibles son Light (300), Regular (400) y Bold (700) — no existe Medium (500).

#### Scenario: Fuente corporativa cargada
- **WHEN** la aplicación carga
- **THEN** todo el texto SHALL renderizarse en Moeve Sans

#### Scenario: Colores correctos en header y accordion
- **WHEN** el header y el accordion son visibles
- **THEN** el header SHALL tener fondo `#ffffff`, borde `#9bcbe3`, título `#047dba`, y el botón primario SHALL tener fondo `#90ffbb` con texto `#004656`

#### Scenario: Bordes usando token split
- **WHEN** cualquier componente con borde es visible (header, footer, accordion, input bar)
- **THEN** el color de borde SHALL ser `#9bcbe3`, nunca colores genéricos de Tailwind como `gray-100` o `gray-200`

### Requirement: Botón discreto de debug en la interfaz de conversación

La interfaz SHALL incluir un botón de debug visible únicamente durante una sesión activa no en modo lectura. El botón SHALL usar el icono `BugReportIcon` (MUI), tener apariencia discreta (texto secundario, sin fondo) y posicionarse en el área de conversación (esquina superior derecha del área de chat o junto al input bar).

#### Scenario: Botón visible con sesión activa
- **WHEN** hay una sesión activa (`session !== null`) y no está en modo lectura (`isViewMode === false`)
- **THEN** el botón de debug SHALL mostrarse con `BugReportIcon` y etiqueta "Debug" o solo icono con tooltip

#### Scenario: Botón oculto sin sesión o en modo lectura
- **WHEN** no hay sesión activa O `isViewMode === true`
- **THEN** el botón de debug NO SHALL renderizarse en el DOM

#### Scenario: Estado del prompt y tokens en la página
- **WHEN** el backend responde a un mensaje con `system_prompt` y `usage`
- **THEN** `page.tsx` SHALL almacenar `lastSystemPrompt` y `lastUsage` en estado local y pasarlos al `DebugPanel` como props

