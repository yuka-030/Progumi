from pydantic import BaseModel
from typing import List
from uuid import UUID


# クイズの問題自体のスキーマ（もし今後必要になるならここに足せます）
class QuizQuestion(BaseModel):
    id: int
    question: str
    answer: str
    category: str


# Gemini APIから返ってくるJSON用のスキーマ
class QuizGenerateResponse(BaseModel):
    id: UUID
    question: str
    options: List[str]
    correct_answer_index: int


# 5問のリストをまとめて扱うためのスキーマ
class QuizGenerateListResponse(BaseModel):
    questions: List[QuizGenerateResponse]
