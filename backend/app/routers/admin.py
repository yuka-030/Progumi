# Progumi/backend/app/routers/admin.py
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.dependencies import get_db, verify_admin
from app.models.user import User
from app.models.term import Term
from app.schemas.term import TermCreate, TermResponse
from app import cruds

router = APIRouter()


# 📊 --- 統計情報取得エンドポイント（管理者専用） ---
@router.get("/admin/stats")
def get_stats(
    db: Session = Depends(get_db),
    _: str = Depends(verify_admin),
):
    """
    GET /admin/stats
    管理者ダッシュボード用の統計情報を返します。
    管理者ロール以外のアクセスは403を返します。
    """
    total_users = db.query(func.count(User.id)).scalar()
    total_terms = db.query(func.count(Term.id)).scalar()

    return {
        "totalUsers": total_users,
        "totalTerms": total_terms,
    }


# ➕ --- 用語登録エンドポイント（管理者専用） ---
@router.post("/admin/terms", response_model=TermResponse, status_code=201)
def create_term(
    term_data: TermCreate,
    db: Session = Depends(get_db),
    _: str = Depends(verify_admin),  # 管理者ロールのみ実行可能
):
    """
    POST /api/admin/terms
    新しい用語を登録します。
    管理者ロール以外のアクセスは403を返します。
    """
    return cruds.term.create_term(db, term_data)
