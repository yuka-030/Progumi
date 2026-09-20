from fastapi import FastAPI, Request, status
from fastapi.responses import JSONResponse
from fastapi.exceptions import HTTPException, RequestValidationError
from fastapi.middleware.cors import CORSMiddleware

# 1. FastAPIアプリの初期化
# Swagger UI（ドキュメント画面）に表示されるタイトルや説明を設定しています。
app = FastAPI(
    title="Progumi API",
    description="用語集CRUD & クイズ機能のバックエンドAPI",
    version="1.0.0"
)

# 2. CORS（Cross-Origin Resource Sharing）の設定
# 開発中のフロントエンド（Next.jsなどのポート3000番）からのアクセスを許可するための設定です。
origins = [
    "http://localhost:3000",  # フロントエンドのローカル開発サーバーのアドレス
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,        # 許可するアクセス元（上記で定義したURL）
    allow_credentials=True,       # クッキーなどの認証情報を通信に含めることを許可
    allow_methods=["*"],          # すべてのHTTPメソッド（GET, POST, PUT, DELETEなど）を許可
    allow_headers=["*"],          # すべてのHTTPヘッダーを許可
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
        content={"detail": exc.detail},  # エラーの具体的な理由を {"detail": ...} に入れて返す
    )

# ② 入力データの形式が違うエラー（RequestValidationError）のハンドラ
@app.exception_handler(RequestValidationError)
async def custom_request_validation_exception_handler(request: Request, exc: RequestValidationError):
    """
    フロントエンドから送られてきたデータの形式が正しくない場合（422 Unprocessable Entity）に、
    常に {"detail": "エラーメッセージ"} の形で返します。
    """
    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,  # 422エラーを返す
        content={"detail": "入力されたデータの形式が正しくありません。"},
    )


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
        detail="これは共通化されたエラーメッセージのテストです。"
    )