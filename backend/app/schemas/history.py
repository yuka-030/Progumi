# Progumi/backend/app/schemas/history.py
from pydantic import BaseModel
from uuid import UUID
from datetime import datetime


# 用語名と正誤情報をセットで返す型
class StudiedTermResponse(BaseModel):
    term: str        # 用語名
    is_correct: bool # 正誤判定
    category: str # カテゴリ名

    class Config:
        from_attributes = True


class HistoryEntryResponse(BaseModel):
    quizResultId: UUID
    createdAt: datetime
    totalQuestions: int
    correctAnswers: int
    score: int
    studiedTerms: list[StudiedTermResponse]  # 用語名と正誤情報のセット

    class Config:
        from_attributes = True


class QuizResultQuestionCreate(BaseModel):
    quiz_question_id: str  # フロントのidがundefinedになるケースの対策
    is_correct: bool
    selected_choice: int


class QuizHistoryCreate(BaseModel):
    score: int
    total_questions: int
    questions: list[QuizResultQuestionCreate]
