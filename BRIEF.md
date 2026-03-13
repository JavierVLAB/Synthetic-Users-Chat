# Brief: Sistema de Usuarios Sintéticos
**Proyecto:** 202603-Moeve-Synthetic-Users-Chat  
**Cliente:** Moeve  
**Fecha:** Marzo 2026  
**Tipo:** Prototipo funcional

---

## Concepto

Herramienta web para investigación de UX que permite generar usuarios sintéticos basados en perfiles psicológicos e interactuar con ellos mediante conversación. El usuario sintético es una IA que actúa según un perfil predefinido, permitiendo evaluar cómo percibe un producto digital determinado.

---

## Flujo principal de uso

1. El investigador selecciona un **perfil de comportamiento de consumidor** (de una lista) combinado con un **perfil psicológico de empresa** (fijo, dado por la empresa)
2. Selecciona el **brief del producto digital** a evaluar
3. Consulta (opcionalmente) un **panel colapsable** con resumen de la sesión: perfil activo, brief seleccionado, LLM configurado
4. Inicia la conversación con el usuario sintético en modo **chat libre**
5. En cualquier momento puede **subir un cuestionario** (lista de preguntas) y el usuario sintético las responde todas de una vez, tras lo cual se puede continuar con chat libre
6. Al finalizar, **cierra la sesión** y puede optar por **descargar un PDF** con el resumen del perfil, el brief y la conversación completa

---

## Funcionalidades

### Frontend (React)
- Selección de perfil de comportamiento de consumidor (lista desplegable)
- El perfil psicológico de empresa viene incorporado al perfil seleccionado
- Selección de brief del producto digital
- Panel colapsable (accordion) con resumen de sesión: perfil + brief + LLM activo
- Interfaz conversacional estilo chat:
  - Mensajes del usuario alineados a la derecha (burbuja azul claro)
  - Mensajes del usuario sintético a la izquierda con soporte markdown (títulos, negrita, listas, enlaces)
  - Timestamp en cada mensaje
  - Estado "Generando respuesta..." con spinner
  - Acciones por mensaje del asistente: 👍 👎 | regenerar, copiar, descargar
  - Input bar inferior con botón `+` para subir cuestionario y botón enviar
- Navegación lateral izquierda con secciones: Producto, Investigación, Usuario sintético, Resultados, Iniciar investigación, Configuración
- Header con logo Moeve + nombre de usuario
- Footer del chat con disclaimer: "Estás hablando con una IA sintética..."
- Modal de cierre de sesión con opción de descarga de PDF (no automático)

### Backend (Python + FastAPI)
- Perfiles psicológicos almacenados en archivos (JSON/YAML), extensibles sin cambiar código
- Briefs de productos almacenados en archivos, extensibles sin cambiar código
- **Endpoints preparados para futura UI de configuración** (aunque no existe aún la UI)
- Motor conversacional multi-LLM configurable:
  - OpenAI (GPT-4) — por defecto
  - Anthropic (Claude)
  - Ollama (local)
  - Configurable por variable de entorno o parámetro de sesión
- **Session ID único por conversación** para aislar sesiones simultáneas
- Almacenamiento de conversaciones completas
- Procesamiento de cuestionarios: recibe lista de preguntas y las envía al LLM para respuesta conjunta
- Generación de PDF de sesión: perfil + brief + conversación completa

### Infraestructura
- Docker (docker-compose con frontend + backend + volúmenes)
- Exposición pública → seguridad básica pero sólida: CORS configurado, rate limiting, variables de entorno para secrets, sin credenciales en código
- Tests mínimos pero suficientes: los críticos para evitar regresiones en flujo principal

---

## Consideraciones técnicas

### Stack
- **Frontend:** React + Vite + TailwindCSS
- **Backend:** Python 3.11+ + FastAPI + Uvicorn
- **Generación PDF:** WeasyPrint o ReportLab (backend)
- **Almacenamiento:** Sistema de archivos local (SQLite opcional para conversaciones)
- **Deploy:** Docker + docker-compose

### Sesiones simultáneas
Múltiples usuarios pueden usar la app al mismo tiempo. Cada conversación tiene un `session_id` único (UUID) generado al iniciar. Todas las operaciones de conversación usan ese ID para aislar contextos.

### Sistema de perfiles (dos capas que se combinan)

El usuario sintético se construye combinando **siempre** dos perfiles:

**1. Perfil de empleado (fijo, siempre presente)**
Define las características psicológicas base del tipo de empleado de la empresa cliente. No se selecciona en la interfaz, viene incorporado al sistema. Es un único archivo en el backend.

**2. Perfil de comportamiento (seleccionable en la interfaz)**
Define el patrón de comportamiento como consumidor. El investigador lo escoge de una lista. Pueden existir tantos como se quiera añadiendo archivos, sin tocar código.

Los perfiles son **solo datos**: describen quién es ese perfil, sus características, contexto, etc. **No contienen prompts ni instrucciones al LLM.** Su estructura de campos es flexible — los ejemplos son ilustrativos, no un esquema obligatorio. El sistema lee el contenido completo del archivo y lo pasa al prompt como contexto.

### Estructura de briefs

Los briefs de producto son igualmente **solo datos**: describen el producto a evaluar. Su estructura de campos es flexible y puede variar entre briefs. El sistema no depende de campos concretos: lee el contenido completo y lo pasa al prompt como contexto. Se pueden añadir nuevos briefs añadiendo archivos, sin tocar código.

### Sistema de prompts (desacoplado)

**Los prompts están completamente separados de los perfiles y briefs.**

Existe una plantilla de prompt configurable (archivo independiente en el backend) que define cómo se instruye al LLM para que actúe como usuario sintético. Esta plantilla recibe el contenido de los perfiles y el brief como variables en tiempo de ejecución:

```
system_prompt_template.txt  <- aquí vive la instrucción al LLM
        recibe:
  {perfil_empleado}         <- contenido completo del perfil de empleado
  {perfil_comportamiento}   <- contenido completo del perfil seleccionado
  {brief_producto}          <- contenido completo del brief seleccionado
```

Si se quiere cambiar cómo se comporta el usuario sintético, se edita la plantilla del prompt. Si se quiere cambiar los datos de un perfil o brief, se edita ese archivo. Ninguno de los dos conoce al otro.


---

## Diseño visual

### Referencias
- Archivo Figma disponible vía MCP de Figma (conectado al proyecto)
- PDFs de referencia: componentes base + interfaz conversacional

### Sistema de diseño (extraído de Figma)
- **Logo:** Moeve (header superior izquierdo)
- **Sidebar:** fondo oscuro `#1a1a2e` aprox, navegación izquierda
- **Botón primary:** fondo verde/teal `#00D4AA` aprox con ícono
- **Fondo general:** gris muy claro `#F5F7FA`
- **Burbujas usuario:** `#E8F0FE` azul claro, alineadas a la derecha
- **Mensajes asistente:** ancho completo, fondo blanco/transparente, markdown renderizado
- **Tipografía:** Sans-serif, 5 niveles de jerarquía definidos en Figma
- **Alerts:** rojo (error), verde (éxito), azul (info)
- **Componentes:** inputs, selects, toggles, file upload, accordion, radio buttons, checkboxes — todos definidos en Figma
- **Footer:** "Sistema de usuarios sintéticos © Moeve 2026"

> **IMPORTANTE:** Conectar al archivo Figma vía MCP para extraer tokens exactos de color, tipografía y espaciado antes de implementar el CSS.

---

## Roadmap futuro (fuera del prototipo, pero a tener en cuenta)

- Panel de administración UI para gestionar perfiles y briefs desde el navegador
- Los endpoints de backend para esto deben existir desde el inicio aunque la UI no esté
- Sistema de autenticación de usuarios
- Historial de sesiones pasadas

---

## Lo que NO incluye el prototipo

- Autenticación/login de usuarios
- Panel de administración visual
- Tests unitarios exhaustivos (solo los críticos del flujo principal)
- Base de datos relacional (archivos + SQLite es suficiente)
- Internacionalización

---

## Assets y recursos de marca

### Logo
- Obtener directamente del archivo Figma vía MCP (exportar como SVG)
- Usar en header y en el PDF generado

### Tipografía
- Fuente corporativa Moeve, suministrada como archivos `.otf`:
  - `MoeveSans-Regular.otf`
  - `MoeveSans-Light.otf`
  - `MoeveSans-Bold.otf`
- Se almacenan en `/frontend/src/assets/fonts/`
- Se declaran con `@font-face` en el CSS global
- Fallback: `sans-serif`

### Iconos
- Extraer del archivo Figma vía MCP

---

## Estándares de código

### Principios generales
- Código **legible, mantenible y escalable** ante todo
- Preferir claridad sobre cleverness: si algo puede escribirse de forma simple, se escribe simple
- Cada módulo/componente hace una sola cosa bien (principio de responsabilidad única)
- Sin código muerto, sin console.log olvidados, sin TODOs sin ticket

### Frontend (React)
- **Estilo:** consistente, basado en las convenciones de React moderno (hooks, functional components)
- **Linter:** ESLint con reglas estándar de React + Prettier para formateo automático
- **Nomenclatura:** PascalCase para componentes, camelCase para funciones y variables, UPPER_SNAKE_CASE para constantes
- **Estructura de componentes:** un componente por archivo, separar lógica de presentación cuando tenga sentido
- **Comentarios:** JSDoc en funciones complejas, comentarios inline solo cuando el código no se explica solo

### Backend (Python)
- **Estilo:** PEP8, formateado con **Black** + **isort** para imports
- **Nomenclatura:** snake_case para funciones y variables, PascalCase para clases
- **Estructura:** separación clara entre routers, servicios y modelos — sin lógica de negocio en los endpoints
- **Comentarios:** docstrings en todas las funciones públicas, comentarios inline solo cuando sea necesario
- **Type hints:** obligatorios en todas las funciones

### Documentación mínima requerida
- `README.md` en raíz con: descripción, requisitos, cómo levantar en local y con Docker
- `README.md` en `/frontend` y `/backend` con estructura del proyecto y decisiones relevantes
- Cada archivo de perfil y brief con comentarios explicando su estructura
- Variables de entorno documentadas en `.env.example`

---

## Instrucciones para Claude Code

Usa este brief junto con OpenSpec para crear el proyecto:

```
/opsx:propose "Sistema de usuarios sintéticos para investigación UX - ver BRIEF.md para contexto completo"
```

Antes de generar los specs, lee este archivo completo y el archivo Figma via MCP para extraer los tokens de diseño exactos. Estructura el proyecto como monorepo con `/frontend` y `/backend` en la raíz, más `docker-compose.yml` y `.open-spec/` para los specs.
