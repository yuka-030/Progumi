from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.schemas.quiz_result import QuizResultCreate
from app.schemas.history import QuizHistoryCreate
from app.dependencies import get_current_user

# CRUD関数をインポート
from app.cruds.quiz_result import create_quiz_result, create_quiz_result_with_details

router = APIRouter()


@router.post("/quiz/results", status_code=status.HTTP_201_CREATED)
async def save_quiz_result(
    data: QuizResultCreate,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),  # JWTからuser_idを取得
):
    try:
        # データベース操作はCRUD層に丸投げ！
        new_result = create_quiz_result_with_details(db, data, current_user.id)
        return {"message": "結果を保存しました", "id": new_result.id}

    except Exception as e:
        # ここでロールバックを確実に実行（CRUD内でのコミット失敗時も安心）
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="クイズ結果の保存中に予期せぬエラーが発生しました。",
        )
