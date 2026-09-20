# Progumi/backend/app/routers/quiz_questions.py
from datetime import date
from fastapi import APIRouter, Cookie, Depends, HTTPException, Query, Response
from sqlalchemy.orm import Session
from starlette.concurrency import run_in_threadpool
from app.database import get_db
from app.cruds.quiz_question import generate_and_save_quizzes, get_random_terms
from app.dependencies import get_optional_user
from app.models.quiz_daily_count import QuizDailyCount
from app.schemas.quiz_question import QuizGenerateListResponse
import uuid

router = APIRouter(prefix="/quiz")

# 1日あたりの上限回数
GUEST_LIMIT = 1
MEMBER_LIMIT = 3


# 残り挑戦回数を取得するエンドポイント
@router.get("/remaining")
def get_remaining(
    response: Response,
    db: Session = Depends(get_db),
    current_user=Depends(get_optional_user),
    guest_token: str | None = Cookie(default=None, alias="quiz_guest_token"),
):
    """
    GET /api/quiz/remaining
    本日の残り挑戦回数を返します。
    会員はuser_idで管理、ゲストはCookieのguest_tokenで管理します。
    """
    today = date.today()

    if current_user:
        # 会員：user_idで本日のカウントを取得
        limit = MEMBER_LIMIT
        record = (
            db.query(QuizDailyCount)
            .filter(
                QuizDailyCount.user_id == current_user.sub,
                QuizDailyCount.date == today,
            )
            .first()
        )
        count = record.count if record else 0
    else:
        # ゲスト：guest_tokenがなければ新規発行してCookieにセット
        limit = GUEST_LIMIT
        if not guest_token:
            guest_token = str(uuid.uuid4())
            response.set_cookie(
                key="quiz_guest_token",
                value=guest_token,
                httponly=False,  # フロントから読めるようにhttpOnly=False
                max_age=60 * 60 * 24,  # 1日
            )
        record = (
            db.query(QuizDailyCount)
            .filter(
                QuizDailyCount.guest_token == guest_token,
                QuizDailyCount.date == today,
            )
            .first()
        )
        count = record.count if record else 0

    remaining = max(0, limit - count)
    return {
        "remaining": remaining,
        "limit": limit,
        "is_member": current_user is not None,
    }


# categoryを任意(None)にすることで、全件ランダムにも対応
@router.post("/generate", response_model=QuizGenerateListResponse)
async def generate_quizzes(
    response: Response,
    db: Session = Depends(get_db),
    current_user=Depends(get_optional_user),
    guest_token: str | None = Cookie(default=None, alias="quiz_guest_token"),
    category: str = Query(
        None, description="クイズのカテゴリ絞り込み（指定なしで全件ランダム）"
    ),
):
    """
    POST /api/quiz/generate
    クイズを生成します。回数制限を超えている場合は429を返します。
    回数の消費はクイズ生成成功後にのみ確定します。
    """
    today = date.today()

    if current_user:
        # 会員：user_idで本日のカウントを確認・更新
        limit = MEMBER_LIMIT
        record = (
            db.query(QuizDailyCount)
            .filter(
                QuizDailyCount.user_id == current_user.sub,
                QuizDailyCount.date == today,
            )
            .first()
        )
        if record:
            if record.count >= limit:
                raise HTTPException(
                    status_code=429,
                    detail="本日の挑戦回数の上限に達しました。明日また挑戦してください。",
                )
            record.count += 1
        else:
            record = QuizDailyCount(
                user_id=current_user.sub,
                date=today,
                count=1,
            )
            db.add(record)
    else:
        # ゲスト：guest_tokenがなければ新規発行
        limit = GUEST_LIMIT
        if not guest_token:
            guest_token = str(uuid.uuid4())
            response.set_cookie(
                key="quiz_guest_token",
                value=guest_token,
                httponly=False,
                max_age=60 * 60 * 24,
            )
        record = (
            db.query(QuizDailyCount)
            .filter(
                QuizDailyCount.guest_token == guest_token,
                QuizDailyCount.date == today,
            )
            .first()
        )
        if record:
            if record.count >= limit:
                raise HTTPException(
                    status_code=429,
                    detail="本日の挑戦回数の上限に達しました。明日また挑戦してください。",
                )
            record.count += 1
        else:
            record = QuizDailyCount(
                guest_token=uuid.UUID(guest_token),
                date=today,
                count=1,
            )
            db.add(record)

    # 1. DBから用語を5つ取得（db.commitはクイズ生成成功後に行う）
    terms = get_random_terms(db, category=category, limit=5)

    if not terms:
        raise HTTPException(
            status_code=404, detail="クイズ生成に必要な用語が見つかりませんでした"
        )

    # 2. AI通信とDB保存
    try:
        terms_data = []
        for t in terms:
            term_val = (
                t.get("term") if isinstance(t, dict) else getattr(t, "term", None)
            )
            desc_val = (
                t.get("description")
                if isinstance(t, dict)
                else getattr(t, "description", None)
            )
            terms_data.append({"id": t.id, "term": term_val, "description": desc_val})

        quiz_result = await run_in_threadpool(
            generate_and_save_quizzes, db=db, terms_data=terms_data
        )

        # クイズ生成成功後にのみcommitして回数を確定
        db.commit()

        return {"questions": quiz_result["questions"]}

    except Exception as e:
        # 生成失敗時はロールバックして回数を消費しない
        db.rollback()
        raise HTTPException(
            status_code=500,
            detail=f"クイズの一括生成中にエラーが発生しました: {str(e)}",
        )