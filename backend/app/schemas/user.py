# Progumi/backend/app/schemas/user.py
from pydantic import BaseModel, Field, EmailStr

class UserSignUp(BaseModel):
    name: str = Field(..., min_length=1, description="ユーザー名")
    email: EmailStr = Field(..., description="メールアドレス（形式チェック済み）")
    password: str = Field(..., min_length=8, description="パスワード（8文字以上）")
    role: str = Field("member", description="権限")
