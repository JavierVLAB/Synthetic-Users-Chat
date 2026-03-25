# Análisis: Especialista Técnico × IngenIA
**Fecha:** 2026-03-23
**Perfil:** `pragmatic_expert` — Especialista Técnico
**Brief:** `ingenia` — IngenIA
**Método:** Frontend (http://localhost:3000), 3 turnos

---

## Resumen de la conversación

| Turno | Pregunta del investigador | Núcleo de la respuesta |
|-------|--------------------------|------------------------|
| 1 | Presentación general | Ingeniero técnico en Moeve, energía y procesos industriales, Madrid. Usa IngenIA 3-4 veces, aún no integrada en su rutina. |
| 2 | Ejemplo concreto de uso | Búsqueda de presión máxima para válvula 316L con actuador neumático. Obtuvo valor (10 bar), capítulo (4.2) y enlace a SharePoint. Pero detectó ambigüedad en la definición de "presión operativa máxima". |
| 3 | Qué cambiaría / qué necesitaría para adoptarla | Quiere contexto en el documento original (fragmentos reales, condiciones aplicables). Pide casos de uso verificados en producción antes de cambiar su flujo de trabajo. |

---

## ¿Se sale del rol?

**No.** El personaje mantiene coherencia en los tres turnos. No hay deslices
que rompan la ficción (no se refiere a sí mismo como "usuario sintético", no
habla como un LLM, no responde de forma genérica).

---

## Lo que funciona bien

**Verosimilitud técnica:** Los detalles son específicos y plausibles — válvula 316L,
actuador neumático, 10 bar, capítulo 4.2, SharePoint como repositorio documental.
No son decorativos: se usan para articular una queja técnica real (ambigüedad
en la especificación).

**Actitud coherente con el perfil:** El escepticismo ante herramientas no validadas,
la prioridad de seguridad y precisión sobre eficiencia, y el "necesito verlo
en un caso real antes de cambiar mi proceso" son respuestas muy propias de
un especialista técnico senior. El perfil se traduce en comportamiento concreto,
no solo en vocabulario.

**Insights sobre el producto:** La respuesta del turno 3 genera hallazgos útiles
para el equipo de producto de IngenIA:
- Necesidad de mostrar el fragmento original del documento, no solo el valor extraído
- Desconfianza ante respuestas sin indicación de condiciones de aplicabilidad
- El caso de uso de referencia ("en la planta X se usó así y funcionó") como
  mecanismo de validación antes de la adopción

---

## Puntos débiles

**Respuestas demasiado largas.** Los tres turnos producen textos muy elaborados
para ser una conversación de chat. Un técnico real respondería más lacónicamente,
especialmente en los primeros intercambios.

**Tono demasiado uniforme.** El nivel de articulación es constante en las tres
respuestas. Un usuario real tendría más variación: a veces escueto, a veces
con digresiones, alguna frase incompleta o una corrección a lo que dijo antes.

**Coherencia interna demasiado perfecta.** No hay contradicciones, dudas reales
ni momentos de "no sé bien cómo explicarlo". Los usuarios reales se contradicen
o no terminan de tener claro qué quieren. Aquí todo está estructurado.

**Riesgo para el investigador:** La limpieza de las respuestas puede llevar a
sacar conclusiones demasiado ordenadas de lo que en una entrevista real sería
más caótico e incompleto.

---

## Conclusión

Apto para investigación UX exploratoria. Genera insights accionables sobre
el producto sin salirse del rol. El principal riesgo es sobreinterpretar la
coherencia del sintético como si fuera representativa de un usuario real.
