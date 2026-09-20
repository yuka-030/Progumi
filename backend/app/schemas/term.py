# Progumi/backend/app/schemas/term.py
from uuid import UUID
from datetime import datetime
from pydantic import BaseModel


# 🗂️ --- 用語データの共通ベース ---
class TermBase(BaseModel):
    """
    用語データの共通フィールドを定義します。
    TermCreate と TermResponse の両方で使い回されます。
    """

    category: str  # 用語が属するカテゴリー（例: "基礎", "型定義"）
    term: str  # 用語名（例: "TypeScript"）
    description: str  # 用語の解説文


# 📝 --- 用語登録リクエストの型定義 ---
class TermCreate(TermBase):
    """
    POST /terms で受け取るリクエストボディの型定義です。
    TermBase をそのまま継承するだけでOKです（idやcreated_atはDB側で自動生成）。
    """

    pass


# ✏️ --- 用語更新リクエストの型定義 ---
class TermUpdate(TermBase):
    """
    PUT /terms/{id} で受け取るリクエストボディの型定義です。
    TermBase をそのまま継承します。
    """

    pass


# 📤 --- 用語レスポンスの型定義 ---
class TermResponse(TermBase):
    """
    GET /terms や POST /terms のレスポンスとして返すデータの型定義です。
    DBから取得したデータをそのままPydanticモデルに変換できるよう、
    from_attributes = True を設定しています。
    """

    id: UUID  # DBで自動生成されるUUID
    created_at: datetime  # レコード作成日時
    updated_at: datetime  # レコード更新日時

    class Config:
        from_attributes = True  # SQLAlchemyのモデルオブジェクトを直接変換可能にする設定
