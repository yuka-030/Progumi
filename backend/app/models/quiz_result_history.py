# Progumi/backend/app/models/quiz_result_history.py
import uuid
from sqlalchemy import Column, Integer, Boolean, DateTime, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.database import Base


class QuizResultHistory(Base):
    __tablename__ = "quiz_result_histories"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    quiz_result_id = Column(
        UUID(as_uuid=True), ForeignKey("quiz_results.id"), nullable=False
    )
    question_id = Column(
        UUID(as_uuid=True), ForeignKey("quiz_questions.id"), nullable=False
    )
    selected_choice = Column(Integer, nullable=False)
    is_correct = Column(Boolean, nullable=False)
    created_at = Column(DateTime, server_default=func.now(), nullable=False)

    quiz_result = relationship("QuizResult", back_populates="quiz_result_histories")
    question = relationship("QuizQuestion", back_populates="quiz_result_histories")
