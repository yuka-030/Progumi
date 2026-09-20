# Progumi/backend/app/cruds/term.py
from sqlalchemy.orm import Session
from sqlalchemy.sql.expression import func
from app.models.term import Term
from app.schemas.term import TermCreate, TermUpdate


# 📋 --- 用語一覧取得 ---
def get_terms(db: Session, category: str = None, search: str = None):
    """
    用語一覧を取得します。
    category が指定された場合は、そのカテゴリーに絞り込んで返します。
    search が指定された場合は、用語名(term)に部分一致するもののみ返します(大文字・小文字は区別しません)。
    指定がない場合は全件返します。
    """
    query = db.query(Term)
    if category:
        query = query.filter(Term.category == category)
    if search:
        query = query.filter(Term.term.ilike(f"%{search}%"))
    return query.all()


# 🏷️ --- カテゴリー一覧取得 ---
def get_categories(db: Session):
    """
    登録されているカテゴリー名の一覧を重複なく返します。
    NULLのカテゴリーは除外します。
    """
    return [
        row[0] for row in db.query(Term.category).distinct().all() if row[0] is not None
    ]


# 🔍 --- 用語詳細取得 ---
def get_term_by_id(db: Session, term_id: str):
    """
    指定したIDの用語を取得します。
    存在しない場合はNoneを返します。
    """
    return db.query(Term).filter(Term.id == term_id).first()


# 🎲 --- ランダム用語取得 (補完機能付き) ---
def get_random_terms_by_category(db: Session, category: str, total_limit: int = 5):
    """指定したカテゴリから用語を取得。足りない場合は他カテゴリから補完して合計5つにする"""

    # 1. 指定カテゴリから取得
    terms = (
        db.query(Term)
        .filter(Term.category == category)
        .order_by(func.random())
        .limit(total_limit)
        .all()
    )

    # 2. 足りない分を計算
    needed = total_limit - len(terms)

    if needed > 0:
        # 他のカテゴリからランダムに取得
        additional_terms = (
            db.query(Term)
            .filter(Term.category != category)
            .order_by(func.random())
            .limit(needed)
            .all()
        )
        terms.extend(additional_terms)

    return terms


# ➕ --- 用語登録 ---
def create_term(db: Session, term_data: TermCreate):
    """
    新しい用語をDBに登録します。
    """
    term = Term(**term_data.model_dump())
    db.add(term)
    db.commit()
    db.refresh(term)
    return term


# ✏️ --- 用語更新 ---
def update_term(db: Session, term_id: str, term_data: "TermUpdate"):
    """
    指定したIDの用語を更新します。
    存在しない場合はNoneを返します。
    """
    term = db.query(Term).filter(Term.id == term_id).first()
    if not term:
        return None
    for key, value in term_data.model_dump().items():
        setattr(term, key, value)
    db.commit()
    db.refresh(term)
    return term


# 🗑️ --- 用語削除 ---
def delete_term(db: Session, term_id: str):
    """
    指定したIDの用語をDBから削除します。
    """
    term = db.query(Term).filter(Term.id == term_id).first()
    if term:
        db.delete(term)
        db.commit()
