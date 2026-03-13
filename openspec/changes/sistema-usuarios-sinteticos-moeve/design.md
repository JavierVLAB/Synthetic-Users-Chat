# Design: Sistema de usuarios sintéticos Moeve

## Context

Proyecto nuevo desde cero para investigación UX. No hay sistema previo que migrar.

El sistema permite a investigadores de UX conversar con usuarios sintéticos — IAs que actúan según perfiles psicológicos predefinidos — para evaluar productos digitales. La arquitectura debe soportar múltiples sesiones simultáneas, ser extensible sin tocar código (añadir perfiles/briefs = añadir archivos), y estar lista para exposición pública con seguridad básica sólida.

**Constraints clave:**
- Stack fijo: Next.js 16 (App Router) + TailwindCSS / Python 3.11+ + FastAPI
- Deploy: Docker + docker-compose
- Sin base de datos relacional (archivos + SQLite)
- Sin autenticación en esta fase
- Sistema de diseño: tokens extraídos de Figma (Moeve Sans, paleta `#004656` / `#90ffbb` / `#047dba`)

---

## Goals / Non-Goals

**Goals:**
- Monorepo funcional `/frontend` + `/backend` + `docker-compose.yml`
- Sesiones simultáneas aisladas por UUID
- Motor LLM intercambiable sin cambiar código (solo env vars)
- Perfiles y briefs extensibles añadiendo archivos
- Prompt template desacoplado de perfiles y briefs
- PDF descargable al cerrar sesión
- Endpoints de administración preparados (sin UI)
- Seguridad básica: CORS, rate limiting, secrets por env vars
- Tests mínimos del flujo principal

**Non-Goals:**
- Autenticación / login de usuarios
- Panel de administración visual
- Base de datos relacional
- Internacionalización
- Tests unitarios exhaustivos
- WebSockets (streaming de respuestas — fuera del prototipo)

---

## Decisions

### D0: Código legible como principio rector

**Decisión:** La legibilidad del código tiene prioridad sobre cualquier otra consideración (brevedad, cleverness, micro-optimizaciones). El código debe poder leerse como documentación — cualquier developer que abra un archivo debe entender qué hace, por qué existe y cómo encaja en el sistema.

**Esto implica:**
- **Nombres que se explican solos:** funciones, variables y componentes con nombres descriptivos aunque sean largos. `build_system_prompt(profile, brief)` en lugar de `mk_prompt(p, b)`.
- **Un archivo, una responsabilidad:** cada módulo hace una sola cosa. Si hay que explicar con un comentario "esto hace X y también Y", es señal de que hay que separarlo.
- **Docstrings en toda función pública** del backend (Python). JSDoc en funciones complejas del frontend.
- **Comentarios inline solo donde el código no se explica solo** — nunca para describir lo obvio, siempre para explicar el "por qué" de una decisión no evidente.
- **Sin magia:** sin meta-programación innecesaria, sin one-liners crípticos, sin abstracciones prematuras. Tres líneas claras son mejor que una línea inteligente.
- **Estructura predecible:** quien conozca FastAPI/React debe poder navegar el proyecto sin leer ningún README. Los directorios, nombres de archivos y estructura de carpetas siguen convenciones estándar del ecosistema.
- **Type hints obligatorios** en todo el código Python. TypeScript o JSDoc en el frontend.

**Referencia:** el estándar de calidad es un buen proyecto open source — el código es la documentación principal.

**Alternativa descartada:** priorizar concisión — código compacto que requiere contexto previo para entenderse no es mantenible ni invita a contribuciones.

---

### D1: Monorepo flat (sin Nx/Turborepo)

**Decisión:** `/frontend/` y `/backend/` como directorios hermanos en la raíz, sin herramienta de monorepo.

**Rationale:** El proyecto es un prototipo con dos servicios independientes (no hay código compartido entre frontend y backend). Una herramienta como Nx añadiría complejidad sin beneficio real en este contexto. Docker Compose orquesta los servicios.

**Alternativa descartada:** Nx — overhead innecesario para dos servicios sin librerías compartidas.

---

### D2: Estado de sesión en el frontend (no en servidor)

**Decisión:** El `session_id` (UUID) se genera en el frontend al iniciar sesión y se envía en cada request. El backend es stateless: recibe el `session_id` y lo usa para leer/escribir el historial de conversación en disco.

**Rationale:** Simplifica el backend (sin gestión de sesiones en memoria), soporta reinicio de servidor sin pérdida de contexto (el historial está en disco), y es suficiente para un prototipo sin autenticación.

**Alternativa descartada:** Sesiones en memoria del servidor — se perderían al reiniciar y no escalan horizontalmente.

---

### D3: Almacenamiento de conversaciones en SQLite

**Decisión:** SQLite (via `aiosqlite` + `databases`) para almacenar conversaciones. Perfiles y briefs como archivos YAML/JSON en disco.

**Rationale:** SQLite ofrece queries simples para recuperar historial por `session_id`, evita corrupción de archivos con escrituras concurrentes, y no requiere infraestructura adicional. Los perfiles y briefs permanecen en archivos porque son datos de configuración que los investigadores editarán directamente.

**Esquema SQLite:**
```sql
sessions (
  session_id TEXT PRIMARY KEY,
  profile_id TEXT,
  brief_id TEXT,
  llm_provider TEXT,
  created_at DATETIME,
  closed_at DATETIME
)

messages (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  session_id TEXT,
  role TEXT,         -- 'user' | 'assistant'
  content TEXT,
  timestamp DATETIME,
  FOREIGN KEY (session_id) REFERENCES sessions(session_id)
)
```

**Alternativa descartada:** Archivos JSON por sesión — race conditions en escrituras concurrentes.

---

### D4: Abstracción LLM con Strategy Pattern

**Decisión:** Clase base `LLMProvider` con implementaciones `OpenAIProvider`, `AnthropicProvider`, `OllamaProvider`. El motor selecciona el provider según `LLM_PROVIDER` env var o parámetro de sesión.

**Rationale:** Permite añadir nuevos LLMs sin modificar la lógica de conversación. El código de conversación solo conoce la interfaz `LLMProvider.chat(messages) -> str`.

```python
class LLMProvider(ABC):
    async def chat(self, messages: list[dict], system_prompt: str) -> str: ...

class OpenAIProvider(LLMProvider): ...
class AnthropicProvider(LLMProvider): ...
class OllamaProvider(LLMProvider): ...
```

**Alternativa descartada:** Switch/if-else en el servicio de conversación — difícil de extender y testear.

---

### D5: Prompt template con interpolación simple

**Decisión:** Archivo `backend/prompts/system_prompt_template.txt` con variables `{perfil_empleado}`, `{perfil_comportamiento}`, `{brief_producto}`. Interpolación con `str.format_map()` en tiempo de ejecución.

**Rationale:** Los investigadores/investigadoras pueden editar el prompt sin tocar código Python. La separación es total: perfiles y briefs no saben del prompt, el prompt no sabe de la estructura interna de los perfiles.

**Alternativa descartada:** Jinja2 — añade dependencia para un caso de uso que no requiere lógica de plantilla, solo interpolación de variables.

---

### D6: Generación de PDF con WeasyPrint

**Decisión:** WeasyPrint para generar el PDF de sesión desde una plantilla HTML+CSS.

**Rationale:** WeasyPrint genera PDFs de alta calidad desde HTML/CSS, lo que permite usar el mismo sistema de diseño Moeve (tipografía, colores) en el PDF. La plantilla HTML es mantenible por cualquier developer.

**Alternativa descartada:** ReportLab — API de bajo nivel, más código para resultados comparables. Alternativa descartada: html2pdf.js en frontend — requiere abrir la conversación en el browser antes de cerrar sesión, peor UX.

---

### D7: Rate limiting con slowapi

**Decisión:** `slowapi` (wrapper de `limits` para FastAPI) con límites en los endpoints de conversación: 30 req/min por IP en `/chat`, 10 req/min en `/sessions`.

**Rationale:** Protección básica contra uso abusivo sin infraestructura adicional (no requiere Redis). Suficiente para un prototipo expuesto públicamente.

**Alternativa descartada:** Rate limiting en Nginx/proxy — añade capa de infraestructura no necesaria en esta fase.

---

### D8: Sistema de diseño Figma → TailwindCSS

**Decisión:** Tokens de Figma mapeados como variables CSS custom y extendidos en `tailwind.config.js`. Fuente corporativa Moeve Sans declarada con `@font-face` en el CSS global.

**Tokens de color extraídos de Figma:**
```js
// tailwind.config.js
colors: {
  'brand-dark':     '#004656',  // sidebar, texto primario
  'brand-navy':     '#1b3a5a',  // títulos, header avatar bg
  'brand-blue':     '#047dba',  // links, accent, info
  'brand-blue-lt':  '#0478b2',  // info text
  'brand-mint':     '#90ffbb',  // primary button bg
  'app-bg':         '#f9fafe',  // fondo general
  'conv-bg':        '#f5f7fd',  // área de conversación
  'input-bg':       '#f2f6f7',  // input bar
  'bubble-user':    '#e9f4fb',  // burbuja usuario (hover select)
  'bubble-assist':  'rgba(4,125,186,0.10)', // burbuja asistente
  'alert-error':    '#fff3f0',
  'alert-success':  '#f6ffed',
  'alert-info':     '#f0f5ff',
  'error':          '#d52b1e',
  'success':        '#24a148',
  'text-primary':   '#004656',
  'text-secondary': '#3a5d78',
  'text-muted':     '#5a7d91',
  'text-caption':   '#6c6f70',
  'text-disabled':  '#8c8c8c',
  'border':         '#e7eaef',
  'border-active':  '#1890ff',
  'split':          '#9bcbe3',  // colorSplit Figma — bordes generales (header, footer, accordion, inputs)
}
```

**Escala tipográfica (Moeve Sans):**
```js
fontSize: {
  'xs':   ['12px', { lineHeight: '20px', fontWeight: '300' }],
  'xs-r': ['12px', { lineHeight: '18.86px', fontWeight: '400' }],
  'sm':   ['14px', { lineHeight: '22px', fontWeight: '300' }],
  'sm-b': ['14px', { lineHeight: '22px', fontWeight: '700' }],
  'base': ['16px', { lineHeight: '24px', fontWeight: '300' }],
  'base-r': ['16px', { lineHeight: '24px', fontWeight: '400' }],
  'base-b': ['16px', { lineHeight: '26px', fontWeight: '700' }],
  'lg':   ['20px', { lineHeight: '28px', fontWeight: '700' }],
  'xl':   ['24px', { lineHeight: '32px', fontWeight: '300' }],
  '2xl':  ['34px', { lineHeight: '42px', fontWeight: '700' }],
}
```

> **Importante:** Moeve Sans solo existe en tres pesos: Light (300), Regular (400) y Bold (700). El peso Medium (500) no existe — usar `font-medium` en Tailwind aplicará el peso más cercano del navegador. Usar siempre `font-light`, `font-normal` o `font-bold`.

**Implementación en Tailwind v4:** Los tokens se definen en `frontend/app/globals.css` con la sintaxis `@theme inline { ... }` (no en `tailwind.config.js`).

---

## Arquitectura de directorios

```
/
├── frontend/
│   ├── app/
│   │   ├── layout.tsx             # Root layout: fuentes, metadata global
│   │   └── page.tsx               # Única página: renderiza MainView
│   ├── components/
│   │   ├── layout/                # Header, Footer
│   │   ├── chat/                  # ChatArea, MessageBubble, InputBar, AnswerActions
│   │   ├── session/               # SessionAccordion, ProfileSelect, BriefSelect
│   │   ├── questionnaire/         # QuestionnaireUpload
│   │   └── ui/                    # Button, Alert, Select, Collapse (primitivos)
│   ├── hooks/                     # useSession, useChat, usePDF
│   ├── services/                  # api.ts (axios client)
│   ├── context/                   # SessionContext, ChatContext
│   ├── public/fonts/              # MoeveSans-Regular/Light/Bold.otf
│   ├── tailwind.config.ts
│   └── next.config.ts
│
├── backend/
│   ├── app/
│   │   ├── routers/               # sessions, chat, profiles, briefs, pdf
│   │   ├── services/              # conversation, llm, pdf, profile, brief
│   │   ├── models/                # Pydantic schemas
│   │   ├── providers/             # OpenAIProvider, AnthropicProvider, OllamaProvider
│   │   └── db/                    # SQLite setup, queries
│   ├── data/
│   │   ├── profiles/
│   │   │   ├── empleado.yaml      # Perfil fijo de empleado
│   │   │   ├── explorador.yaml    # Ejemplo perfil de comportamiento
│   │   │   └── conservador.yaml   # Ejemplo perfil de comportamiento
│   │   └── briefs/
│   │       └── app-movil.yaml     # Ejemplo brief de producto
│   ├── prompts/
│   │   └── system_prompt_template.txt
│   └── main.py
│
├── docker-compose.yml
├── BRIEF.md
└── README.md
```

---

## Estructura de la UI (layout)

La aplicación es de pantalla única, sin navegación lateral. El layout es una columna centrada con header fijo, cuerpo con el acordeón de configuración + área de chat, y footer fijo.

```
┌─────────────────────────────────────────────────────────┐
│  [Logo Moeve]                          [nombre usuario] │  ← Header fijo, fondo #ffffff
├─────────────────────────────────────────────────────────┤
│  ▼ Nueva sesión                    [Cerrar sesión]      │  ← Accordion colapsable
│     Perfil de comportamiento  [Selecciona perfil    ▾]  │    Visible siempre (colapsado
│     Brief de producto         [Selecciona brief     ▾]  │    muestra resumen activo)
│                                        [Iniciar →]      │
├─────────────────────────────────────────────────────────┤
│                                                         │
│                  ÁREA DE CONVERSACIÓN                   │  ← Fondo #f5f7fd, scroll
│     [mensajes asistente - markdown, izquierda]          │    independiente
│                    [mensajes usuario - burbuja, dcha]   │
│                                                         │
├─────────────────────────────────────────────────────────┤
│  [+]  [Escribe tu mensaje...                ]  [→]      │  ← Input bar, fondo #f2f6f7
│  "Estás hablando con una IA sintética..."               │  ← Disclaimer, 12px #5a7d91
├─────────────────────────────────────────────────────────┤
│         Sistema de usuarios sintéticos © Moeve 2026     │  ← Footer fijo
└─────────────────────────────────────────────────────────┘
```

**Comportamiento del accordion:**
- **Sin sesión activa:** expandido, muestra los dos selectores (perfil + brief) y el botón "Iniciar". El botón está deshabilitado hasta que ambos estén seleccionados.
- **Con sesión activa:** colapsado por defecto, muestra en el header del accordion el resumen: "Perfil: [nombre] · Brief: [nombre] · LLM: [proveedor]". El investigador puede expandirlo para ver el detalle pero no puede cambiar la selección mid-sesión.
- **Botón "Cerrar sesión":** visible en el header del accordion durante sesión activa, abre el modal de cierre/descarga PDF.

**Sin sidebar de navegación.** No hay secciones adicionales en este prototipo. Si el producto escala, el sidebar se añade como mejora posterior sin romper este layout.

---

## API Endpoints

```
POST   /sessions                    # Crear sesión → {session_id}
GET    /sessions/{id}               # Estado de sesión
DELETE /sessions/{id}               # Cerrar sesión

POST   /sessions/{id}/chat          # Enviar mensaje → {response}
POST   /sessions/{id}/questionnaire # Subir cuestionario → {response}

GET    /profiles                    # Listar perfiles de comportamiento
GET    /profiles/{id}               # Detalle de perfil
POST   /profiles                    # [Admin] Crear perfil
PUT    /profiles/{id}               # [Admin] Actualizar perfil
DELETE /profiles/{id}               # [Admin] Eliminar perfil

GET    /briefs                      # Listar briefs
GET    /briefs/{id}                 # Detalle de brief
POST   /briefs                      # [Admin] Crear brief
PUT    /briefs/{id}                 # [Admin] Actualizar brief
DELETE /briefs/{id}                 # [Admin] Eliminar brief

GET    /sessions/{id}/pdf           # Descargar PDF de sesión
GET    /health                      # Health check
```

---

## Risks / Trade-offs

**[Risk] WeasyPrint tiene dependencias de sistema (Cairo, Pango)**
→ Mitigación: imagen Docker con dependencias pre-instaladas (`apt-get install -y libcairo2 libpango...`). Documentado en Dockerfile.

**[Risk] Contexto LLM puede crecer sin límite en sesiones largas**
→ Mitigación: ventana deslizante — se mantienen los últimos N mensajes más el system prompt. N configurable por env var (`MAX_CONTEXT_MESSAGES`, default: 20).

**[Risk] Sin autenticación, los endpoints admin (`POST /profiles`, etc.) quedan expuestos**
→ Mitigación: los endpoints admin requieren `ADMIN_TOKEN` en header `X-Admin-Token` (secret por env var). No es auth completa pero evita uso accidental/malicioso en esta fase.

**[Risk] SQLite no escala con muchas escrituras concurrentes**
→ Mitigación: aceptable para el prototipo (uso previsto: pocos investigadores simultáneos). Migración a PostgreSQL preparada (SQLAlchemy como ORM abstracto).

**[Risk] Streaming de respuestas no implementado**
→ Trade-off aceptado: el spinner "Generando respuesta..." cubre el tiempo de espera. Streaming se puede añadir en fase 2 sin cambiar la arquitectura (SSE o WebSocket).

---

## Migration Plan

Proyecto nuevo — no hay migración. Pasos de despliegue inicial:

1. Copiar `.env.example` → `.env` y rellenar API keys
2. Añadir fuentes `MoeveSans-*.otf` en `/frontend/src/assets/fonts/`
3. `docker-compose up --build`
4. Verificar `GET /health` responde `200`
5. Acceder a `http://localhost:3000`

---

## Open Questions

- **OQ1:** ~~Resuelto~~ — Los perfiles describen patrones de comportamiento y características de puesto de trabajo. NO incluyen datos personales (nombre, edad, género). Los archivos de perfil se proporcionarán durante la implementación.
- **OQ2:** ~~Resuelto~~ — El brief es para una app de chatbot de IA para ingeniería. El cliente proporcionará el contenido del brief; se creará un archivo placeholder hasta recibirlo.
- **OQ3:** ~~Resuelto~~ — El PDF incluye: perfil de comportamiento (nombre + contenido), brief del producto (nombre + contenido), y conversación completa con mensajes identificados como "Investigador" o "Usuario sintético" con timestamp. No incluye metadatos técnicos (LLM, session_id).
- **OQ4:** ~~Resuelto~~ — El disclaimer es texto fijo en el código: "Estás hablando con una IA sintética. Sus respuestas no representan opiniones reales."
