# Progumi/backend/app/cruds/history.py
from sqlalchemy.orm import Session, joinedload
from app.models.quiz_result import QuizResult
from app.models.quiz_result_history import QuizResultHistory
from app.models.quiz_question import QuizQuestion
from app.schemas.history import QuizHistoryCreate


def get_history_by_user_id(db: Session, user_id: str):
    """
    指定したユーザーのクイズ結果一覧を取得します。
    """
    results = (
        db.query(QuizResult)
        .filter(QuizResult.user_id == user_id)
        .options(
            joinedload(QuizResult.quiz_result_histories)
            .joinedload(QuizResultHistory.question)
            .joinedload(QuizQuestion.term)
        )
        .order_by(QuizResult.created_at.desc())
        .all()
    )

    history_entries = []
    for result in results:
        # 用語名と正誤情報をセットで返す
        studied_terms = [
            {
                "term": h.question.term.term,
                "is_correct": h.is_correct,
                "category": h.question.term.category,
            }
            for h in result.quiz_result_histories
            if h.question and h.question.term and h.question.term.term
        ]
        history_entries.append(
            {
                "quizResultId": result.id,
                "createdAt": result.created_at.isoformat(),
                "totalQuestions": result.total_questions,
                "correctAnswers": result.correct_answers,
                "score": result.score,
                "studiedTerms": studied_terms,
            }
        )

    return history_entries


def create_quiz_history(db: Session, user_id: str, data: QuizHistoryCreate):
    """
    トランザクションを用いて、クイズ結果と回答履歴を保存します。
    """
    try:
        # 1. 親テーブル (QuizResult) 作成
        new_result = QuizResult(
            user_id=user_id,
            score=data.score,
            total_questions=data.total_questions,
            correct_answers=len([q for q in data.questions if q.is_correct]),
        )
        db.add(new_result)
        db.flush()  # IDを取得するために反映

        # 2. 子テーブル (QuizResultHistory) 保存
        for q in data.questions:
            history = QuizResultHistory(
                quiz_result_id=new_result.id,
                question_id=q.quiz_question_id,
                is_correct=q.is_correct,
                selected_choice=q.selected_choice,
            )
            db.add(history)

        db.commit()
        db.refresh(new_result)
        return new_result
    except Exception:
        db.rollback()
        raise
