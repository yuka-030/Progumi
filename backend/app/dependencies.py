import os
from datetime import datetime, timedelta, timezone
from typing import Optional
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from passlib.context import CryptContext
from dotenv import load_dotenv
from pydantic import BaseModel
from pydantic import ValidationError
from app.database import SessionLocal


class TokenData(BaseModel):
    sub: str  # ユーザーID「必須」にする
    role: str  # ロール 「必須」にする


# 🔐 セキュリティ用の基本設定
# トークンを暗号化するための秘密鍵（ローカル開発用）とアルゴリズム
load_dotenv()
SECRET_KEY = os.getenv("SECRET_KEY")
if not SECRET_KEY:
    raise ValueError("SECRET_KEYが.envに設定されていません！")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60  # 発行したトークンの有効期限（1時間）

# パスワードをハッシュ化（暗号化）するための仕組み（bcryptという強力な暗号方式を使用）
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# ログイン時や、この後の権限チェック時に「リクエストヘッダーから自動でトークンを抜き出す」ための共通設定
# tokenUrl="auth/login" を指定することで、Swagger UIがどこにログインを要請すればいいかを理解します
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/login")

# 🆕 認証なしでもアクセス可能にするための「任意」スキーム
# トークンが無い場合に401エラーを出さず、Noneを返すようにする
oauth2_scheme_optional = OAuth2PasswordBearer(tokenUrl="auth/login", auto_error=False)


# --- DB接続の共通依存関係 ---
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# --- 1. パスワード暗号化（ハッシュ化）関連の関数 ---


def get_password_hash(password: str) -> str:
    """
    パスワードのハッシュ化（暗号化）を行います。
    """
    return pwd_context.hash(password)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """
    ユーザーが入力した生のパスワードと、DBに保存されているハッシュ化されたパスワードを比較します。
    一致していれば True、違っていれば False を返します。
    ログイン（/auth/login）の検証で使用します。
    """
    return pwd_context.verify(plain_password, hashed_password)


# --- 2. JWTトークン発行関連の関数 ---


def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    """
    ユーザー情報を受け取り、有効期限（exp）を付け足した上で
    暗号化されたJWTトークンを生成して返します。
    """
    to_encode = data.copy()

    # 有効期限の計算（指定がなければ一律1時間）
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(
            minutes=ACCESS_TOKEN_EXPIRE_MINUTES
        )

    # トークンのデータ内に有効期限（exp）を混ぜ込む
    to_encode.update({"exp": expire})

    # 秘密鍵とアルゴリズムを使って署名（暗号化）し、トークン文字列を作成
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt


# --- 3. 認証 ✕ ロール管理（他のエンドポイントのガード用） ---


# 1. 会員（ログインが必須）
# ※先にこちらを定義すると、他の関数で再利用できます
async def get_current_user(token: str = Depends(oauth2_scheme)) -> TokenData:
    """
    ログイン中のユーザー情報を取得し、TokenDataモデルとして返します。
    """
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="ログインしてください。",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        # トークンを解読して中身を返す
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        # dictからTokenDataモデルに変換して返す
        return TokenData(**payload)
    except (JWTError, ValidationError) as e:
        raise credentials_exception


# 2. ゲスト対応（認証なしでも進める場合）
async def get_optional_user(
    token: Optional[str] = Depends(oauth2_scheme_optional),
) -> Optional[TokenData]:
    """
    ログインしていればユーザー情報を返し、していなければ None を返す。
    クイズ生成など、ゲストも会員もアクセスできる場所で使用します。
    """
    if not token:
        return None
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return TokenData(**payload)
    except (JWTError, ValidationError):
        # トークンが期限切れや不正な場合は None とする
        return None


# 3. ゲスト用ロール判定（get_current_userを利用）
# ※上記の get_current_user を利用してロールを抜き出します
async def get_current_user_role(user: TokenData = Depends(get_current_user)) -> str:
    role = user.role
    if role is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, detail="権限情報がありません"
        )
    return role


# 4. 管理者（特定の権限が必要）
async def verify_admin(role: str = Depends(get_current_user_role)):
    """
    ログインしている人が管理者（admin）かどうかをチェックする門番です。
    これをエンドポイントのDependsに入れると、そのエンドポイントは管理者専用になります。
    """
    if role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="この操作を行う権限がありません（管理者専用）。",
        )
    return role
