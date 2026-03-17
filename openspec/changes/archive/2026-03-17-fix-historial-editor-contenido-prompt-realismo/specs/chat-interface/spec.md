## MODIFIED Requirements

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
