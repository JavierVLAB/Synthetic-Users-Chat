# content-editor Specification

## Purpose
TBD - created by archiving change fix-historial-editor-contenido-prompt-realismo. Update Purpose after archive.
## Requirements
### Requirement: Ver contenido de ítem seleccionado
El sistema SHALL mostrar un icono ⓘ junto al label de cada selector (perfil, brief, departamento) que se habilita cuando hay un ítem seleccionado (value !== ""). Al hacer clic SHALL abrirse el `ContentViewerModal` mostrando el contenido completo del ítem en formato legible.

#### Scenario: Icono deshabilitado sin selección
- **WHEN** ningún ítem está seleccionado en el selector
- **THEN** el icono ⓘ SHALL estar visualmente desactivado (opacity-40) y no responder a clics

#### Scenario: Abrir modal al clic
- **WHEN** el usuario hace clic en el icono ⓘ con un ítem seleccionado
- **THEN** el sistema SHALL llamar a `GET /{tipo}/{id}` y mostrar el modal con el contenido completo del ítem

#### Scenario: Contenido mostrado en formato legible
- **WHEN** el modal está abierto con contenido cargado
- **THEN** SHALL mostrarse cada campo del YAML como sección con título (campo name → cabecera principal, campos de texto → párrafos con label en negrita)

#### Scenario: Spinner durante carga
- **WHEN** el modal está cargando el contenido del ítem
- **THEN** SHALL mostrarse un indicador de carga hasta que el fetch complete

### Requirement: Editar contenido de ítem si admin token disponible
Cuando `NEXT_PUBLIC_ADMIN_TOKEN` está configurado como variable de entorno del frontend, el `ContentViewerModal` SHALL mostrar un botón "Editar" que activa el modo edición. En modo edición el contenido se muestra en un `<textarea>` editable con el YAML raw. Al guardar SHALL llamar a `PUT /{tipo}/{id}` con el contenido modificado.

#### Scenario: Botón Editar visible con admin token
- **WHEN** `NEXT_PUBLIC_ADMIN_TOKEN` tiene valor y el modal está en modo lectura
- **THEN** SHALL mostrarse el botón "Editar" en el footer del modal

#### Scenario: Botón Editar oculto sin admin token
- **WHEN** `NEXT_PUBLIC_ADMIN_TOKEN` no está definida o es cadena vacía
- **THEN** NO SHALL mostrarse ningún control de edición en el modal

#### Scenario: Guardar cambios exitoso
- **WHEN** el usuario edita el YAML y hace clic en "Guardar"
- **THEN** el sistema SHALL llamar a `PUT /{tipo}/{id}` con el nuevo contenido y mostrar confirmación de éxito

#### Scenario: Error al guardar
- **WHEN** la llamada a PUT falla (token incorrecto, YAML inválido, etc.)
- **THEN** SHALL mostrarse el mensaje de error del servidor en el modal sin cerrarlo

#### Scenario: Cancelar edición
- **WHEN** el usuario hace clic en "Cancelar" en modo edición
- **THEN** el modal SHALL volver al modo lectura descartando los cambios sin guardados

