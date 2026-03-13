"""
Schema Pydantic para el endpoint de cuestionarios.
"""

from pydantic import BaseModel, Field, field_validator

MAX_QUESTIONS = 50


class QuestionnaireRequest(BaseModel):
    """
    Lista de preguntas a enviar al usuario sintético para respuesta conjunta.

    El sistema las agrupa en una única llamada al LLM para que las responda
    todas de una vez en orden numerado.
    """

    questions: list[str] = Field(
        ...,
        min_length=1,
        description="Lista de preguntas. Mínimo 1, máximo 50.",
    )

    @field_validator("questions")
    @classmethod
    def validate_questions(cls, questions: list[str]) -> list[str]:
        """Verifica que la lista no supere el máximo permitido y que no haya preguntas vacías."""
        if len(questions) > MAX_QUESTIONS:
            raise ValueError(f"Maximum {MAX_QUESTIONS} questions per questionnaire")

        # Eliminamos líneas vacías que pueden aparecer al parsear archivos .txt
        cleaned = [q.strip() for q in questions if q.strip()]
        if not cleaned:
            raise ValueError("Questions list cannot be empty")

        return cleaned


class QuestionnaireResponse(BaseModel):
    """Respuesta del usuario sintético al cuestionario completo."""

    session_id: str
    questionnaire_message: dict
    assistant_message: dict
