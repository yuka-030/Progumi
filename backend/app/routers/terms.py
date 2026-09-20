# Progumi/backend/app/routers/terms.py
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import Optional
from uuid import UUID
from app.database import SessionLocal
from app.schemas.term import TermCreate, TermResponse, TermUpdate
from app.dependencies import get_db, verify_admin
from app import cruds

router = APIRouter()


# 📋 --- 用語一覧取得エンドポイント ---
@router.get("/terms", response_model=list[TermResponse])
def get_terms(
    category: Optional[str] = None,
    search: Optional[str] = None,
    db: Session = Depends(get_db),
):
    """
    GET /terms
    登録されている用語の一覧を返します。
    クエリパラメータ category を指定すると、そのカテゴリーに絞り込んで返します。
    クエリパラメータ search を指定すると、用語名(term)に部分一致するもののみ返します。
    例) GET /terms?category=基礎&search=Type
    """
    return cruds.term.get_terms(db, category=category, search=search)


# 🏷️ --- カテゴリー一覧取得エンドポイント ---
@router.get("/terms/categories", response_model=list[str])
def get_categories(db: Session = Depends(get_db)):
    """
    GET /terms/categories
    登録されている用語のカテゴリー一覧を重複なく返します。
    """
    return cruds.term.get_categories(db)


# 🔍 --- 用語詳細取得エンドポイント ---
@router.get("/terms/{term_id}", response_model=TermResponse)
def get_term(term_id: UUID, db: Session = Depends(get_db)):
    """
    GET /terms/{term_id}
    指定したIDの用語を返します。
    存在しない場合は404を返します。
    """
    term = cruds.term.get_term_by_id(db, term_id=str(term_id))
    if term is None:
        raise HTTPException(status_code=404, detail="用語が見つかりませんでした。")
    return term


# ➕ --- 用語登録エンドポイント（管理者専用） ---
@router.post("/terms", response_model=TermResponse, status_code=201)
def create_term(
    term_data: TermCreate,
    db: Session = Depends(get_db),
    _: str = Depends(verify_admin),
):
    """
    POST /terms
    新しい用語を登録します。
    管理者ロール以外のアクセスは403を返します。
    """
    return cruds.term.create_term(db, term_data)


# ✏️ --- 用語更新エンドポイント（管理者専用） ---
@router.put("/terms/{term_id}", response_model=TermResponse)
def update_term(
    term_id: UUID,
    term_data: TermUpdate,
    db: Session = Depends(get_db),
    _: str = Depends(verify_admin),
):
    """
    PUT /terms/{term_id}
    指定したIDの用語を更新します。
    存在しない場合は404を返します。
    管理者ロール以外のアクセスは403を返します。
    """
    term = cruds.term.update_term(db, term_id=str(term_id), term_data=term_data)
    if term is None:
        raise HTTPException(status_code=404, detail="用語が見つかりませんでした。")
    return term


# 🗑️ --- 用語削除エンドポイント（管理者専用） ---
@router.delete("/terms/{term_id}", status_code=204)
def delete_term(
    term_id: UUID,
    db: Session = Depends(get_db),
    _: str = Depends(verify_admin),
):
    """
    DELETE /terms/{term_id}
    指定したIDの用語を削除します。
    存在しない場合は404を返します。
    管理者ロール以外のアクセスは403を返します。
    """
    term = cruds.term.get_term_by_id(db, term_id=str(term_id))
    if term is None:
        raise HTTPException(status_code=404, detail="用語が見つかりませんでした。")
    cruds.term.delete_term(db, term_id=str(term_id))
