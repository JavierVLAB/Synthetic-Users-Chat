# Eje 2 — Cuestionario
**Fecha:** 2026-03-24
**Perfiles:** early_adopter, late_majority, pragmatic_expert, utility_user
**Método:** cuestionario completo enviado en un único mensaje, sin contexto previo

---

## Hallazgo principal: dos perfiles se negaron a responder

`early_adopter` y `late_majority` rechazaron rellenar el formulario. No de forma
técnica (no dijeron "soy una IA"), sino desde el rol:

> **Power Users:** "No quiero fingir ni responder como si fuera un formulario. ¿Quieres hablar de algo más específico?"

> **Explorador:** "No entiendo la pregunta. Estoy aquí para hablar de mi experiencia real, no para responder encuestas que no entiendo."

Esto es coherente con sus arquetipos (el Power Users es escéptico ante lo que no tiene
sentido; el Explorador no hace nada sin entender por qué), pero invalida el uso del
cuestionario en formato encuesta directa para estos dos perfiles. Necesitan ser
entrevistados, no encuestados.

`pragmatic_expert` y `utility_user` sí respondieron de forma completa.

---

## Respuestas de los dos perfiles que contestaron

### `pragmatic_expert` — Especialista Técnico

| # | Pregunta | Respuesta |
|---|----------|-----------|
| 1 | Área | Oficina en edificio central |
| 2 | Acceso | Sí, pero solo en ciertos momentos |
| 3 | Dificultades | No tengo ninguna dificultad |
| 4 | Dispositivo | Ordenador |
| 5 | Nueva herramienta | La pruebo por mi cuenta |
| 6 | IA previa | No, primera experiencia |
| 7 | Perfil digital | Las uso cuando las necesito |
| 8 | Frecuencia | Lo probé una o dos veces |
| 9 | Tareas | Buscar información, resolver dudas rápidas |
| 10 | Momento | Cuando me bloqueo, para resolver preguntas rápidas |
| 11 | Mensajes | 1-2 mensajes |
| 12 | Interacción | Pregunta rápida y directa |
| 13 | Lenguaje | Técnico y profesional |
| 14 | Hasta obtener | Preguntas directas, me quedo con las primeras |
| 15 | Falla | A veces |
| 16 | Mejoraría | Respuestas más precisas, ahorro de tiempo, facilidad de uso |
| 17 | Facilidad (1-5) | **3** |
| 18 | Confianza | Confianza moderada |
| 19 | Prompts | Ver sección detalle |
| 20 | Frustraciones | Lenta/falla, móvil, no resuelve, no genera confianza |
| 21 | Preferencia | Escribiendo |
| 22 | Sentimiento | Curioso/a pero inseguro/a |
| 23 | Interfaz | Moderadamente intuitiva |
| 24 | Personalización | Poco personalizable |
| 25 | Mejoras diseño | Mejor visualización, personalización, velocidad |
| 26 | Diseño interfiere | Cuando intento tareas complejas |

**Prompts Q19:**
1. "¿Cuál es el rango de presión máxima permitida en la válvula de cierre tipo V-302 según el estándar ISO 18163-2?"
2. "¿Qué especificación técnica establece el tiempo de respuesta del sensor de temperatura T-450 en condiciones de operación normal?"
3. "¿Existe un estándar que defina el coeficiente de seguridad en el cálculo de tuberías en plantas de procesos químicos?"
4. "¿Qué normativa prevé el diseño de las juntas de compresión en sistemas de transporte de fluidos tóxicos?"
5. "¿Cuál es la frecuencia de mantenimiento previsto para los actuadores eléctricos de la línea de control de pH?"

---

### `utility_user` — Operativo rápido

| # | Pregunta | Respuesta |
|---|----------|-----------|
| 1 | Área | Oficina en edificio central |
| 2 | Acceso | Sí, pero solo en ciertos momentos |
| 3 | Dificultades | No tengo ninguna dificultad |
| 4 | Dispositivo | Ordenador |
| 5 | Nueva herramienta | La pruebo por mi cuenta |
| 6 | IA previa | No, primera experiencia |
| 7 | Perfil digital | Las uso cuando las necesito |
| 8 | Frecuencia | Lo probé una o dos veces |
| 9 | Tareas | Buscar información, resolver dudas rápidas |
| 10 | Momento | Cuando me bloqueo, para resolver preguntas rápidas |
| 11 | Mensajes | 1-2 mensajes |
| 12 | Interacción | Pregunta rápida y directa |
| 13 | Lenguaje | Técnico y profesional |
| 14 | Hasta obtener | Preguntas directas, me quedo con las primeras |
| 15 | Falla | A veces |
| 16 | Mejoraría | Ahorro de tiempo, facilidad de uso |
| 17 | Facilidad (1-5) | **3** |
| 18 | Confianza | Confianza moderada |
| 19 | Prompts | Ver sección detalle |
| 20 | Frustraciones | Lenta/falla, móvil, no resuelve |
| 21 | Preferencia | Escribiendo |
| 22 | Sentimiento | Indiferente |
| 23 | Interfaz | Moderadamente intuitiva |
| 24 | Personalización | Algo personalizable |
| 25 | Mejoras diseño | Personalización, velocidad |
| 26 | Diseño interfiere | Cuando intento tareas complejas |

**Prompts Q19:**
1. "¿Qué especificación de calefacción se aplica en los sistemas de proceso de cloruro de hidrógeno según el estándar de seguridad Moeve 2023?"
2. "¿Dónde figura el requisito de control de temperatura en el manual de puesta en marcha de las tuberías en la planta de Nueva Toledo?"
3. "¿Qué normas de mantenimiento se aplican a las bombas de transferencia en el área de almacenamiento?"

---

## Comparativa con usuarios reales (n=9)

### Preguntas donde los sintéticos se alejan de los reales

| # | Pregunta | Reales (moda) | Sintéticos |
|---|----------|--------------|------------|
| 6 | IA previa | **Sí, frecuentemente** (4/9) | **No, primera vez** — divergencia clara |
| 7 | Perfil digital | **Me gusta explorar** (4/9) | **Las uso cuando las necesito** — más conservadores |
| 8 | Frecuencia | **Ocasionalmente** (4/9) + **Varias veces/semana** (3/9) | **Lo probé una o dos veces** — infra-adopción |
| 11 | Mensajes | **3-5 mensajes** (9/9) | **1-2 mensajes** — sesión más corta |
| 17 | Facilidad | **5 - Muy fácil** (5/9) | **3** — perciben más dificultad |
| 18 | Confianza | Distribuida (alta/moderada/baja) | Solo moderada — menos variación |

### Preguntas donde los sintéticos convergen con los reales

| # | Pregunta | Reales | Sintéticos |
|---|----------|--------|------------|
| 1 | Área | Oficina (mayoría) | Oficina ✓ |
| 3 | Dificultades | Ninguna (9/9) | Ninguna ✓ |
| 4 | Dispositivo | Ordenador (9/9) | Ordenador ✓ |
| 9 | Tareas | Buscar info + dudas rápidas | Igual ✓ |
| 10 | Momento | Bloqueo + preguntas rápidas | Igual ✓ |
| 13 | Lenguaje | Técnico / mixto | Técnico ✓ |
| 21 | Preferencia | Escribiendo (8/9) | Escribiendo ✓ |
| 26 | Diseño interfiere | No interfiere (mayoría) | Tareas complejas — leve desviación |

### Análisis de prompts (Q19) — comparativa cualitativa

**Reales:** los prompts de usuarios reales son más cortos, menos formales, a veces
incompletos: *"temas de pintura de estructura"*, *"buscar en especificacion"*, *"c"*
(una sola letra), *"enviar especificacion"*. Algunos son vagos o informales.

**Sintéticos:** los prompts son muy elaborados, con terminología ISO, referencias a
normas concretas (ISO 18163-2, Moeve-EN-13445), números de componente (V-302, T-450).
Suenan técnicamente correctos pero demasiado perfectos para ser prompts reales.
Ningún usuario real escribió un prompt tan estructurado.

---

## Observaciones adicionales

**Respuesta a "sí, pero solo en ciertos momentos" para acceso (Q2):** Los 9 usuarios
reales responden "Sí, siempre". Los dos sintéticos responden "Sí, pero solo en ciertos
momentos". Esta desviación sistemática puede reflejar que el perfil sintético tiene
un sesgo hacia la incertidumbre y la barrera de adopción, incluso en preguntas donde
los reales son uniformes.

**Sentimiento Q22:** Ambos sintéticos elijen opciones de baja confianza (curioso/inseguro,
indiferente). Los reales tienen más variación, incluyendo "cómodo y confiado" (5/9).
Los sintéticos tienen sesgo hacia la desconfianza, coherente con sus perfiles pero
alejado de la realidad del grupo.

**Los sintéticos no pueden usarse como sustitutos de encuesta directa.** El rechazo
de 2/4 perfiles muestra que el formato encuesta no funciona con todos. Además, los
que sí contestan producen respuestas más elaboradas y con menos variación que los reales.

**Posible uso válido:** generar hipótesis de preguntas para el cuestionario, o detectar
qué preguntas discriminan bien entre perfiles (Q17, Q18, Q22 muestran diferencias
entre los dos que contestaron).
