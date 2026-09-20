# Progumi/backend/app/models/quiz_daily_count.py
import uuid
from sqlalchemy import Column, Integer, Date, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.database import Base


class QuizDailyCount(Base):
    __tablename__ = "quiz_daily_counts"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    # 会員はuser_idで管理、ゲストはNULL
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=True)
    # ゲストはCookieのセッションIDで管理
    guest_token = Column(UUID(as_uuid=True), nullable=True)
    date = Column(Date, server_default=func.current_date(), nullable=False)
    count = Column(Integer, default=0, nullable=False)

    user = relationship("User", back_populates="quiz_daily_counts")