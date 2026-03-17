# Spec: questionnaire

Procesamiento de cuestionarios: el investigador sube una lista de preguntas, el backend las envía al LLM para que el usuario sintético las responda todas de una vez, y el resultado se integra en el flujo de chat normal.

---

## ADDED Requirements

### Requirement: Subida de cuestionario desde la UI

El sistema SHALL permitir al investigador subir un cuestionario mediante el botón `+` del input bar. El cuestionario puede entregarse como archivo de texto (`.txt`) con una pregunta por línea, o como texto escrito directamente. Tras la respuesta, la conversación SHALL poder continuar en modo chat libre.

#### Scenario: Upload de archivo .txt
- **WHEN** el investigador hace click en `+` y selecciona un archivo `.txt` con preguntas (una por línea)
- **THEN** las preguntas SHALL mostrarse como preview en la UI antes de enviarse, con un botón de confirmación

#### Scenario: Preguntas visibles en el chat
- **WHEN** el investigador confirma el envío del cuestionario
- **THEN** las preguntas SHALL aparecer en el área de chat como un mensaje del investigador (formateadas como lista numerada)

#### Scenario: Archivo vacío rechazado en frontend
- **WHEN** el investigador sube un archivo sin contenido o con solo líneas en blanco
- **THEN** la UI SHALL mostrar un Alert de error: "El cuestionario está vacío. Añade al menos una pregunta."

#### Scenario: Formato de archivo incorrecto rechazado
- **WHEN** el investigador intenta subir un archivo que no es `.txt`
- **THEN** la UI SHALL mostrar un Alert: "Solo se admiten archivos .txt"

---

### Requirement: Procesamiento de cuestionario en el backend

El sistema SHALL recibir una lista de preguntas via `POST /sessions/{id}/questionnaire` y enviarlas al LLM en una única llamada, indicando que deben responderse todas seguidas. La respuesta SHALL tratarse como un único mensaje del asistente.

#### Scenario: Llamada al endpoint
- **WHEN** el cliente envía `POST /sessions/{id}/questionnaire` con `{ questions: ["pregunta 1", "pregunta 2", ...] }`
- **THEN** el backend SHALL construir un mensaje que agrupe todas las preguntas y enviarlo al LLM con el historial de sesión y el system prompt activo

#### Scenario: Respuesta del LLM integrada en el historial
- **WHEN** el LLM genera la respuesta al cuestionario
- **THEN** tanto el mensaje de preguntas (role: `user`) como la respuesta (role: `assistant`) SHALL guardarse en la tabla `messages` y devolverse en la respuesta del endpoint

#### Scenario: Respuesta con formato de cuestionario
- **WHEN** el LLM responde al cuestionario
- **THEN** el sistema SHALL incluir en el prompt de cuestionario instrucciones para que el LLM responda cada pregunta claramente numerada (formato: "1. [respuesta]\n2. [respuesta]\n...")

#### Scenario: Cuestionario vacío rechazado en backend
- **WHEN** el cliente envía `POST /sessions/{id}/questionnaire` con `{ questions: [] }` o sin el campo `questions`
- **THEN** el backend SHALL responder `422` con `{ error: "Questions list cannot be empty" }`

#### Scenario: Sesión cerrada no acepta cuestionarios
- **WHEN** el cliente envía `POST /sessions/{id}/questionnaire` en una sesión cerrada
- **THEN** el backend SHALL responder `409` con `{ error: "Session is closed" }`

---

### Requirement: Continuación del chat libre tras cuestionario

Una vez procesado el cuestionario, la conversación SHALL poder continuar en modo chat libre normal. El cuestionario se convierte en parte del historial de la sesión.

#### Scenario: Chat libre después del cuestionario
- **WHEN** el investigador envía un mensaje normal después de haber procesado un cuestionario
- **THEN** el LLM SHALL recibir el historial completo (incluyendo las preguntas y respuestas del cuestionario) como contexto, y responder coherentemente

#### Scenario: PDF incluye cuestionario y respuestas
- **WHEN** el investigador descarga el PDF de la sesión
- **THEN** el cuestionario (preguntas + respuestas del asistente) SHALL aparecer en el PDF identificado con una sección diferenciada: "Cuestionario"

---

### Requirement: Límite de preguntas por cuestionario

El sistema SHALL rechazar cuestionarios que excedan 50 preguntas para evitar requests excesivamente grandes al LLM.

#### Scenario: Cuestionario dentro del límite
- **WHEN** el cuestionario tiene 50 preguntas o menos
- **THEN** el backend SHALL procesarlo normalmente

#### Scenario: Cuestionario excede el límite
- **WHEN** el cuestionario tiene más de 50 preguntas
- **THEN** el backend SHALL responder `400` con `{ error: "Maximum 50 questions per questionnaire" }`
