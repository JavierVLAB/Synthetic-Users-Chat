## ADDED Requirements

### Requirement: Campo datos_de_uso en briefs para datos reales
Los briefs SHALL soportar un campo opcional `datos_de_uso` de texto libre donde el investigador puede incluir métricas reales de adopción, patrones de uso, NPS, frecuencia de uso u otros datos cuantitativos. Este campo SHALL inyectarse en el system prompt del LLM como referencia factual que la IA debe priorizar sobre cualquier dato inventado.

#### Scenario: Brief con datos_de_uso influye en el prompt
- **WHEN** un brief contiene el campo `datos_de_uso` con contenido
- **THEN** el system prompt SHALL incluir una sección explícita con esos datos, indicando que son reales y deben usarse como referencia

#### Scenario: Brief sin datos_de_uso no añade sección
- **WHEN** un brief no contiene el campo `datos_de_uso` o está vacío
- **THEN** el system prompt NO SHALL incluir ninguna sección de datos de uso

#### Scenario: Campo datos_de_uso visible y editable en ContentViewerModal
- **WHEN** el usuario abre el ContentViewerModal de un brief
- **THEN** SHALL mostrarse el campo `datos_de_uso` junto al resto del contenido, editable si admin token disponible
