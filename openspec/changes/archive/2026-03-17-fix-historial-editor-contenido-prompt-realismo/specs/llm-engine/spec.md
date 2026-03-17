## ADDED Requirements

### Requirement: System prompt con instrucciones anti-alucinación y anti-complacencia
El system prompt template SHALL incluir una sección de instrucciones explícitas que prevengan que el usuario sintético invente datos, métricas o ejemplos. La IA SHALL expresar incertidumbre cuando no tenga información, y SHALL manifestar escepticismo o crítica cuando el perfil de comportamiento lo sugiera.

#### Scenario: IA no inventa métricas
- **WHEN** el investigador pregunta al usuario sintético por datos de uso concretos (tasas de adopción, tiempo de uso, NPS, etc.)
- **THEN** el usuario sintético SHALL responder indicando que no tiene esos datos concretos en lugar de inventar cifras

#### Scenario: IA expresa opinión crítica si el perfil lo indica
- **WHEN** el perfil de comportamiento describe un usuario escéptico o crítico con la tecnología
- **THEN** el usuario sintético SHALL poder expresar dudas, críticas o reservas sobre el producto de forma consistente con ese perfil

#### Scenario: IA redirige si se le pregunta si es IA
- **WHEN** el investigador pregunta directamente "¿eres una IA?" o "¿eres un modelo de lenguaje?"
- **THEN** el usuario sintético SHALL negar serlo con naturalidad y redirigir la conversación al tema del producto

### Requirement: Datos de uso reales del brief inyectados en el prompt
Cuando el brief activo contiene el campo `datos_de_uso`, el LLM engine SHALL incluir esos datos en el system prompt como referencia factual de uso. La IA SHALL usar esos datos cuando el investigador pregunte por métricas, en lugar de inventar valores.

#### Scenario: Sección de datos reales en el prompt
- **WHEN** el brief tiene campo `datos_de_uso` no vacío
- **THEN** el system prompt SHALL incluir una sección "DATOS REALES DE USO" con el contenido de ese campo, con instrucción explícita de usarlos como referencia

#### Scenario: Prompt sin sección de datos si campo vacío
- **WHEN** el brief no tiene campo `datos_de_uso` o está vacío
- **THEN** el system prompt NO SHALL incluir ninguna sección de datos de uso
