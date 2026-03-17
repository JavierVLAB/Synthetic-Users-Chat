## 1. Bug fix — Nueva sesión desde modo lectura

- [ ] 1.1 Añadir botón "Nueva sesión" en SessionAccordion cuando `isViewMode=true` (llama a `closeSession()`)
- [ ] 1.2 Verificar que al pulsar "Nueva sesión" el accordion vuelve al panel de configuración con los selectores vacíos

## 2. API — Endpoints de detalle y edición

- [ ] 2.1 Añadir `GET /profiles/{id}` al router de perfiles si no existe (devuelve contenido completo del YAML)
- [ ] 2.2 Añadir funciones `fetchProfile(id)` y `updateProfile(id, content)` a `frontend/services/api.ts`
- [ ] 2.3 Añadir funciones `updateBrief(id, content)` y `updateDepartment(id, content)` a `frontend/services/api.ts`

## 3. Componente ContentViewerModal

- [ ] 3.1 Crear `frontend/components/ContentViewerModal.tsx` con props: `title`, `content`, `itemId`, `itemType`, `onClose`, `editable`
- [ ] 3.2 Implementar modo lectura: mostrar cada campo del objeto como sección con label + valor de texto
- [ ] 3.3 Implementar modo edición: textarea con YAML raw, botón "Guardar" y "Cancelar"
- [ ] 3.4 Implementar lógica de guardado: `PUT /profiles/{id}` | `PUT /briefs/{id}` | `PUT /departments/{id}` según `itemType`
- [ ] 3.5 Mostrar spinner durante fetch inicial y spinner/error en guardado

## 4. Icono ⓘ en los selectores

- [ ] 4.1 Añadir icono InfoOutlined junto al label de `ProfileSelect.tsx` con fetch al clic
- [ ] 4.2 Añadir icono InfoOutlined junto al label de `BriefSelect.tsx` con fetch al clic
- [ ] 4.3 Añadir icono InfoOutlined junto al label de `DepartmentSelect.tsx` con fetch al clic
- [ ] 4.4 Deshabilitar el icono cuando `value === ""`
- [ ] 4.5 Pasar `editable={!!process.env.NEXT_PUBLIC_ADMIN_TOKEN}` al `ContentViewerModal`

## 5. Campo datos_de_uso en briefs

- [ ] 5.1 Añadir campo `datos_de_uso` en `CreateBriefModal.tsx` (textarea, opcional, al final del formulario)
- [ ] 5.2 Actualizar `llm_service.build_system_prompt()` para detectar `datos_de_uso` en el brief y construir la sección "DATOS REALES DE USO" en el prompt

## 6. System prompt anti-alucinación

- [ ] 6.1 Actualizar `backend/prompts/system_prompt_template.txt`: añadir sección "SOBRE LOS DATOS Y TU CRITERIO" con instrucciones anti-alucinación y anti-complacencia
- [ ] 6.2 Añadir variable `{datos_de_uso}` al template (vacía si el brief no tiene el campo)
- [ ] 6.3 Actualizar `llm_service.build_system_prompt()` para extraer `datos_de_uso` del texto del brief y pasarlo como variable separada al template
