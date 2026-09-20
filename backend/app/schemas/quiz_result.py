from pydantic import BaseModel
from uuid import UUID

class QuizResultCreate(BaseModel):
    user_id: UUID
    total_questions: int
    correct_answers: int
    score: int

    class Config:
        from_attributes = True