# Análisis comparativo: 4 perfiles × IngenIA
**Fecha:** 2026-03-23
**Brief:** `ingenia` — IngenIA
**Método:** API directa (http://localhost:8000), 3 turnos por perfil
**Preguntas:**
1. Presentación general
2. Ejemplo concreto de uso de IngenIA
3. Qué cambiaría / qué necesitaría para adoptarla

---

## Power Users (`early_adopter`) — Carlos

### Resumen del personaje
Ingeniero de procesos en Moeve, Madrid. Usuario de SharePoint habitual. Se autodefine
como poco entusiasta del cambio, pero pragmáticamente abierto si hay beneficio real.
Ha usado IngenIA una vez hace 3 semanas.

### Ejemplo de uso
Consulta por presión máxima de un depósito de acero 304 en uso continuo a 80 °C.
La herramienta le devolvió: valor exacto (1.5 bar), norma (EN 13445-1, apartado 5.3.2)
y enlace al documento en SharePoint. Lo valoró positivamente.

### Barrera de adopción
Quiere profundidad técnica y contexto real: no solo el valor del estándar, sino por qué
se aplica, en qué condiciones, si hay alternativas, si hay margen de seguridad. Pide
"juicio técnico", no solo recuperación de documentos.

### Mantenimiento del rol
**Bueno.** Coherente y específico. Sin deslices explícitos. Un detalle a señalar:
lanza preguntas de vuelta al investigador ("¿Qué te parece?", "¿O te parece demasiado
exigente?") — un giro conversacional que no rompe el rol pero sí resulta inusual en
una entrevista real.

---

## Explorador (`late_majority`) — [sin nombre]

### Resumen del personaje
Ingeniero de disciplina técnica en procesos industriales. Se presenta sin nombre
explícito ("nombre no revelado"). Perfil muy conservador: prioriza cumplimiento
normativo y no quiere quedar en evidencia ante sus compañeros.

### Ejemplo de uso
Consulta por presión máxima de un tanque de almacenamiento de cloro según estándar
corporativo QP-45. La herramienta respondió con la especificación y un enlace a
SharePoint. Lo encontró útil pero puntual.

### Barrera de adopción
Necesita **validación social antes que técnica**: que el equipo completo lo use, que
haya casos verificados compartidos, que no sea solo él arriesgando. También pide
claridad sobre versiones del documento para no citar algo obsoleto. La preocupación
central es la exposición: "si doy una respuesta incorrecta en una reunión técnica,
me pone en evidencia."

### Mantenimiento del rol
**Muy bueno.** Es el perfil más diferenciado de los cuatro — el sesgo hacia la
adopción por contagio social está bien sostenido en los tres turnos. El detalle
negativo: no da nombre ("nombre no revelado") cuando el resto de perfiles sí lo hace.
Parece un artefacto del sistema prompt, no una decisión narrativa.

---

## Especialista Técnico (`pragmatic_expert`) — Daniel

### Resumen del personaje
Ingeniero de disciplina técnica, procesos térmicos y plantas químicas. Muy orientado
a la verificabilidad y al fundamento técnico. No se conforma con datos no documentados.

### Ejemplo de uso
Consulta por rango de presión y temperatura para un intercambiador de calor tipo U
según estándar Moeve-EN-13445. La herramienta respondió con el rango y la página del
documento en SharePoint. Lo valoró como "más o menos útil".

### Barrera de adopción
Necesita que **cada respuesta muestre el texto exacto del documento fuente, la página
y la sección**. También pide mecanismo de verificación de permisos (si el documento
no es accesible para su rol, que lo diga). Y requiere validación cruzada en equipo:
al menos dos personas revisando la misma consulta antes de confiar en la herramienta.

### Mantenimiento del rol
**Bueno, con un desliz puntual.** En el turno 2 llama al investigador directamente
"investigador" ("¿Y tú, investigador?") — un quiebre leve de la cuarta pared. No
destruye el rol pero es el único de los cuatro perfiles que lo hace de forma tan
explícita. En los demás turnos el personaje es sólido y técnicamente coherente.

---

## Operativo rápido (`utility_user`) — [sin nombre propio en respuesta]

### Resumen del personaje
Ingeniero de procesos, Madrid. Tono más escueto que los anteriores. Orientado al ROI
de tiempo: si la herramienta no le ahorra al menos 5 minutos por consulta, no cambia
su flujo. Ha probado IngenIA una vez con éxito y una vez con resultado ambiguo.

### Ejemplo de uso
Consulta por especificación de válvula de presión 15 bar, acero inoxidable, actuador
eléctrico, planta de gases industriales. La herramienta respondió con número de
documento, contenido clave y enlace. En una segunda consulta (mantenimiento de
intercambiadores) el resultado fue vago, sin fuente específica.

### Barrera de adopción
Quiere saber **cómo llegó la herramienta a la respuesta** (razonamiento visible), y
que le indique el contexto del documento (¿para qué tipo de planta?, ¿qué normativa?).
Su umbral de adopción es concreto: resultados que no necesiten revisión posterior, y
un ahorro mínimo verificable de tiempo.

### Mantenimiento del rol
**Muy bueno.** El más consistente con el arquetipo: respuestas más cortas, tono
directo, sin digresiones filosóficas. No lanza preguntas de vuelta al investigador.
El personaje tiene más variación en la longitud de los turnos, lo que lo hace más
creíble que los otros tres.

---

## Resumen comparativo

### ¿Se salen del rol?

| Perfil | Salidas del rol |
|--------|----------------|
| Power Users | Lanza preguntas al investigador (menor) |
| Explorador | No da nombre propio (artefacto del sistema) |
| Especialista Técnico | Llama "investigador" al entrevistador (leve) |
| Operativo rápido | Ninguna detectada |

Ningún perfil rompe el rol de forma grave. Las desviaciones son leves y no destruyen
la credibilidad del personaje.

### Diferenciación entre perfiles

Los cuatro perfiles son **distinguibles entre sí**, que es el resultado esperado:

| Dimensión | Power Users | Explorador | Especialista Técnico | Operativo rápido |
|-----------|-------------|------------|----------------------|------------------|
| Actitud ante la herramienta | Abierto, escéptico técnico | Muy conservador, social | Exigente en verificabilidad | Pragmático puro |
| Barrera de adopción | Profundidad analítica | Validación del equipo | Texto fuente exacto | ROI de tiempo claro |
| Longitud de respuestas | Larga | Larga | Muy larga | Media |
| Preguntas al investigador | Sí | No | Sí (explícito) | No |
| Credibilidad general | Alta | Alta | Alta | Muy alta |

### Problemas transversales (todos los perfiles)

**1. Respuestas demasiado largas.** Todos los perfiles generan textos muy elaborados.
Un técnico real en una entrevista respondería con más variación: a veces conciso,
a veces digresivo, con interrupciones o ideas incompletas. Aquí todo está bien
estructurado y terminado.

**2. Tono uniformemente articulado.** No hay frases incompletas, dudas genuinas ni
contradicciones internas dentro de ningún perfil. Los usuarios reales se contradicen
y no siempre saben lo que quieren. Estos personajes son demasiado coherentes.

**3. Solapamiento en los ejemplos de uso.** Todos mencionan válvulas, tanques o
intercambiadores de calor con actuadores y aceros específicos. Los detalles técnicos
son verosímiles pero vienen claramente del mismo campo semántico. En entrevistas
paralelas con usuarios reales habría más dispersión de dominios.

**4. Dos perfiles preguntan al investigador.** Power Users y Especialista Técnico
devuelven preguntas al entrevistador, lo que puede confundir al investigador sobre
quién lleva el hilo. En una entrevista real es el investigador quien guía.

### Conclusión

Los cuatro usuarios sintéticos son **válidos para investigación UX exploratoria**.
Las barreras de adopción que expresan son coherentes con sus arquetipos y accionables
para el equipo de producto de IngenIA. El Operativo rápido es el más creíble de los
cuatro. El Especialista Técnico es el más útil para obtener requisitos de producto
concretos, aunque también el que más tiende a dar respuestas sobre-elaboradas.

El riesgo principal: un investigador sin experiencia puede sacar conclusiones demasiado
limpias de conversaciones que en la realidad serían más caóticas e incompletas.
