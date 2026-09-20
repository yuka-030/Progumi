# Progumi/backend/app/models/quiz_question.py
import uuid
from sqlalchemy import Column, Text, Integer, DateTime, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.database import Base


class QuizQuestion(Base):
    __tablename__ = "quiz_questions"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    term_id = Column(UUID(as_uuid=True), ForeignKey("terms.id"), nullable=False)
    question = Column(Text, nullable=False)
    choice_1 = Column(Text, nullable=False)
    choice_2 = Column(Text, nullable=False)
    choice_3 = Column(Text, nullable=False)
    choice_4 = Column(Text, nullable=False)
    correct_choice = Column(Integer, nullable=False)
    created_at = Column(DateTime, server_default=func.now(), nullable=False)

    term = relationship("Term", back_populates="quiz_questions")
    quiz_result_histories = relationship("QuizResultHistory", back_populates="question")
