# Progumi/backend/app/main.py
from fastapi import FastAPI, Request, status, Depends
from fastapi.responses import JSONResponse
from fastapi.exceptions import HTTPException, RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordRequestForm
from pydantic import BaseModel, Field, EmailStr
from sqlalchemy.orm import Session
from app.schemas.user import UserSignUp
from app.routers import quiz_questions, quiz_results
from app.database import engine, Base, get_db
from app.routers import terms
from app.routers import history
from app.models.user import User
from app.routers import admin


# 「app/dependencies.py」から、セキュリティ用の共通関数をインポートします
from app.dependencies import (
    get_password_hash,  # パスワードを暗号化する関数
    verify_password,  # 入力されたパスワードと暗号化されたパスワードを比較する関数
    create_access_token,  # JWTトークン（暗号化されたログイン証明書）を発行する関数
)

import logging
import traceback

# 1. FastAPIアプリの初期化
# Swagger UI（ドキュメント画面）に表示されるタイトルや説明を設定しています。
app = FastAPI(
    title="Progumi API",
    description="用語集CRUD & クイズ機能のバックエンドAPI",
    version="1.0.0",
)

Base.metadata.create_all(bind=engine)


# 2. CORS（Cross-Origin Resource Sharing）の設定
# 開発中のフロントエンド（Next.jsなどのポート3000番）からのアクセスを許可するための設定です。
origins = [
    "http://localhost:3000",  # フロントエンドのローカル開発サーバーのアドレス
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,  # 許可するアクセス元（上記で定義したURL）
    allow_credentials=True,  # クッキーなどの認証情報を通信に含めることを許可
    allow_methods=["*"],  # すべてのHTTPメソッド（GET, POST, PUT, DELETEなど）を許可
    allow_headers=["*"],  # すべてのHTTPヘッダーを許可
    expose_headers=[
        "*"
    ],  # レスポンスヘッダーをフロントエンドから読み取れるように全て公開する
)

# 3. 共通エラーレスポンスの設定
# アプリの中でエラーが発生したときに、エラーの見た目（JSONの形）を統一するための仕組みです。


# ① 意図的なエラー（HTTPException）のハンドラ
@app.exception_handler(HTTPException)
async def custom_http_exception_handler(request: Request, exc: HTTPException):
    """
    アプリ内で HTTPException が発生したときに自動的に呼び出され、
    常に {"detail": "エラーメッセージ"} という決まった形でエラーを返します。
    """
    return JSONResponse(
        status_code=exc.status_code,  # 400や404などのエラー番号をそのまま引き継ぐ
        content={
            "error": {
                "code": "ERROR",
                "message": exc.detail,
            }
        },
    )


# ② 入力データの形式が違うエラー（RequestValidationError）のハンドラ
@app.exception_handler(RequestValidationError)
async def custom_request_validation_exception_handler(
    request: Request, exc: RequestValidationError
):
    """
    フロントエンドから送られてきたデータの形式が正しくない場合（422 Unprocessable Entity）に、
    常に {"detail": "エラーメッセージ"} の形で返します。
    これで開発中の予期せぬ500エラーを隠すことなく、フロントに必要なエラー形式を統一できます。
    """
    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,  # 422エラーを返す
        content={
            "error": {
                "code": "VALIDATION_ERROR",
                "message": "入力されたデータの形式が正しくありません。",
            }
        },
    )


# 🔐 --- 認証用 Pydanticモデル（データの型チェック用の枠組み） ---


class Token(BaseModel):
    """
    ログイン（/auth/login）が成功したときに、
    バックエンドからフロントエンドへ返却するデータの形を定義しています。
    """

    access_token: str  # 発行されたJWTトークン文字列そのもの
    token_type: str  # トークンの種類（通常は "bearer" 固定）
    role: str  # ログインしたユーザーの権限（フロント側で画面表示を切り替えるのに使用）


# 🗄️ --- 仮のユーザーデータベース（yukaさんとの合流まで使用する使い捨ての変数） ---
# 本物のデータベース（PostgreSQL）に接続するためのテーブル定義が yuka さん側で作成されている最中のため、
# 1人で開発・動作テストを進められるよう、プログラムのメモリ上にデータを一時保存する辞書を用意します。
fake_users_db = {}


# 🚀 --- 認証用エンドポイント（実際のURLの処理）の実装 ---


@app.post("/auth/signup", status_code=status.HTTP_201_CREATED)
def signup(
    user_data: UserSignUp,
    db: Session = Depends(get_db),
):
    """
    ユーザーの新規登録を行うAPIです。
    受け取ったパスワードを生の文字列（平文）のまま保存するのはセキュリティ上NGなため、
    ハッシュ化（暗号化）して解読不可能な状態にしてから仮DBに保存します。
    """
    # 1. 【重要】今回追加したメールアドレスの重複チェックロジック
    existing_user = db.query(User).filter(User.email == user_data.email).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="このメールアドレスは既に登録されています。",
        )

    # 2. パスワードをハッシュ化してDBに保存
    hashed_password = get_password_hash(user_data.password)
    new_user = User(
        name=user_data.name,
        email=user_data.email,
        password_hash=hashed_password,
        role=user_data.role,
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    return {"message": "ユーザー登録が完了しました。"}



@app.post("/auth/login", response_model=Token)
def login(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db),
):
    """
    ユーザーのログイン認証を行い、成功したらJWTトークン（会員証）を発行するAPIです。
    usersテーブル(email)を参照して認証します。
    Swagger UIの右上にある『Authorize（鍵マーク）』ボタンからログインしてテストできるように、
    FastAPI標準の OAuth2PasswordRequestForm（フォーム形式での入力受け取り）を使用しています。
    入力欄の「username」にはメールアドレスを入力してください。
    """
    # 1. 入力されたメールアドレスでusersテーブルを検索します
    user = db.query(User).filter(User.email == form_data.username).first()

    # 2. ユーザーが存在しない、または入力されたパスワードとDBの暗号化パスワードが一致しない場合は401エラー
    if not user or not verify_password(form_data.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="ユーザー名またはパスワードが正しくありません。",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # 3. 認証成功：トークンの中に「誰が（sub）」「どの権限（role）で」ログインしたかの情報を詰め込みます
    token_data = {"sub": str(user.id), "role": user.role}

    # 4. 有効期限付きのJWTトークン（暗号化された文字列）を生成します
    access_token = create_access_token(data=token_data)

    # 5. フロントエンド（またはSwagger UI）へトークン情報を返します
    return {"access_token": access_token, "token_type": "bearer", "role": user.role}


# 4. ルート（起動確認用）のエンドポイント
# ブラウザで http://localhost:8000/ にアクセスしたときに「動いているよ」と確認するためのものです。
@app.get("/")
def read_root():
    return {"message": "Hello Progumi API"}


# 5. エラー共通化のテスト用エンドポイント
# 今回作った「共通エラーレスポンス」が本当に正しく動くか、実験するためだけに作った使い捨てのボタンです。
# 意図的に「400 Bad Request」というエラーを発生させます。
@app.get("/test-error")
def test_error():
    raise HTTPException(
        status_code=status.HTTP_400_BAD_REQUEST,
        detail="これは共通化されたエラーメッセージのテストです。",
    )


# 5. エラー共通化のテスト用エンドポイント（不要なら削除してOKです）

# 全ての例外をキャッチするハンドラ
# @app.exception_handler(Exception)
# async def unhandled_exception_handler(request: Request, exc: Exception):


# 現在の debug_exception_handler を削除して、以下を貼り付けてください
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    # サーバーログには詳細なトレースバックを残す（開発・運用時のデバッグ用）
    logging.error("--- 予期せぬエラーが発生しました ---")
    logging.error(traceback.format_exc())

    # フロントエンドには内部情報を一切含まない汎用メッセージのみ返す
    # tracebackをそのまま返すとファイルパスや実装詳細が外部に漏洩するためNG
    return JSONResponse(
        status_code=500,
        content={
            "error": {
                "code": "INTERNAL_SERVER_ERROR",
                "message": "予期せぬエラーが発生しました。",
            }
        },
        headers={
            "Access-Control-Allow-Origin": "http://localhost:3000",  # このオリジン（フロント）からのアクセスを許可する
            "Access-Control-Allow-Credentials": "true",  # クッキーや認証情報を含むリクエストを許可する
        },
    )


#     """
#     予期せぬエラーが起きた時、何が起きたかをログに出力してから500エラーを返します。
#     """
#     # ログにエラーの「中身」を詳しく出力（これが一番重要です）
#     logging.error("--- エラー発生 ---")
#     logging.error(traceback.format_exc())

#     # フロントには簡潔なエラーを返す
#     return JSONResponse(
#         status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
#         content={
#             "error": {
#                 "code": "INTERNAL_SERVER_ERROR",
#                 "message": "予期せぬエラーが発生しました。",
#             }
#         },
#     )

# 6. 各機能のルーターを登録
# 機能ごとに分けて書いたエンドポイントをメインアプリに接続します。
app.include_router(terms.router)
app.include_router(quiz_questions.router, prefix="/api")
app.include_router(history.router, prefix="/api")
app.include_router(quiz_results.router, prefix="/api")
app.include_router(admin.router, prefix="/api")  # 管理者専用エンドポイント

# 7. サーバーの生存確認用エンドポイント
# フロントエンドや監視サービスが「このAPIサーバーが正常に起動しているか」を
# 確認するための窓口です。ここが正常に返答すれば、サーバーは稼働中と判断されます。


@app.get("/health")
def health_check():
    return {"status": "ok"}
