# Frontend — Sistema de usuarios sintéticos Moeve

Aplicación Next.js 16 que proporciona la interfaz web del sistema de investigación UX.
El investigador selecciona un perfil y un brief, conversa con el usuario sintético,
sube cuestionarios y descarga el informe PDF final.

## Estructura del proyecto

```
frontend/
├── app/
│   ├── globals.css           # Tokens de diseño Figma + @font-face Moeve Sans
│   ├── layout.tsx            # Layout raíz (fuente, metadata)
│   └── page.tsx              # Única página de la aplicación
├── components/
│   ├── ui/                   # Componentes primitivos reutilizables
│   │   ├── Button.tsx
│   │   ├── Select.tsx
│   │   ├── Alert.tsx
│   │   └── Collapse.tsx
│   ├── Header.tsx            # Header fijo con logo Moeve
│   ├── Footer.tsx            # Footer fijo con texto de copyright
│   ├── SessionAccordion.tsx  # Accordion configuración / sesión activa
│   ├── ProfileSelect.tsx     # Dropdown de perfiles de comportamiento
│   ├── BriefSelect.tsx       # Dropdown de briefs de producto
│   ├── ChatArea.tsx          # Contenedor scrollable de mensajes
│   ├── MessageBubble.tsx     # Mensaje del investigador (derecha)
│   ├── AssistantMessage.tsx  # Mensaje del usuario sintético (izquierda)
│   ├── AnimatedLoader.tsx    # Spinner "Generando respuesta..."
│   ├── AnswerActions.tsx     # Acciones en hover sobre mensaje asistente
│   ├── InputBar.tsx          # Textarea de entrada + botón cuestionario
│   ├── QuestionnaireUpload.tsx  # Modal de subida de cuestionario .txt
│   └── CloseSessionModal.tsx    # Modal de cierre con descarga PDF
├── context/
│   └── SessionContext.tsx    # Estado global de sesión (Context API)
├── hooks/
│   └── useSession.ts         # Hook para interactuar con SessionContext
├── services/
│   └── api.ts                # Cliente axios + funciones de acceso a la API
├── public/
│   └── fonts/                # Moeve Sans Regular, Light, Bold (.otf)
├── .prettierrc
├── eslint.config.mjs
├── next.config.ts
└── tsconfig.json
```

## Decisiones técnicas

**¿Por qué Next.js 16 y no 15?**
Next.js 15 tiene un CVE conocido (CVE-2025-29927) que permite saltarse middleware
de autenticación con una cabecera `x-middleware-subrequest`. Usamos 16.1.6 para
evitar el riesgo.

**¿Por qué una sola página (sin sidebar)?**
El flujo del investigador es lineal: configurar → conversar → cerrar. Un accordion
que alterna entre "configuración" y "sesión activa" refleja ese flujo sin navigation
overhead. No hay más secciones.

**¿Por qué Tailwind v4?**
Next.js 16 lo instala por defecto. En v4 los tokens se declaran en `@theme` dentro
del CSS global, sin `tailwind.config.ts`. Esto simplifica la configuración.

**¿Por qué axios y no fetch?**
axios proporciona timeout configurable por instancia, interceptores y serialización
automática, con menos boilerplate que `fetch` con AbortController.

**¿Por qué react-markdown?**
Las respuestas del LLM vienen en markdown. `react-markdown` renderiza listas,
negritas y párrafos de forma segura sin `dangerouslySetInnerHTML`.

## Variables de entorno

| Variable | Descripción | Ejemplo |
|---|---|---|
| `NEXT_PUBLIC_API_URL` | URL del backend FastAPI | `http://localhost:8000` |

En desarrollo local, crea `.env.local` en este directorio:

```bash
echo "NEXT_PUBLIC_API_URL=http://localhost:8000" > .env.local
```

## Arranque en desarrollo

```bash
# Desde el directorio frontend/
npm install
npm run dev
# Disponible en http://localhost:3000
```

## Lint y formato

```bash
npm run lint           # ESLint
npx prettier --check . # Verificar formato
npx prettier --write . # Aplicar formato
```
