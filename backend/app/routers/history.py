# Progumi/backend/app/routers/history.py
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import SessionLocal
from app.schemas.history import HistoryEntryResponse, QuizHistoryCreate
from app.dependencies import get_current_user, TokenData
from app import cruds

router = APIRouter()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@router.get("/history", response_model=list[HistoryEntryResponse])
def get_history(
    db: Session = Depends(get_db),
    current_user: TokenData = Depends(get_current_user),
):
    """
    GET /api/history
    ログイン中のユーザーの学習履歴を返します。認証が必要です。
    """
    return cruds.history.get_history_by_user_id(db, user_id=current_user.sub)


@router.post("/quiz/history", status_code=201)
def save_quiz_history(
    data: QuizHistoryCreate,
    db: Session = Depends(get_db),
    current_user: TokenData = Depends(get_current_user),
):
    """
    POST /api/quiz/history
    クイズの結果を保存します。
    """
    return cruds.history.create_quiz_history(db, user_id=current_user.sub, data=data)
