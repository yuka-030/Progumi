from fastapi import HTTPException
from sqlalchemy.orm import Session
from uuid import UUID
from app.models.quiz_result import QuizResult
from app.models.quiz_result_history import QuizResultHistory
from app.schemas.quiz_result import QuizResultCreate
from app.schemas.history import QuizHistoryCreate

def create_quiz_result(db: Session, result_data: QuizResultCreate):
    """DBにクイズ結果を保存する専門の関数"""
    try:
        # スキーマからモデルに変換
        # **result_data.model_dump() でモデルの各フィールドに値をセット
        new_result = QuizResult(**result_data.model_dump())
        
        db.add(new_result)
        db.commit()
        db.refresh(new_result)
        return new_result
        
    except Exception as e:
        # DBコミット失敗時に確実にロールバックし、DBの状態を保護する
        db.rollback()
        # 原因を明確にするため、HTTPExceptionを投げてフロントへ情報を伝える
        raise HTTPException(
            status_code=500, 
            detail=f"クイズ結果の保存に失敗しました: {str(e)}"
        )

def create_quiz_result_with_details(db: Session, result_data: QuizHistoryCreate, user_id: UUID):
    """履歴と詳細の回答をトランザクションで保存する関数"""
    try:
        # 親レコード（QuizResult）の作成
        new_result = QuizResult(
            user_id=user_id,
            score=result_data.score,
            total_questions=result_data.total_questions
        )
        db.add(new_result)
        db.flush()  # IDを取得するためにフラッシュ

        # 子レコード（各問題の回答結果）の保存
        for q in result_data.questions:
            detail = QuizResultHistory(
                quiz_result_id=new_result.id,
                question_id=q.quiz_question_id,
                is_correct=q.is_correct
            )
            db.add(detail)

        # 親子まとめてコミット
        db.commit()
        db.refresh(new_result)
        return new_result
        
    except Exception as e:
        # 失敗時はロールバック
        db.rollback()
        raise HTTPException(
            status_code=500, 
            detail=f"履歴と詳細の保存に失敗しました: {str(e)}"
        )