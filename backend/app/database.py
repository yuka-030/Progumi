# Progumi/backend/app/database.py
from sqlalchemy import create_engine, text
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from dotenv import load_dotenv
import os
import time
import logging

# ロガー設定
logger = logging.getLogger(__name__)

# .envファイルから環境変数を読み込む
load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")

if not DATABASE_URL:
    raise ValueError("DATABASE_URL が設定されていません。.env を確認してください。")

engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


# コンテナ起動直後など、DBの準備ができるまで待機する関数
def wait_for_db(retries: int = 10, delay: int = 5):
    for i in range(retries):
        try:
            with engine.connect() as conn:
                conn.execute(text("SELECT 1"))
            logger.info("DB接続成功")
            return
        except Exception as e:
            logger.warning(f"DB接続待機中... ({i + 1}/{retries}): {e}")
            time.sleep(delay)
    raise RuntimeError("DBへの接続に失敗しました。")


# FastAPIが各リクエストごとにDB接続を管理するための関数
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
